import Phaser from 'phaser';
import type { GameMapDefinition, MapRect } from '../maps/floor1Map';
import { isCircleBlocked, moveCircle } from './MapCollision';
import { NavigationGraph } from './NavigationGraph';

type EnemyType = 'manager' | 'business' | 'audit' | 'security';

type Enemy = {
  type: EnemyType;
  marker: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  message: Phaser.GameObjects.Text;
  position: Phaser.Math.Vector2;
  direction: Phaser.Math.Vector2;
  releasePosition: Phaser.Math.Vector2;
  releaseAt: number;
  released: boolean;
  turnAt: number;
  contactReadyAt: number;
  trailAt: number;
  messageReadyAt: number;
  messageUntil: number;
};

type StressZone = {
  position: Phaser.Math.Vector2;
  expiresAt: number;
};

export type EnemyEffects = {
  stressDelta: number;
  lockSeconds: number;
  threat: string;
  difficultyLevel: number;
};

const RADIUS = 12;
const DIFFICULTY_INTERVAL_SECONDS = 45;
const MAX_DIFFICULTY_LEVEL = 4;
const ENEMY_TYPES: EnemyType[] = ['manager', 'business', 'audit', 'security'];
const SPEEDS: Record<EnemyType, number> = { manager: 55, business: 95, audit: 68, security: 78 };
const ENEMY_COLORS: Record<EnemyType, number> = {
  manager: 0xffc857,
  business: 0xff4d6d,
  audit: 0xb388ff,
  security: 0x4da6ff,
};
const ENEMY_LABELS: Record<EnemyType, string> = {
  manager: 'MGR',
  business: 'BIZ',
  audit: 'AUD',
  security: 'SEC',
};
const ENEMY_MESSAGES: Record<EnemyType, string[]> = {
  manager: ['QUICK CALL?', 'NEED UPDATE', 'LET US SYNC'],
  business: ['ASAP!', 'HIGH PRIORITY', 'JUST ONE CHANGE'],
  audit: ['AUDIT FINDING', 'EVIDENCE?', 'CONTROL GAP'],
  security: ['ACCESS DENIED', 'POLICY VIOLATION', 'SESSION LOCKED'],
};

export class EnemySystem {
  private readonly enemies: Enemy[];
  private readonly map: GameMapDefinition;
  private readonly navigationGraph: NavigationGraph;
  private readonly stressZoneLayer: Phaser.GameObjects.Graphics;
  private readonly stressZones: StressZone[] = [];

  constructor(scene: Phaser.Scene, map: GameMapDefinition) {
    this.map = map;
    this.navigationGraph = new NavigationGraph(map, RADIUS + 2, [
      map.playerStart,
      ...map.ticketPoints,
    ]);
    this.stressZoneLayer = scene.add.graphics().setDepth(15);
    const spawnPlan = [
      ...map.spawnZones.map((_, index) => ({
        zoneIndex: index,
        type: ENEMY_TYPES[index % ENEMY_TYPES.length],
        releaseAt: 2 + index * 2,
      })),
      { zoneIndex: 1, type: 'business' as EnemyType, releaseAt: DIFFICULTY_INTERVAL_SECONDS },
      { zoneIndex: 2, type: 'manager' as EnemyType, releaseAt: DIFFICULTY_INTERVAL_SECONDS * 2 },
      { zoneIndex: 3, type: 'security' as EnemyType, releaseAt: DIFFICULTY_INTERVAL_SECONDS * 3 },
    ];

    this.enemies = spawnPlan.map(({ zoneIndex, type, releaseAt }) => {
      const zone = map.spawnZones[zoneIndex];
      const position = new Phaser.Math.Vector2(zone.x + zone.width / 2, zone.y + zone.height / 2);
      const marker = scene.add.graphics().setDepth(25).setVisible(false);
      const label = scene.add
        .text(0, 0, ENEMY_LABELS[type], {
          color: '#07100f',
          fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
          fontSize: '8px',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(26)
        .setVisible(false);
      const message = scene.add
        .text(0, 0, '', {
          color: '#d8fff7',
          fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
          fontSize: '9px',
          fontStyle: 'bold',
          backgroundColor: '#07100fee',
          padding: { x: 5, y: 3 },
        })
        .setOrigin(0.5, 1)
        .setDepth(28)
        .setVisible(false);

      return {
        type,
        marker,
        label,
        message,
        position,
        direction: new Phaser.Math.Vector2(1, 0),
        releasePosition: this.findReleasePosition(zone),
        releaseAt,
        released: false,
        turnAt: 0,
        contactReadyAt: 0,
        trailAt: 0,
        messageReadyAt: 0,
        messageUntil: 0,
      };
    });
  }

  get activeCount(): number {
    return this.enemies.filter((enemy) => enemy.released).length;
  }

  update(
    deltaSeconds: number,
    elapsedSeconds: number,
    playerPosition?: Phaser.Math.Vector2,
    speedModifier = 1,
    stressModifier = 1,
    playerProtected = false,
  ): EnemyEffects {
    const difficultyLevel = this.getDifficultyLevel(elapsedSeconds);
    const speedMultiplier = 1 + (difficultyLevel - 1) * 0.12;
    const stressMultiplier = 1 + (difficultyLevel - 1) * 0.15;
    const effects: EnemyEffects = { stressDelta: 0, lockSeconds: 0, threat: '-', difficultyLevel };

    for (const enemy of this.enemies) {
      if (!enemy.released && elapsedSeconds >= enemy.releaseAt) {
        enemy.position.copy(enemy.releasePosition);
        enemy.released = true;
        enemy.marker.setVisible(true);
        enemy.label.setVisible(true);
      }

      if (enemy.released) {
        this.updateDirection(enemy, elapsedSeconds, playerProtected ? undefined : playerPosition);
        const delta = enemy.direction
          .clone()
          .normalize()
          .scale(SPEEDS[enemy.type] * speedMultiplier * speedModifier * deltaSeconds);
        const movement = moveCircle(enemy.position, delta, RADIUS, this.map);

        if ((!movement.movedX && Math.abs(delta.x) > 0.01) || (!movement.movedY && Math.abs(delta.y) > 0.01)) {
          this.turnAfterCollision(enemy, elapsedSeconds);
        }

        if (enemy.type === 'audit' && elapsedSeconds >= enemy.trailAt) {
          this.stressZones.push({ position: enemy.position.clone(), expiresAt: elapsedSeconds + 8 });
          enemy.trailAt = elapsedSeconds + 2.5;
        }

        if (playerPosition && !playerProtected) {
          this.updateCorporateMessage(enemy, playerPosition, elapsedSeconds);
          this.applyContactEffects(enemy, playerPosition, deltaSeconds, elapsedSeconds, effects);
        }
      }

      if (enemy.released) {
        this.drawEnemy(enemy);
      }
    }

    this.updateStressZones(elapsedSeconds, playerProtected ? undefined : playerPosition, deltaSeconds, effects);
    effects.stressDelta *= stressMultiplier * stressModifier;
    return effects;
  }

  banishNear(position: Phaser.Math.Vector2, elapsedSeconds: number, radius: number): number {
    let banished = 0;

    for (const enemy of this.enemies) {
      if (!enemy.released || Phaser.Math.Distance.BetweenPoints(enemy.position, position) > radius) {
        continue;
      }

      enemy.released = false;
      enemy.releaseAt = elapsedSeconds + 10;
      enemy.marker.setVisible(false);
      enemy.label.setVisible(false);
      enemy.message.setVisible(false);
      banished += 1;
    }

    return banished;
  }

  private getDifficultyLevel(elapsedSeconds: number): number {
    return Math.min(MAX_DIFFICULTY_LEVEL, Math.floor(elapsedSeconds / DIFFICULTY_INTERVAL_SECONDS) + 1);
  }

  private updateCorporateMessage(
    enemy: Enemy,
    playerPosition: Phaser.Math.Vector2,
    elapsedSeconds: number,
  ): void {
    const distance = Phaser.Math.Distance.BetweenPoints(enemy.position, playerPosition);
    if (distance <= 150 && elapsedSeconds >= enemy.messageReadyAt) {
      enemy.message.setText(Phaser.Math.RND.pick(ENEMY_MESSAGES[enemy.type])).setVisible(true);
      enemy.messageUntil = elapsedSeconds + 2.4;
      enemy.messageReadyAt = elapsedSeconds + Phaser.Math.FloatBetween(6, 10);
    }

    if (enemy.message.visible && elapsedSeconds >= enemy.messageUntil) {
      enemy.message.setVisible(false);
    }
  }

  private applyContactEffects(
    enemy: Enemy,
    playerPosition: Phaser.Math.Vector2,
    deltaSeconds: number,
    elapsedSeconds: number,
    effects: EnemyEffects,
  ): void {
    if (Phaser.Math.Distance.BetweenPoints(enemy.position, playerPosition) > RADIUS + 15) {
      return;
    }

    effects.threat = ENEMY_LABELS[enemy.type];

    if (enemy.type === 'manager') {
      effects.stressDelta += 18 * deltaSeconds;
      return;
    }

    if (elapsedSeconds < enemy.contactReadyAt) {
      return;
    }

    if (enemy.type === 'business') {
      effects.stressDelta += 28;
      enemy.contactReadyAt = elapsedSeconds + 3;
    } else if (enemy.type === 'audit') {
      effects.stressDelta += 12;
      enemy.contactReadyAt = elapsedSeconds + 2;
    } else {
      effects.stressDelta += 8;
      effects.lockSeconds = 1.5;
      enemy.contactReadyAt = elapsedSeconds + 4;
    }
  }

  private updateStressZones(
    elapsedSeconds: number,
    playerPosition: Phaser.Math.Vector2 | undefined,
    deltaSeconds: number,
    effects: EnemyEffects,
  ): void {
    for (let index = this.stressZones.length - 1; index >= 0; index -= 1) {
      if (this.stressZones[index].expiresAt <= elapsedSeconds) {
        this.stressZones.splice(index, 1);
      }
    }

    this.stressZoneLayer.clear();
    this.stressZoneLayer.lineStyle(2, ENEMY_COLORS.audit, 0.45);
    this.stressZoneLayer.fillStyle(ENEMY_COLORS.audit, 0.12);

    for (const zone of this.stressZones) {
      this.stressZoneLayer.fillCircle(zone.position.x, zone.position.y, 34);
      this.stressZoneLayer.strokeCircle(zone.position.x, zone.position.y, 34);

      if (playerPosition && Phaser.Math.Distance.BetweenPoints(zone.position, playerPosition) <= 34) {
        effects.stressDelta += 8 * deltaSeconds;
        effects.threat = 'AUDIT ZONE';
      }
    }
  }

  private updateDirection(enemy: Enemy, elapsedSeconds: number, playerPosition?: Phaser.Math.Vector2): void {
    if (elapsedSeconds < enemy.turnAt) {
      return;
    }

    if (playerPosition && enemy.type !== 'audit') {
      const navigationDirection = this.navigationGraph.getDirection(enemy.position, playerPosition);
      if (navigationDirection) {
        enemy.direction.copy(navigationDirection);
        enemy.turnAt = elapsedSeconds + (enemy.type === 'business' ? 0.3 : 0.55);
        return;
      }
    }

    enemy.direction.set(Phaser.Math.RND.pick([-1, 0, 1]), Phaser.Math.RND.pick([-1, 0, 1]));
    if (enemy.direction.lengthSq() === 0) {
      enemy.direction.x = 1;
    }
    enemy.turnAt = elapsedSeconds + Phaser.Math.FloatBetween(1.5, 3.5);
  }

  private turnAfterCollision(enemy: Enemy, elapsedSeconds: number): void {
    if (enemy.type === 'audit') {
      enemy.direction.set(-enemy.direction.y, enemy.direction.x);
      return;
    }

    enemy.direction.set(Phaser.Math.RND.pick([-1, 0, 1]), Phaser.Math.RND.pick([-1, 0, 1]));
    if (enemy.direction.lengthSq() === 0) {
      enemy.direction.y = 1;
    }
    enemy.turnAt = elapsedSeconds + Phaser.Math.FloatBetween(0.6, 1.2);
  }

  private findReleasePosition(zone: MapRect): Phaser.Math.Vector2 {
    const centerX = zone.x + zone.width / 2;
    const centerY = zone.y + zone.height / 2;
    const margin = RADIUS + 8;
    const candidates = [
      new Phaser.Math.Vector2(centerX, zone.y + zone.height + margin),
      new Phaser.Math.Vector2(zone.x + zone.width + margin, centerY),
      new Phaser.Math.Vector2(centerX, zone.y - margin),
      new Phaser.Math.Vector2(zone.x - margin, centerY),
    ];

    return (
      candidates.find(
        (point) =>
          !isCircleBlocked(point.x, point.y, RADIUS, this.map.collisionRects, this.map.wallSegments),
      ) ?? new Phaser.Math.Vector2(this.map.playerStart.x, this.map.playerStart.y)
    );
  }

  private drawEnemy(enemy: Enemy): void {
    const color = ENEMY_COLORS[enemy.type];
    enemy.marker.clear();
    enemy.marker.lineStyle(1, color, 0.35);
    enemy.marker.strokeCircle(enemy.position.x, enemy.position.y, 18);
    enemy.marker.fillStyle(color, 0.9);
    enemy.marker.fillCircle(enemy.position.x, enemy.position.y, RADIUS);
    enemy.marker.lineStyle(2, 0x07100f, 0.9);
    enemy.marker.strokeCircle(enemy.position.x, enemy.position.y, 7);
    enemy.label.setPosition(enemy.position.x, enemy.position.y);
    enemy.message.setPosition(enemy.position.x, enemy.position.y - 20);
  }
}
