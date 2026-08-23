import Phaser from 'phaser';

type DebugHudStats = {
  fps: number;
  uptimeSeconds: number;
  scene: string;
  map: string;
  tickets: string;
  score: number;
  sla: string;
  enemies: number;
  stress: number;
  difficulty: number;
  status: string;
  threat: string;
  player: string;
  debug: string;
};

type ViewportSize = {
  width: number;
  height: number;
};

export class DebugHud {
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly title: Phaser.GameObjects.Text;
  private readonly stats: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.panel = scene.add.rectangle(16, 16, 290, 246, 0x031614, 0.82);
    this.panel.setOrigin(0, 0);
    this.panel.setStrokeStyle(1, 0x35f2c2, 0.65);
    this.panel.setScrollFactor(0);
    this.panel.setDepth(100);

    this.title = scene.add.text(32, 28, 'BANKMAN DEBUG', {
      color: '#65ffd8',
      fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
      fontSize: '13px',
    });
    this.title.setScrollFactor(0);
    this.title.setDepth(101);

    this.stats = scene.add.text(32, 52, '', {
      color: '#d8fff7',
      fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
      fontSize: '12px',
      lineSpacing: 4,
    });
    this.stats.setScrollFactor(0);
    this.stats.setDepth(101);
    this.setVisible(false);
  }

  update(stats: DebugHudStats): void {
    this.stats.setText([
      `scene: ${stats.scene}`,
      `map: ${stats.map}`,
      `player: ${stats.player}`,
      `tickets: ${stats.tickets}`,
      `score: ${stats.score}`,
      `sla: ${stats.sla}`,
      `enemies: ${stats.enemies}`,
      `stress: ${stats.stress}/100`,
      `difficulty: ${stats.difficulty}/4`,
      `status: ${stats.status}`,
      `threat: ${stats.threat}`,
      `debug: ${stats.debug}`,
      `fps: ${stats.fps}`,
      `uptime: ${stats.uptimeSeconds}s`,
    ]);
  }

  layout(size: ViewportSize): void {
    const x = size.width < 520 ? 10 : 16;
    const y = size.height < 360 ? 10 : 16;

    this.panel.setPosition(x, y);
    this.title.setPosition(x + 16, y + 12);
    this.stats.setPosition(x + 16, y + 36);
  }

  toggle(): void {
    this.setVisible(!this.panel.visible);
  }

  private setVisible(visible: boolean): void {
    this.panel.setVisible(visible);
    this.title.setVisible(visible);
    this.stats.setVisible(visible);
  }
}
