import Phaser from 'phaser';
import type { GameMapDefinition, MapPoint } from '../maps/floor1Map';
import { isCircleBlocked } from './MapCollision';

type NavigationNode = {
  position: Phaser.Math.Vector2;
  neighbors: number[];
};

const GRID_SPACING = 48;
const MAX_CONNECTION_DISTANCE = GRID_SPACING * 1.55;
const PATH_SAMPLE_SPACING = 8;

export class NavigationGraph {
  private readonly map: GameMapDefinition;
  private readonly radius: number;
  private readonly nodes: NavigationNode[];
  private readonly outerPolygon: Phaser.Geom.Polygon;

  constructor(map: GameMapDefinition, radius: number, importantPoints: MapPoint[]) {
    this.map = map;
    this.radius = radius;
    this.outerPolygon = this.createOuterPolygon();
    this.nodes = this.createNodes(importantPoints);
    this.connectNodes();
  }

  getDirection(position: Phaser.Math.Vector2, target: Phaser.Math.Vector2): Phaser.Math.Vector2 | null {
    if (this.isPathClear(position, target)) {
      return target.clone().subtract(position);
    }

    const startIndex = this.findClosestVisibleNode(position);
    const targetIndex = this.findClosestVisibleNode(target);

    if (startIndex === -1 || targetIndex === -1) {
      return null;
    }

    const nextIndex = this.findNextNode(startIndex, targetIndex);
    return nextIndex === -1 ? null : this.nodes[nextIndex].position.clone().subtract(position);
  }

  private createOuterPolygon(): Phaser.Geom.Polygon {
    const points = this.map.wallSegments
      .filter((segment) => segment.id.startsWith('outer-wall-'))
      .map((segment) => ({ x: segment.from.x, y: segment.from.y }));

    return new Phaser.Geom.Polygon(points);
  }

  private createNodes(importantPoints: MapPoint[]): NavigationNode[] {
    const positions: Phaser.Math.Vector2[] = [];

    for (let y = GRID_SPACING; y < this.map.dimensions.height; y += GRID_SPACING) {
      for (let x = GRID_SPACING; x < this.map.dimensions.width; x += GRID_SPACING) {
        const position = new Phaser.Math.Vector2(x, y);
        if (this.isValidNode(position)) {
          positions.push(position);
        }
      }
    }

    for (const point of importantPoints) {
      const position = new Phaser.Math.Vector2(point.x, point.y);
      if (this.isValidNode(position)) {
        positions.push(position);
      }
    }

    return positions.map((position) => ({ position, neighbors: [] }));
  }

  private connectNodes(): void {
    for (let left = 0; left < this.nodes.length; left += 1) {
      for (let right = left + 1; right < this.nodes.length; right += 1) {
        const distance = Phaser.Math.Distance.BetweenPoints(
          this.nodes[left].position,
          this.nodes[right].position,
        );

        if (distance <= MAX_CONNECTION_DISTANCE && this.isPathClear(this.nodes[left].position, this.nodes[right].position)) {
          this.nodes[left].neighbors.push(right);
          this.nodes[right].neighbors.push(left);
        }
      }
    }
  }

  private findClosestVisibleNode(position: Phaser.Math.Vector2): number {
    let closestIndex = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < this.nodes.length; index += 1) {
      const distance = Phaser.Math.Distance.BetweenPoints(position, this.nodes[index].position);
      if (distance < closestDistance && this.isPathClear(position, this.nodes[index].position)) {
        closestIndex = index;
        closestDistance = distance;
      }
    }

    return closestIndex;
  }

  private findNextNode(startIndex: number, targetIndex: number): number {
    if (startIndex === targetIndex) {
      return targetIndex;
    }

    const distances = new Array<number>(this.nodes.length).fill(Number.POSITIVE_INFINITY);
    const previous = new Array<number>(this.nodes.length).fill(-1);
    const visited = new Set<number>();
    distances[startIndex] = 0;

    while (visited.size < this.nodes.length) {
      let current = -1;
      let currentDistance = Number.POSITIVE_INFINITY;

      for (let index = 0; index < distances.length; index += 1) {
        if (!visited.has(index) && distances[index] < currentDistance) {
          current = index;
          currentDistance = distances[index];
        }
      }

      if (current === -1 || current === targetIndex) {
        break;
      }

      visited.add(current);

      for (const neighbor of this.nodes[current].neighbors) {
        const candidateDistance =
          currentDistance +
          Phaser.Math.Distance.BetweenPoints(this.nodes[current].position, this.nodes[neighbor].position);

        if (candidateDistance < distances[neighbor]) {
          distances[neighbor] = candidateDistance;
          previous[neighbor] = current;
        }
      }
    }

    if (previous[targetIndex] === -1) {
      return -1;
    }

    let next = targetIndex;
    while (previous[next] !== startIndex && previous[next] !== -1) {
      next = previous[next];
    }
    return next;
  }

  private isValidNode(position: Phaser.Math.Vector2): boolean {
    return (
      this.outerPolygon.contains(position.x, position.y) &&
      !isCircleBlocked(position.x, position.y, this.radius, this.map.collisionRects, this.map.wallSegments)
    );
  }

  private isPathClear(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): boolean {
    const distance = Phaser.Math.Distance.BetweenPoints(from, to);
    const steps = Math.max(1, Math.ceil(distance / PATH_SAMPLE_SPACING));

    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      const x = Phaser.Math.Linear(from.x, to.x, progress);
      const y = Phaser.Math.Linear(from.y, to.y, progress);

      if (
        !this.outerPolygon.contains(x, y) ||
        isCircleBlocked(x, y, this.radius, this.map.collisionRects, this.map.wallSegments)
      ) {
        return false;
      }
    }

    return true;
  }
}
