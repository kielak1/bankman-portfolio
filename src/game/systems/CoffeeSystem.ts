import Phaser from 'phaser';
import type { MapPoint } from '../maps/floor1Map';

const FIRST_SPAWN_SECONDS = 18;
const RESPAWN_SECONDS = 28;
const ACTIVE_SECONDS = 14;
const COLLECT_RADIUS = 28;

export class CoffeeSystem {
  private readonly spawnPoints: MapPoint[];
  private readonly marker: Phaser.GameObjects.Graphics;
  private activePoint: MapPoint | null = null;
  private nextSpawnAt = FIRST_SPAWN_SECONDS;
  private expiresAt = 0;

  constructor(scene: Phaser.Scene, spawnPoints: MapPoint[]) {
    this.spawnPoints = spawnPoints.filter((_, index) => index % 3 === 1);
    this.marker = scene.add.graphics().setDepth(22).setVisible(false);
  }

  update(elapsedSeconds: number, playerPosition?: Phaser.Math.Vector2): boolean {
    if (!this.activePoint && elapsedSeconds >= this.nextSpawnAt) {
      this.spawn(elapsedSeconds);
    }

    if (!this.activePoint) {
      return false;
    }

    if (elapsedSeconds >= this.expiresAt) {
      this.hide(elapsedSeconds);
      return false;
    }

    this.draw(elapsedSeconds);

    if (
      playerPosition &&
      Phaser.Math.Distance.Between(playerPosition.x, playerPosition.y, this.activePoint.x, this.activePoint.y) <= COLLECT_RADIUS
    ) {
      this.hide(elapsedSeconds);
      return true;
    }

    return false;
  }

  private spawn(elapsedSeconds: number): void {
    this.activePoint = Phaser.Math.RND.pick(this.spawnPoints);
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
    const { x, y } = this.activePoint;
    this.marker.clear();
    this.marker.lineStyle(3, 0x07100f, 0.95);
    this.marker.strokeCircle(x, y, 18 + pulse * 3);
    this.marker.lineStyle(2, 0xfff3b0, 0.65 + pulse * 0.35);
    this.marker.strokeCircle(x, y, 16 + pulse * 3);
    this.marker.fillStyle(0x6f4e37, 1);
    this.marker.fillRoundedRect(x - 9, y - 8, 16, 16, 4);
    this.marker.lineStyle(2, 0xfff3b0, 1);
    this.marker.strokeRoundedRect(x - 9, y - 8, 16, 16, 4);
    this.marker.strokeCircle(x + 8, y, 5);
    this.marker.lineBetween(x - 4, y - 12, x - 1, y - 17);
    this.marker.lineBetween(x + 2, y - 12, x + 5, y - 17);
  }
}
