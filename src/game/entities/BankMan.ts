import Phaser from 'phaser';
import type { GameMapDefinition } from '../maps/floor1Map';
import { movePlayerCircle } from '../systems/MapCollision';

type MovementInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

type BankManConfig = {
  x: number;
  y: number;
  radius: number;
  speed: number;
};

export type BankManVisualState = {
  stress: number;
  coffeeActive: boolean;
  adminActive: boolean;
  workingActive: boolean;
  locked: boolean;
  fridayActive: boolean;
};

const PKO_NAVY = 0x003b7a;
const PKO_BLUE = 0x009fe3;
const PKO_LIGHT_BLUE = 0x63c9f2;
const PKO_WHITE = 0xffffff;
const PKO_RED = 0xe30613;
const LOCKED_GRAY = 0x91a0ad;
const MOUTH_COLOR = 0x07100f;

export class BankMan {
  private readonly marker: Phaser.GameObjects.Graphics;
  private readonly radius: number;
  private readonly speed: number;
  private position: Phaser.Math.Vector2;
  private facingAngle = 0;
  private moving = false;

  constructor(scene: Phaser.Scene, config: BankManConfig) {
    this.radius = config.radius;
    this.speed = config.speed;
    this.position = new Phaser.Math.Vector2(config.x, config.y);
    this.marker = scene.add.graphics();
    this.marker.setDepth(30);
    this.draw(0, {
      stress: 0,
      coffeeActive: false,
      adminActive: false,
      workingActive: false,
      locked: false,
      fridayActive: false,
    });
  }

  get x(): number {
    return this.position.x;
  }

  get y(): number {
    return this.position.y;
  }

  get bounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      this.position.x - this.radius,
      this.position.y - this.radius,
      this.radius * 2,
      this.radius * 2,
    );
  }

  getPosition(): Phaser.Math.Vector2 {
    return this.position.clone();
  }

  update(
    deltaSeconds: number,
    input: MovementInput,
    map: GameMapDefinition,
    speedMultiplier = 1,
  ): void {
    const direction = new Phaser.Math.Vector2(
      Number(input.right) - Number(input.left),
      Number(input.down) - Number(input.up),
    );

    if (direction.lengthSq() === 0) {
      this.moving = false;
      return;
    }

    direction.normalize();
    this.facingAngle = direction.angle();
    const previousPosition = this.position.clone();
    direction.scale(this.speed * speedMultiplier * deltaSeconds);
    movePlayerCircle(this.position, direction, this.radius, map);
    this.moving = Phaser.Math.Distance.BetweenPoints(previousPosition, this.position) > 0.01;
  }

  updateVisual(timeSeconds: number, state: BankManVisualState): void {
    this.draw(timeSeconds, state);
  }

  private draw(timeSeconds: number, state: BankManVisualState): void {
    const pulse = (Math.sin(timeSeconds * 7) + 1) / 2;
    const mouthAngle = this.moving ? 0.12 + Math.abs(Math.sin(timeSeconds * 12)) * 0.42 : 0.08;
    const stressRatio = Phaser.Math.Clamp(state.stress / 100, 0, 1);
    const bodyColor = state.locked
      ? LOCKED_GRAY
      : Phaser.Display.Color.GetColor(
          Phaser.Math.Linear(0, 227, stressRatio),
          Phaser.Math.Linear(159, 6, stressRatio),
          Phaser.Math.Linear(227, 19, stressRatio),
        );
    const ringColor = state.fridayActive ? PKO_RED : state.adminActive ? PKO_LIGHT_BLUE : PKO_BLUE;
    const ringAlpha = state.fridayActive || state.adminActive ? 0.65 + pulse * 0.35 : 0.3 + pulse * 0.15;
    const x = this.position.x;
    const y = this.position.y;

    this.marker.clear();

    if (state.coffeeActive && this.moving) {
      this.drawMotionTrail(x, y);
    }

    this.marker.lineStyle(state.fridayActive ? 3 : 2, ringColor, ringAlpha);
    this.marker.strokeCircle(x, y, this.radius + 7 + pulse * 2);

    if (state.adminActive) {
      this.marker.lineStyle(2, PKO_LIGHT_BLUE, 0.85);
      this.marker.strokeCircle(x, y, this.radius + 12);
      this.drawAccessTicks(x, y, timeSeconds);
    }

    if (state.workingActive) {
      this.drawWorkingSpinner(x, y, timeSeconds);
    }

    this.marker.fillStyle(PKO_NAVY, 1);
    this.marker.fillCircle(x, y, this.radius + 2);
    this.marker.lineStyle(2, PKO_WHITE, 0.95);
    this.marker.fillStyle(bodyColor, 1);
    this.marker.fillCircle(x, y, this.radius);
    this.marker.strokeCircle(x, y, this.radius);

    this.marker.fillStyle(MOUTH_COLOR, 1);
    this.marker.fillTriangle(
      x,
      y,
      x + Math.cos(this.facingAngle - mouthAngle) * (this.radius + 2),
      y + Math.sin(this.facingAngle - mouthAngle) * (this.radius + 2),
      x + Math.cos(this.facingAngle + mouthAngle) * (this.radius + 2),
      y + Math.sin(this.facingAngle + mouthAngle) * (this.radius + 2),
    );

    this.drawBankMark(x, y, state);
  }

  private drawBankMark(x: number, y: number, state: BankManVisualState): void {
    const markAngle = this.facingAngle + Math.PI / 2;
    const markX = x + Math.cos(markAngle) * 5;
    const markY = y + Math.sin(markAngle) * 5;
    const color = state.locked ? PKO_NAVY : PKO_WHITE;

    this.marker.lineStyle(2, color, 0.95);

    if (state.adminActive) {
      this.marker.lineBetween(markX - 4, markY - 3, markX, markY);
      this.marker.lineBetween(markX, markY, markX - 4, markY + 3);
      this.marker.lineBetween(markX + 1, markY + 4, markX + 6, markY + 4);
      return;
    }

    if (state.locked) {
      this.marker.strokeRect(markX - 4, markY - 1, 8, 7);
      this.marker.strokeCircle(markX, markY - 2, 4);
      return;
    }

    this.marker.lineBetween(markX - 3, markY - 6, markX - 3, markY + 6);
    this.marker.lineBetween(markX - 3, markY - 5, markX + 3, markY - 3);
    this.marker.lineBetween(markX + 3, markY - 3, markX - 3, markY);
    this.marker.lineBetween(markX - 3, markY, markX + 4, markY + 3);
    this.marker.lineBetween(markX + 4, markY + 3, markX - 3, markY + 5);
  }

  private drawMotionTrail(x: number, y: number): void {
    const behind = this.facingAngle + Math.PI;

    for (let index = 1; index <= 3; index += 1) {
      const distance = this.radius + index * 7;
      this.marker.fillStyle(PKO_LIGHT_BLUE, 0.5 / index);
      this.marker.fillCircle(
        x + Math.cos(behind) * distance,
        y + Math.sin(behind) * distance,
        Math.max(2, 5 - index),
      );
    }
  }

  private drawAccessTicks(x: number, y: number, timeSeconds: number): void {
    for (let index = 0; index < 4; index += 1) {
      const angle = timeSeconds * 2.5 + index * (Math.PI / 2);
      const inner = this.radius + 9;
      const outer = this.radius + 14;
      this.marker.lineBetween(
        x + Math.cos(angle) * inner,
        y + Math.sin(angle) * inner,
        x + Math.cos(angle) * outer,
        y + Math.sin(angle) * outer,
      );
    }
  }

  private drawWorkingSpinner(x: number, y: number, timeSeconds: number): void {
    for (let index = 0; index < 6; index += 1) {
      const angle = -timeSeconds * 2 + index * (Math.PI / 3);
      this.marker.fillStyle(PKO_WHITE, 0.18 + index * 0.12);
      this.marker.fillCircle(
        x + Math.cos(angle) * (this.radius + 12),
        y + Math.sin(angle) * (this.radius + 12),
        2,
      );
    }
  }
}
