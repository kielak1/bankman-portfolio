import Phaser from 'phaser';
import { ASSET_KEYS } from '../assets';
import { BankMan } from '../entities/BankMan';
import { announceGameFinished } from '../gameEvents';
import { FLOOR1_MAP } from '../maps/floor1Map';
import { DebugOverlay } from '../systems/DebugOverlay';
import { CoffeeSystem } from '../systems/CoffeeSystem';
import { EnemySystem } from '../systems/EnemySystem';
import { InputController } from '../systems/InputController';
import { RoomSystem, type RoomEvent, type RoomId } from '../systems/RoomSystem';
import { SoundSystem } from '../systems/SoundSystem';
import { SpecialPowerUpSystem } from '../systems/SpecialPowerUpSystem';
import { TicketSystem } from '../systems/TicketSystem';
import { DebugHud } from '../../ui/DebugHud';
import { EventFeedback } from '../../ui/EventFeedback';
import { GameplayHud } from '../../ui/GameplayHud';
import { RoomEffectOverlay } from '../../ui/RoomEffectOverlay';
import { SCENE_KEYS } from './sceneKeys';

type ViewportSize = {
  width: number;
  height: number;
};

type GameResult = 'playing' | 'won' | 'lost';

const SLA_SECONDS = 180;
const TICKET_BASE_SCORE = 100;
const TICKET_TIME_BONUS_PER_SECOND = 2;
const STRESS_SCORE_PENALTY = 2;
const COFFEE_DURATION_SECONDS = 8;
const COFFEE_SPEED_MULTIPLIER = 1.35;
const COFFEE_STRESS_RECOVERY = 30;
const COFFEE_SCORE = 250;
const ADMIN_DURATION_SECONDS = 8;
const WORKING_DURATION_SECONDS = 10;
const ADMIN_SCORE_PER_ENEMY = 300;
const WORKING_ENEMY_SPEED_MULTIPLIER = 0.45;
const FRIDAY_FIRST_START_SECONDS = 60;
const FRIDAY_INTERVAL_SECONDS = 90;
const FRIDAY_DURATION_SECONDS = 20;
const FRIDAY_ENEMY_SPEED_MULTIPLIER = 1.3;
const FRIDAY_STRESS_MULTIPLIER = 1.35;
const FRIDAY_SCORE_MULTIPLIER = 2;
const TOILET_STRESS_RECOVERY_PER_SECOND = 8;
const KITCHEN_COFFEE_SECONDS = 7;
const KITCHEN_STRESS_RECOVERY = 24;
const KITCHEN_SCORE = 150;
const MEETING_DURATION_SECONDS = 2;
const MEETING_STRESS = 10;
const DIRECTOR_PRIORITY_SECONDS = 18;

export class MainScene extends Phaser.Scene {
  private floorMap: Phaser.GameObjects.Image | null = null;
  private gridLayer: Phaser.GameObjects.Graphics | null = null;
  private hud: DebugHud | null = null;
  private gameplayHud: GameplayHud | null = null;
  private eventFeedback: EventFeedback | null = null;
  private roomEffectOverlay: RoomEffectOverlay | null = null;
  private inputController: InputController | null = null;
  private player: BankMan | null = null;
  private coffeeSystem: CoffeeSystem | null = null;
  private specialPowerUpSystem: SpecialPowerUpSystem | null = null;
  private ticketSystem: TicketSystem | null = null;
  private debugOverlay: DebugOverlay | null = null;
  private enemySystem: EnemySystem | null = null;
  private roomSystem: RoomSystem | null = null;
  private soundSystem: SoundSystem | null = null;
  private startedAt = 0;
  private endedAtSeconds = 0;
  private slaElapsedSeconds = 0;
  private stress = 0;
  private score = 0;
  private difficultyLevel = 1;
  private lockedUntil = 0;
  private coffeeUntil = 0;
  private adminUntil = 0;
  private workingUntil = 0;
  private meetingUntil = 0;
  private directorPriorityUntil = 0;
  private stressFeedbackReadyAt = 0;
  private pendingStressFeedback = 0;
  private fridayActive = false;
  private gameResult: GameResult = 'playing';
  private threat = '-';
  private currentRoom: RoomId | null = null;

  constructor() {
    super(SCENE_KEYS.main);
  }

  create(): void {
    this.startedAt = this.time.now;
    this.endedAtSeconds = 0;
    this.slaElapsedSeconds = 0;
    this.stress = 0;
    this.score = 0;
    this.difficultyLevel = 1;
    this.lockedUntil = 0;
    this.coffeeUntil = 0;
    this.adminUntil = 0;
    this.workingUntil = 0;
    this.meetingUntil = 0;
    this.directorPriorityUntil = 0;
    this.stressFeedbackReadyAt = 0;
    this.pendingStressFeedback = 0;
    this.fridayActive = false;
    this.gameResult = 'playing';
    this.threat = '-';
    this.currentRoom = null;
    this.cameras.main.setBackgroundColor('#07100f');

    this.floorMap = this.add.image(0, 0, ASSET_KEYS.floorMap).setOrigin(0);
    this.floorMap.setName('floor1-map-background');

    this.gridLayer = this.add.graphics();
    this.ticketSystem = new TicketSystem(this, FLOOR1_MAP.ticketPoints);
    this.coffeeSystem = new CoffeeSystem(this, FLOOR1_MAP.ticketPoints);
    this.specialPowerUpSystem = new SpecialPowerUpSystem(this, FLOOR1_MAP.ticketPoints);
    this.player = new BankMan(this, {
      x: FLOOR1_MAP.playerStart.x,
      y: FLOOR1_MAP.playerStart.y,
      radius: 15,
      speed: 190,
    });
    this.debugOverlay = new DebugOverlay(this, FLOOR1_MAP);
    this.enemySystem = new EnemySystem(this, FLOOR1_MAP);
    this.roomSystem = new RoomSystem(this);
    this.soundSystem = new SoundSystem();
    this.input.keyboard?.once('keydown', () => this.soundSystem?.unlock());
    this.inputController = new InputController(this, () => this.soundSystem?.unlock());
    this.hud = new DebugHud(this);
    this.gameplayHud = new GameplayHud(this);
    this.eventFeedback = new EventFeedback(this);
    this.roomEffectOverlay = new RoomEffectOverlay(this);
    this.resizeScene(this.getViewportSize());
    this.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.dispose, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.dispose, this);
  }

  override update(time: number): void {
    const deltaSeconds = this.game.loop.delta / 1000;
    const movement = this.inputController?.getMovement();

    const elapsedSeconds = (time - this.startedAt) / 1000;
    const roomUpdate = this.roomSystem?.update(elapsedSeconds, this.player?.getPosition());
    this.currentRoom = roomUpdate?.room ?? null;
    this.handleRoomEvent(roomUpdate?.event ?? null, time, elapsedSeconds);
    const meetingActive = time < this.meetingUntil;
    const playerLocked = time < this.lockedUntil || meetingActive;
    const coffeeActive = time < this.coffeeUntil;
    const adminActive = time < this.adminUntil;
    const workingActive = time < this.workingUntil;
    const toiletActive = RoomSystem.isToilet(this.currentRoom);
    const directorPriorityActive = time < this.directorPriorityUntil;
    const fridayActive = this.isFridayDeploymentActive(elapsedSeconds);
    if (fridayActive !== this.fridayActive) {
      this.fridayActive = fridayActive;
      this.soundSystem?.play(fridayActive ? 'alert' : 'powerup');
      this.eventFeedback?.show(
        fridayActive ? 'FRIDAY DEPLOYMENT / DOUBLE SCORE' : 'DEPLOYMENT STABILIZED',
        fridayActive ? '#ff4d6d' : '#65ffd8',
      );
    }
    if (this.gameResult === 'playing' && !workingActive && !meetingActive) {
      this.slaElapsedSeconds += deltaSeconds;
    }
    this.ticketSystem?.update(deltaSeconds);

    if (movement && this.player && !playerLocked && this.gameResult === 'playing') {
      this.player.update(
        deltaSeconds,
        movement,
        FLOOR1_MAP,
        coffeeActive ? COFFEE_SPEED_MULTIPLIER : 1,
      );
      const collectedNow = this.ticketSystem?.updateCollector(this.player.getPosition(), 24) ?? 0;
      this.awardTicketScore(
        collectedNow,
        this.slaElapsedSeconds,
        (fridayActive ? FRIDAY_SCORE_MULTIPLIER : 1) *
          (directorPriorityActive ? FRIDAY_SCORE_MULTIPLIER : 1),
      );
      if (collectedNow > 0) {
        this.soundSystem?.play('ticket');
        this.eventFeedback?.show(`TICKET RESOLVED +${collectedNow}`, '#dfff4f');
      }

      if (this.ticketSystem?.collected === this.ticketSystem?.total) {
        this.finishGame('won', elapsedSeconds);
      }
    }

    if (this.inputController?.didToggleDebug()) {
      this.debugOverlay?.toggle();
      this.hud?.toggle();
    }

    if (this.inputController?.didToggleSound()) {
      this.soundSystem?.toggle();
      this.eventFeedback?.show(`SOUND ${this.soundSystem?.isEnabled ? 'ON' : 'OFF'}`, '#b7c8ff');
    }

    if (this.gameResult === 'playing') {
      if (this.coffeeSystem?.update(elapsedSeconds, this.player?.getPosition())) {
        this.stress = Math.max(0, this.stress - COFFEE_STRESS_RECOVERY);
        this.score += COFFEE_SCORE;
        this.coffeeUntil = time + COFFEE_DURATION_SECONDS * 1000;
        this.soundSystem?.play('coffee');
        this.eventFeedback?.show('COFFEE BOOST +250 / STRESS -30', '#fff3b0');
      }

      const specialPowerUp = this.specialPowerUpSystem?.update(elapsedSeconds, this.player?.getPosition());
      if (specialPowerUp === 'admin') {
        this.adminUntil = time + ADMIN_DURATION_SECONDS * 1000;
        this.soundSystem?.play('powerup');
        this.eventFeedback?.show('ADMIN MODE ENABLED', '#4da6ff');
      } else if (specialPowerUp === 'working') {
        this.workingUntil = time + WORKING_DURATION_SECONDS * 1000;
        this.soundSystem?.play('powerup');
        this.eventFeedback?.show('PRACUJEMY NAD TYM / SLA PAUSED', '#65ffd8');
      }

      if (adminActive && this.player) {
        const banished = this.enemySystem?.banishNear(this.player.getPosition(), elapsedSeconds, 34) ?? 0;
        if (banished > 0) {
          this.score += banished * ADMIN_SCORE_PER_ENEMY;
          this.soundSystem?.play('powerup');
          this.eventFeedback?.show(`ACCESS REMOVED +${banished * ADMIN_SCORE_PER_ENEMY}`, '#4da6ff');
        }
      }

      const previousDifficulty = this.difficultyLevel;
      const effects = this.enemySystem?.update(
        deltaSeconds,
        elapsedSeconds,
        this.player?.getPosition(),
        (workingActive ? WORKING_ENEMY_SPEED_MULTIPLIER : 1) *
          (fridayActive ? FRIDAY_ENEMY_SPEED_MULTIPLIER : 1),
        fridayActive ? FRIDAY_STRESS_MULTIPLIER : 1,
        toiletActive,
      );
      this.threat = effects?.threat ?? '-';
      this.difficultyLevel = effects?.difficultyLevel ?? 1;
      if (this.difficultyLevel > previousDifficulty) {
        this.soundSystem?.play('alert');
        this.eventFeedback?.show(`ALERT LEVEL ${this.difficultyLevel}`, '#ff9f6e');
      }
      const previousStress = this.stress;
      const stressRecovery = toiletActive ? TOILET_STRESS_RECOVERY_PER_SECOND : 0.8;
      this.stress = Phaser.Math.Clamp(
        previousStress + (effects?.stressDelta ?? 0) - deltaSeconds * stressRecovery,
        0,
        100,
      );
      const stressIncrease = Math.max(0, this.stress - previousStress);
      this.score = Math.max(0, this.score - stressIncrease * STRESS_SCORE_PENALTY);
      this.pendingStressFeedback += stressIncrease;
      if (this.pendingStressFeedback >= 1 && time >= this.stressFeedbackReadyAt) {
        this.soundSystem?.play('stress');
        this.eventFeedback?.show(`STRESS +${Math.ceil(this.pendingStressFeedback)}`, '#ff4d6d');
        this.pendingStressFeedback = 0;
        this.stressFeedbackReadyAt = time + 900;
      }

      if (effects?.lockSeconds) {
        this.lockedUntil = Math.max(this.lockedUntil, time + effects.lockSeconds * 1000);
      }

      if (this.stress >= 100) {
        this.finishGame('lost', elapsedSeconds);
      }
    }

    if (this.player) {
      this.player.updateVisual(time / 1000, {
        stress: this.stress,
        coffeeActive,
        adminActive,
        workingActive,
        locked: playerLocked,
        fridayActive,
      });
      this.cameras.main.pan(this.player.x, this.player.y, 0);
    }

    this.hud?.update({
      fps: Math.round(this.game.loop.actualFps),
      uptimeSeconds: Math.floor(this.getDisplayElapsedSeconds(elapsedSeconds)),
      scene: this.sys.config as string,
      map: FLOOR1_MAP.id,
      tickets: `${this.ticketSystem?.collected ?? 0}/${this.ticketSystem?.total ?? 0}`,
      score: Math.floor(this.score),
      sla: this.formatSla(this.slaElapsedSeconds),
      enemies: this.enemySystem?.activeCount ?? 0,
      stress: Math.round(this.stress),
      difficulty: this.difficultyLevel,
      status: this.getStatus(playerLocked, meetingActive),
      threat: this.threat,
      player: this.player ? `${Math.round(this.player.x)},${Math.round(this.player.y)}` : '-',
      debug: this.debugOverlay?.isVisible ? 'on' : 'off',
    });
    this.gameplayHud?.update({
      tickets: `${this.ticketSystem?.collected ?? 0}/${this.ticketSystem?.total ?? 0}`,
      score: Math.floor(this.score),
      sla: this.formatSla(this.slaElapsedSeconds),
      stress: Math.round(this.stress),
      difficulty: this.difficultyLevel,
      coffeeSeconds: Math.max(0, Math.ceil((this.coffeeUntil - time) / 1000)),
      specialEffect: this.getSpecialEffect(time, elapsedSeconds),
      soundEnabled: this.soundSystem?.isEnabled ?? false,
      status: this.getStatus(playerLocked, meetingActive),
      threat: this.threat,
    });
  }

  private dispose(): void {
    this.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this);
    this.inputController?.dispose();
    this.soundSystem?.dispose();
  }

  private handleRoomEvent(event: RoomEvent | null, time: number, elapsedSeconds: number): void {
    if (!event || this.gameResult !== 'playing') {
      return;
    }

    if (event.type === 'toilet-entered') {
      this.soundSystem?.play('safe-break');
      this.eventFeedback?.show('SAFE BREAK / STRESS RECOVERY', '#65ffd8');
      this.roomEffectOverlay?.show('toilet', 'SAFE BREAK', 'PROTECTED / STRESS RECOVERY / SLA RUNNING');
      return;
    }

    if (event.type === 'kitchen-refill') {
      this.stress = Math.max(0, this.stress - KITCHEN_STRESS_RECOVERY);
      this.score += KITCHEN_SCORE;
      this.coffeeUntil = Math.max(this.coffeeUntil, time + KITCHEN_COFFEE_SECONDS * 1000);
      this.soundSystem?.play('kitchen');
      this.eventFeedback?.show('KITCHEN REFILL +150 / STRESS -24', '#79ff8f');
      this.roomEffectOverlay?.show('kitchen', 'KITCHEN REFILL', 'COFFEE 7s / +150 / STRESS -24');
      return;
    }

    if (event.type === 'meeting-trap') {
      this.meetingUntil = time + MEETING_DURATION_SECONDS * 1000;
      this.stress = Phaser.Math.Clamp(this.stress + MEETING_STRESS, 0, 100);
      this.soundSystem?.play('meeting');
      this.eventFeedback?.show('THIS COULD HAVE BEEN AN EMAIL', '#ffc857');
      this.roomEffectOverlay?.show('meeting', 'MANDATORY MEETING', 'MOVEMENT + SLA PAUSED FOR 2s / STRESS +10');
      return;
    }

    this.soundSystem?.play('director');
    if (event.order === 'budget-approved') {
      this.score += 750;
      this.eventFeedback?.show('BUDGET APPROVED +750', '#dfff4f');
      this.roomEffectOverlay?.show('director', 'EXECUTIVE DECISION', 'BUDGET APPROVED / SCORE +750');
    } else if (event.order === 'town-hall') {
      const attendees = this.player
        ? this.enemySystem?.banishNear(this.player.getPosition(), elapsedSeconds, 5000) ?? 0
        : 0;
      this.eventFeedback?.show(`MANDATORY TOWN HALL / ${attendees} ATTENDING`, '#65ffd8');
      this.roomEffectOverlay?.show('director', 'EXECUTIVE DECISION', `TOWN HALL / ${attendees} THREATS RECALLED`);
    } else if (event.order === 'cost-optimization') {
      this.score = Math.max(0, this.score - 300);
      this.stress = Phaser.Math.Clamp(this.stress + 15, 0, 100);
      this.eventFeedback?.show('COST OPTIMIZATION -300 / STRESS +15', '#ff4d6d');
      this.roomEffectOverlay?.show('director', 'EXECUTIVE DECISION', 'COST OPTIMIZATION / SCORE -300 / STRESS +15');
    } else {
      this.directorPriorityUntil = time + DIRECTOR_PRIORITY_SECONDS * 1000;
      this.eventFeedback?.show('STRATEGIC PRIORITY / SCORE X2', '#b7c8ff');
      this.roomEffectOverlay?.show('director', 'EXECUTIVE DECISION', 'STRATEGIC PRIORITY / TICKET SCORE X2 FOR 18s');
    }
  }

  private awardTicketScore(collectedNow: number, elapsedSeconds: number, multiplier: number): void {
    if (collectedNow === 0) {
      return;
    }

    const slaRemaining = Math.max(0, SLA_SECONDS - elapsedSeconds);
    const ticketScore = TICKET_BASE_SCORE + Math.floor(slaRemaining) * TICKET_TIME_BONUS_PER_SECOND;
    this.score += collectedNow * ticketScore * multiplier;
  }

  private finishGame(result: Exclude<GameResult, 'playing'>, elapsedSeconds: number): void {
    this.gameResult = result;
    this.endedAtSeconds = elapsedSeconds;
    const tickets = this.ticketSystem?.collected ?? 0;
    const scoreEntry = {
      score: Math.floor(this.score),
      timeSeconds: Math.floor(elapsedSeconds),
      tickets,
      won: result === 'won',
      recordedAt: new Date().toISOString(),
    };
    this.soundSystem?.play(result === 'won' ? 'win' : 'lose');
    announceGameFinished({
      result,
      scoreEntry,
      sla: this.formatSla(this.slaElapsedSeconds),
      totalTickets: this.ticketSystem?.total ?? 0,
    });
  }

  private getDisplayElapsedSeconds(elapsedSeconds: number): number {
    return this.gameResult === 'playing' ? elapsedSeconds : this.endedAtSeconds;
  }

  private formatSla(elapsedSeconds: number): string {
    const slaDelta = SLA_SECONDS - elapsedSeconds;
    const seconds = Math.ceil(Math.abs(slaDelta));
    return slaDelta >= 0 ? this.formatDuration(seconds) : `OVERDUE ${this.formatDuration(seconds)}`;
  }

  private formatDuration(seconds: number): string {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(totalSeconds / 60);
    const remainder = totalSeconds % 60;
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  }

  private getSpecialEffect(time: number, elapsedSeconds: number): string {
    if (time < this.adminUntil) {
      return `ADMIN ${Math.ceil((this.adminUntil - time) / 1000)}s`;
    }

    if (time < this.workingUntil) {
      return `WORKING ${Math.ceil((this.workingUntil - time) / 1000)}s`;
    }

    if (time < this.directorPriorityUntil) {
      return `PRIORITY ${Math.ceil((this.directorPriorityUntil - time) / 1000)}s / SCORE X2`;
    }

    const fridayRemaining = this.getFridayDeploymentRemaining(elapsedSeconds);
    if (fridayRemaining > 0) {
      return `FRIDAY ${Math.ceil(fridayRemaining)}s / SCORE X2`;
    }

    return RoomSystem.getRoomLabel(this.currentRoom);
  }

  private isFridayDeploymentActive(elapsedSeconds: number): boolean {
    return this.getFridayDeploymentRemaining(elapsedSeconds) > 0;
  }

  private getFridayDeploymentRemaining(elapsedSeconds: number): number {
    if (elapsedSeconds < FRIDAY_FIRST_START_SECONDS) {
      return 0;
    }

    const phaseElapsed = (elapsedSeconds - FRIDAY_FIRST_START_SECONDS) % FRIDAY_INTERVAL_SECONDS;
    return phaseElapsed < FRIDAY_DURATION_SECONDS ? FRIDAY_DURATION_SECONDS - phaseElapsed : 0;
  }

  private getStatus(playerLocked: boolean, meetingActive: boolean): string {
    if (this.gameResult === 'won') {
      return 'SPRINT COMPLETE';
    }

    if (this.gameResult === 'lost') {
      return 'GAME OVER';
    }

    if (meetingActive) {
      return 'IN MEETING';
    }

    if (RoomSystem.isToilet(this.currentRoom)) {
      return 'ON BREAK';
    }

    return playerLocked ? 'ACCESS REVOKED' : 'ACTIVE';
  }

  private onResize(gameSize: ViewportSize): void {
    this.resizeScene(gameSize);
  }

  private resizeScene(size: ViewportSize): void {
    this.cameras.main.setViewport(0, 0, size.width, size.height);
    this.cameras.main.setBounds(0, 0, FLOOR1_MAP.dimensions.width, FLOOR1_MAP.dimensions.height);
    const cameraZoom = this.getCameraZoom(size);
    this.cameras.main.setZoom(cameraZoom);
    this.layoutFloorMap();
    this.drawGridOverlay();
    this.hud?.layout(size);
    this.gameplayHud?.layout(size, cameraZoom);
    this.eventFeedback?.layout(size);
    this.roomEffectOverlay?.layout(size);
  }

  private getViewportSize(): ViewportSize {
    return {
      width: this.scale.width,
      height: this.scale.height,
    };
  }

  private layoutFloorMap(): void {
    if (!this.floorMap) {
      return;
    }

    this.floorMap.setPosition(0, 0);
    this.floorMap.setDisplaySize(FLOOR1_MAP.dimensions.width, FLOOR1_MAP.dimensions.height);
  }

  private drawGridOverlay(): void {
    if (!this.gridLayer) {
      return;
    }

    const spacing = 64;
    this.gridLayer.clear();
    this.gridLayer.lineStyle(1, 0x35f2c2, 0.12);

    for (let x = 0; x <= FLOOR1_MAP.dimensions.width; x += spacing) {
      this.gridLayer.lineBetween(x, 0, x, FLOOR1_MAP.dimensions.height);
    }

    for (let y = 0; y <= FLOOR1_MAP.dimensions.height; y += spacing) {
      this.gridLayer.lineBetween(0, y, FLOOR1_MAP.dimensions.width, y);
    }
  }

  private getCameraZoom(size: ViewportSize): number {
    const fitZoom = Math.min(size.width / FLOOR1_MAP.dimensions.width, size.height / FLOOR1_MAP.dimensions.height);
    const compactViewport = size.width < 980 || size.height < 620;

    return compactViewport ? Math.max(fitZoom, 0.85) : fitZoom;
  }
}
