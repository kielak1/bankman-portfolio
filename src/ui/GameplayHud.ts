import Phaser from 'phaser';

export type GameplayHudStats = {
  tickets: string;
  score: number;
  sla: string;
  stress: number;
  difficulty: number;
  coffeeSeconds: number;
  specialEffect: string;
  soundEnabled: boolean;
  status: string;
  threat: string;
};

type ViewportSize = {
  width: number;
  height: number;
};

const PANEL_HEIGHT = 92;
const PANEL_MARGIN = 8;
const PANEL_MAX_WIDTH = 760;

export class GameplayHud {
  private readonly container: Phaser.GameObjects.Container;
  private readonly background: Phaser.GameObjects.Graphics;
  private readonly tickets: Phaser.GameObjects.Text;
  private readonly score: Phaser.GameObjects.Text;
  private readonly sla: Phaser.GameObjects.Text;
  private readonly difficulty: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;
  private readonly stressLabel: Phaser.GameObjects.Text;
  private panelWidth = 760;
  private stress = 0;

  constructor(scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(150);
    this.background = scene.add.graphics();
    this.tickets = this.createValue(scene, '#dfff4f');
    this.score = this.createValue(scene, '#65ffd8');
    this.sla = this.createValue(scene, '#d8fff7');
    this.difficulty = this.createValue(scene, '#ff9f6e');
    this.status = this.createValue(scene, '#b7c8ff');
    this.stressLabel = scene.add.text(16, 59, '', {
      color: '#d8fff7',
      fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
      fontSize: '10px',
      fontStyle: 'bold',
    });

    this.container.add([
      this.background,
      this.tickets,
      this.score,
      this.sla,
      this.difficulty,
      this.status,
      this.stressLabel,
    ]);
  }

  update(stats: GameplayHudStats): void {
    this.stress = stats.stress;
    this.tickets.setText(`TICKETS\n${stats.tickets}`);
    this.score.setText(`SCORE\n${stats.score}`);
    this.sla.setText(`SLA\n${stats.sla}`);
    this.difficulty.setText(`ALERT\nLEVEL ${stats.difficulty}`);
    this.status.setText(`STATUS\n${stats.status}${stats.threat === '-' ? '' : ` / ${stats.threat}`}`);
    const coffee = stats.coffeeSeconds > 0 ? ` | COFFEE ${stats.coffeeSeconds}s` : '';
    const special = stats.specialEffect ? ` | ${stats.specialEffect}` : '';
    this.stressLabel.setText(
      `STRESS ${stats.stress}/100${coffee}${special} | SOUND ${stats.soundEnabled ? 'ON' : 'OFF'} [M]`,
    );
    this.drawPanel();
  }

  layout(size: ViewportSize, cameraZoom: number): void {
    this.panelWidth = Math.min(PANEL_MAX_WIDTH, size.width - PANEL_MARGIN * 2);

    const targetX = (size.width - this.panelWidth) / 2;
    const targetY = size.height - PANEL_HEIGHT - PANEL_MARGIN;
    const cameraCenterX = size.width / 2;
    const cameraCenterY = size.height / 2;

    // Fixed objects still inherit camera zoom. Counter-scale and move the
    // container around the camera origin so it stays pinned to the viewport.
    this.container.setScale(1 / cameraZoom);
    this.container.setPosition(
      cameraCenterX + (targetX - cameraCenterX) / cameraZoom,
      cameraCenterY + (targetY - cameraCenterY) / cameraZoom,
    );

    const columnWidth = this.panelWidth / 5;
    this.tickets.setPosition(16, 12);
    this.score.setPosition(columnWidth, 12);
    this.sla.setPosition(columnWidth * 2, 12);
    this.difficulty.setPosition(columnWidth * 3, 12);
    this.status.setPosition(columnWidth * 4, 12);
    this.status.setWordWrapWidth(columnWidth - 16);
    this.drawPanel();
  }

  private createValue(scene: Phaser.Scene, color: string): Phaser.GameObjects.Text {
    return scene.add.text(0, 0, '', {
      color,
      fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      lineSpacing: 2,
    });
  }

  private drawPanel(): void {
    const stressWidth = this.panelWidth - 32;
    const stressColor = this.stress >= 75 ? 0xff4d6d : this.stress >= 45 ? 0xffc857 : 0x65ffd8;

    this.background.clear();
    this.background.fillStyle(0x031614, 0.94);
    this.background.lineStyle(1, 0x35f2c2, 0.75);
    this.background.fillRoundedRect(0, 0, this.panelWidth, PANEL_HEIGHT, 8);
    this.background.strokeRoundedRect(0, 0, this.panelWidth, PANEL_HEIGHT, 8);
    this.background.fillStyle(0x07100f, 1);
    this.background.fillRoundedRect(16, 76, stressWidth, 6, 3);
    this.background.fillStyle(stressColor, 1);
    this.background.fillRoundedRect(16, 76, stressWidth * Phaser.Math.Clamp(this.stress / 100, 0, 1), 6, 3);
  }
}
