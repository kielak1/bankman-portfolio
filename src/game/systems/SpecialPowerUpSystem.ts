import Phaser from 'phaser';
import type { MapPoint } from '../maps/floor1Map';

export type SpecialPowerUpType = 'admin' | 'working';

const FIRST_SPAWN_SECONDS = 12;
const RESPAWN_SECONDS = 22;
const ACTIVE_SECONDS = 22;
const COLLECT_RADIUS = 28;

export class SpecialPowerUpSystem {
  private readonly spawnPoints: MapPoint[];
  private readonly marker: Phaser.GameObjects.Graphics;
  private activePoint: MapPoint | null = null;
  private activeType: SpecialPowerUpType = 'admin';
  private nextType: SpecialPowerUpType = 'admin';
  private nextSpawnAt = FIRST_SPAWN_SECONDS;
  private expiresAt = 0;

  constructor(scene: Phaser.Scene, spawnPoints: MapPoint[]) {
    this.spawnPoints = spawnPoints.filter((_, index) => index % 4 === 2);
    this.marker = scene.add.graphics().setDepth(22).setVisible(false);
  }

  update(elapsedSeconds: number, playerPosition?: Phaser.Math.Vector2): SpecialPowerUpType | null {
    if (!this.activePoint && elapsedSeconds >= this.nextSpawnAt) {
      this.spawn(elapsedSeconds);
    }

    if (!this.activePoint) {
      return null;
    }

    if (elapsedSeconds >= this.expiresAt) {
      this.hide(elapsedSeconds);
      return null;
    }

    this.draw(elapsedSeconds);

    if (
      playerPosition &&
      Phaser.Math.Distance.Between(playerPosition.x, playerPosition.y, this.activePoint.x, this.activePoint.y) <= COLLECT_RADIUS
    ) {
      const collectedType = this.activeType;
      this.hide(elapsedSeconds);
      return collectedType;
    }

    return null;
  }

  private spawn(elapsedSeconds: number): void {
    this.activePoint = Phaser.Math.RND.pick(this.spawnPoints);
    this.activeType = this.nextType;
    this.nextType = this.nextType === 'admin' ? 'working' : 'admin';
    this.expiresAt = elapsedSeconds + ACTIVE_SECONDS;
    this.marker.setVisible(true);
  }

  private hide(elapsedSeconds: number): void {
    this.activePoint = null;
    this.nextSpawnAt = elapsedSeconds + RESPAWN_SECONDS;
    this.marker.setVisible(false);
  }

  private draw(elapsedSeconds: number): void {
    if (!this.activePoint) {
      return;
    }

    const pulse = (Math.sin(elapsedSeconds * 5) + 1) / 2;
    const color = this.activeType === 'admin' ? 0x4da6ff : 0x65ffd8;
    const labelColor = this.activeType === 'admin' ? 0xffffff : 0x07100f;
    const { x, y } = this.activePoint;

    this.marker.clear();
    this.marker.lineStyle(3, 0x07100f, 0.95);
    this.marker.strokeCircle(x, y, 19 + pulse * 3);
    this.marker.lineStyle(2, color, 0.65 + pulse * 0.35);
    this.marker.strokeCircle(x, y, 17 + pulse * 3);
    this.marker.fillStyle(color, 1);
    this.marker.fillCircle(x, y, 12);
    this.marker.lineStyle(2, labelColor, 1);

    if (this.activeType === 'admin') {
      this.marker.lineBetween(x - 6, y, x + 6, y);
      this.marker.lineBetween(x, y - 6, x, y + 6);
    } else {
      this.marker.strokeCircle(x, y, 6);
      this.marker.lineBetween(x, y, x + 4, y - 4);
    }
  }
}
