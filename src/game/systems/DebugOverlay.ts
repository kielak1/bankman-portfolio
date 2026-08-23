import Phaser from 'phaser';
import type { GameMapDefinition, MapRect, MapWallSegment } from '../maps/floor1Map';

export class DebugOverlay {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private visible = false;

  constructor(scene: Phaser.Scene, map: GameMapDefinition) {
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(20);
    this.draw(map);
    this.graphics.setVisible(this.visible);
  }

  get isVisible(): boolean {
    return this.visible;
  }

  toggle(): void {
    this.visible = !this.visible;
    this.graphics.setVisible(this.visible);
  }

  private draw(map: GameMapDefinition): void {
    this.graphics.clear();
    this.drawRects(map.collisionRects, 0xff3d71, 0.22, 0.75);
    this.drawWallSegments(map.wallSegments);
    this.drawRects(map.spawnZones, 0x2689ff, 0.2, 0.9);

    this.graphics.fillStyle(0x65ffd8, 0.95);
    this.graphics.fillCircle(map.playerStart.x, map.playerStart.y, 7);

    this.graphics.lineStyle(2, 0x65ffd8, 0.7);
    this.graphics.strokeRect(0, 0, map.dimensions.width, map.dimensions.height);
  }

  private drawRects(rects: MapRect[], color: number, alpha: number, strokeAlpha: number): void {
    this.graphics.lineStyle(2, color, strokeAlpha);
    this.graphics.fillStyle(color, alpha);

    for (const rect of rects) {
      this.graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
      this.graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  private drawWallSegments(segments: MapWallSegment[]): void {
    this.graphics.lineStyle(5, 0xff3d71, 0.9);

    for (const segment of segments) {
      this.graphics.lineBetween(segment.from.x, segment.from.y, segment.to.x, segment.to.y);
    }
  }
}
