import Phaser from 'phaser';
import type { MapPoint } from '../maps/floor1Map';

type Ticket = {
  id: string;
  point: MapPoint;
  marker: Phaser.GameObjects.Graphics;
  collected: boolean;
  phase: number;
};

export class TicketSystem {
  private readonly tickets: Ticket[];
  private collectedCount = 0;
  private elapsedSeconds = 0;

  constructor(scene: Phaser.Scene, points: MapPoint[]) {
    this.tickets = points.map((point, index) => ({
      id: point.id,
      point,
      marker: this.createTicketMarker(scene, point),
      collected: false,
      phase: index * 0.45,
    }));
  }

  get collected(): number {
    return this.collectedCount;
  }

  get total(): number {
    return this.tickets.length;
  }

  update(deltaSeconds: number): void {
    this.elapsedSeconds += deltaSeconds;

    for (const ticket of this.tickets) {
      if (!ticket.collected) {
        this.drawTicketMarker(ticket.marker, ticket.point, ticket.phase);
      }
    }
  }

  updateCollector(position: Phaser.Math.Vector2, radius: number): number {
    let collectedNow = 0;

    for (const ticket of this.tickets) {
      if (ticket.collected) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(position.x, position.y, ticket.point.x, ticket.point.y);

      if (distance <= radius) {
        ticket.collected = true;
        ticket.marker.setVisible(false);
        this.collectedCount += 1;
        collectedNow += 1;
      }
    }

    return collectedNow;
  }

  private createTicketMarker(scene: Phaser.Scene, point: MapPoint): Phaser.GameObjects.Graphics {
    const marker = scene.add.graphics();
    marker.setDepth(20);
    this.drawTicketMarker(marker, point, 0);
    return marker;
  }

  private drawTicketMarker(marker: Phaser.GameObjects.Graphics, point: MapPoint, phase: number): void {
    const pulse = (Math.sin(this.elapsedSeconds * 4 + phase) + 1) / 2;
    const haloRadius = 15 + pulse * 4;

    marker.clear();
    marker.lineStyle(3, 0x07100f, 0.95);
    marker.strokeCircle(point.x, point.y, haloRadius + 2);
    marker.lineStyle(2, 0xdfff4f, 0.45 + pulse * 0.45);
    marker.strokeCircle(point.x, point.y, haloRadius);
    marker.fillStyle(0xdfff4f, 1);
    marker.fillRoundedRect(point.x - 10, point.y - 8, 20, 16, 4);
    marker.lineStyle(2, 0x07100f, 1);
    marker.strokeRoundedRect(point.x - 10, point.y - 8, 20, 16, 4);
    marker.lineBetween(point.x - 5, point.y - 3, point.x + 5, point.y - 3);
    marker.lineBetween(point.x - 5, point.y + 2, point.x + 3, point.y + 2);
  }
}
