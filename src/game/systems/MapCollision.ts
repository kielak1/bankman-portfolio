import Phaser from 'phaser';
import type { GameMapDefinition, MapRect, MapWallSegment } from '../maps/floor1Map';

export type MoveResult = {
  movedX: boolean;
  movedY: boolean;
};

type MoveCandidate = {
  position: Phaser.Math.Vector2;
  forwardProgress: number;
  distance: number;
  clearance: number;
};

export function moveCircle(
  position: Phaser.Math.Vector2,
  delta: Phaser.Math.Vector2,
  radius: number,
  map: GameMapDefinition,
): MoveResult {
  const nextX = Phaser.Math.Clamp(position.x + delta.x, radius, map.dimensions.width - radius);
  const nextY = Phaser.Math.Clamp(position.y + delta.y, radius, map.dimensions.height - radius);
  const movedX = !isCircleBlocked(nextX, position.y, radius, map.collisionRects, map.wallSegments);

  if (movedX) {
    position.x = nextX;
  }

  const movedY = !isCircleBlocked(position.x, nextY, radius, map.collisionRects, map.wallSegments);

  if (movedY) {
    position.y = nextY;
  }

  return { movedX, movedY };
}

export function movePlayerCircle(
  position: Phaser.Math.Vector2,
  delta: Phaser.Math.Vector2,
  radius: number,
  map: GameMapDefinition,
): MoveResult {
  const start = position.clone();
  const direction = delta.clone().normalize();
  const directTarget = clampPosition(start.clone().add(delta), radius, map.dimensions);
  const blockedByRadiusOnly =
    isCircleBlocked(
      directTarget.x,
      directTarget.y,
      radius,
      map.collisionRects,
      map.wallSegments,
    ) &&
    !isCircleBlocked(
      directTarget.x,
      directTarget.y,
      0,
      map.collisionRects,
      map.wallSegments,
    );

  const candidates = [resolvePlayerMovement(start, delta, radius, map, direction)];

  if (blockedByRadiusOnly) {
    const perpendicular = new Phaser.Math.Vector2(-direction.y, direction.x);

    for (const sign of [-1, 1]) {
      const nudgedStart = clampPosition(
        start.clone().add(perpendicular.clone().scale(sign)),
        radius,
        map.dimensions,
      );

      if (
        !nudgedStart.equals(start) &&
        !isCircleBlocked(
          nudgedStart.x,
          nudgedStart.y,
          radius,
          map.collisionRects,
          map.wallSegments,
        )
      ) {
        candidates.push(resolvePlayerMovement(nudgedStart, delta, radius, map, direction));
      }
    }
  }

  const best = candidates.reduce((currentBest, candidate) =>
    isBetterCandidate(candidate, currentBest) ? candidate : currentBest,
  );
  position.copy(best.position);

  return {
    movedX: Math.abs(position.x - start.x) > 0.001,
    movedY: Math.abs(position.y - start.y) > 0.001,
  };
}

export function isCircleBlocked(
  x: number,
  y: number,
  radius: number,
  collisionRects: MapRect[],
  wallSegments: MapWallSegment[],
): boolean {
  const bounds = new Phaser.Geom.Rectangle(x - radius, y - radius, radius * 2, radius * 2);
  const blockedByRect = collisionRects.some((rect) =>
    Phaser.Geom.Intersects.RectangleToRectangle(
      bounds,
      new Phaser.Geom.Rectangle(rect.x, rect.y, rect.width, rect.height),
    ),
  );

  return blockedByRect || wallSegments.some((segment) => getDistanceToSegment(x, y, segment) <= radius);
}

function resolvePlayerMovement(
  start: Phaser.Math.Vector2,
  delta: Phaser.Math.Vector2,
  radius: number,
  map: GameMapDefinition,
  direction: Phaser.Math.Vector2,
): MoveCandidate {
  const movementCandidates = [delta.clone()];
  const target = clampPosition(start.clone().add(delta), radius, map.dimensions);

  for (const segment of map.wallSegments) {
    if (getDistanceToSegment(target.x, target.y, segment) > radius) {
      continue;
    }

    const tangent = new Phaser.Math.Vector2(
      segment.to.x - segment.from.x,
      segment.to.y - segment.from.y,
    );

    if (tangent.lengthSq() === 0) {
      continue;
    }

    tangent.normalize();
    const projectedLength = delta.dot(tangent);
    movementCandidates.push(tangent.scale(projectedLength));
  }

  movementCandidates.push(new Phaser.Math.Vector2(delta.x, 0));
  movementCandidates.push(new Phaser.Math.Vector2(0, delta.y));

  const candidates = movementCandidates.map((movement) =>
    createCandidate(start, movement, radius, map, direction),
  );

  return candidates.reduce((currentBest, candidate) =>
    isBetterCandidate(candidate, currentBest) ? candidate : currentBest,
  );
}

function createCandidate(
  start: Phaser.Math.Vector2,
  movement: Phaser.Math.Vector2,
  radius: number,
  map: GameMapDefinition,
  direction: Phaser.Math.Vector2,
): MoveCandidate {
  const target = clampPosition(start.clone().add(movement), radius, map.dimensions);

  if (
    isCircleBlocked(target.x, target.y, radius, map.collisionRects, map.wallSegments)
  ) {
    return {
      position: start.clone(),
      forwardProgress: 0,
      distance: 0,
      clearance: getClearance(start.x, start.y, radius, map),
    };
  }

  const actualMovement = target.clone().subtract(start);
  return {
    position: target,
    forwardProgress: actualMovement.dot(direction),
    distance: actualMovement.length(),
    clearance: getClearance(target.x, target.y, radius, map),
  };
}

function isBetterCandidate(candidate: MoveCandidate, currentBest: MoveCandidate): boolean {
  const progressDifference = candidate.forwardProgress - currentBest.forwardProgress;

  if (Math.abs(progressDifference) > 0.001) {
    return progressDifference > 0;
  }

  const clearanceDifference = candidate.clearance - currentBest.clearance;

  if (Math.abs(clearanceDifference) > 0.001) {
    return clearanceDifference > 0;
  }

  return candidate.distance > currentBest.distance;
}

function clampPosition(
  position: Phaser.Math.Vector2,
  radius: number,
  dimensions: GameMapDefinition['dimensions'],
): Phaser.Math.Vector2 {
  position.x = Phaser.Math.Clamp(position.x, radius, dimensions.width - radius);
  position.y = Phaser.Math.Clamp(position.y, radius, dimensions.height - radius);
  return position;
}

function getClearance(
  x: number,
  y: number,
  radius: number,
  map: GameMapDefinition,
): number {
  let clearance = Math.min(
    x - radius,
    y - radius,
    map.dimensions.width - radius - x,
    map.dimensions.height - radius - y,
  );

  for (const segment of map.wallSegments) {
    clearance = Math.min(clearance, getDistanceToSegment(x, y, segment) - radius);
  }

  return clearance;
}

function getDistanceToSegment(x: number, y: number, segment: MapWallSegment): number {
  const ax = segment.from.x;
  const ay = segment.from.y;
  const abx = segment.to.x - ax;
  const aby = segment.to.y - ay;
  const lengthSquared = abx * abx + aby * aby;

  if (lengthSquared === 0) {
    return Phaser.Math.Distance.Between(x, y, ax, ay);
  }

  const t = Phaser.Math.Clamp(((x - ax) * abx + (y - ay) * aby) / lengthSquared, 0, 1);
  return Phaser.Math.Distance.Between(x, y, ax + abx * t, ay + aby * t);
}
