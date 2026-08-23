import Phaser from 'phaser';

export type RoomEffectKind = 'toilet' | 'kitchen' | 'meeting' | 'director';

type ViewportSize = {
  width: number;
  height: number;
};

const COLORS: Record<RoomEffectKind, number> = {
  toilet: 0x65ffd8,
  kitchen: 0x79ff8f,
  meeting: 0xffc857,
  director: 0xff64b4,
};

export class RoomEffectOverlay {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly title: Phaser.GameObjects.Text;
  private readonly subtitle: Phaser.GameObjects.Text;
  private viewportWidth = 0;
  private viewportHeight = 0;
  private kind: RoomEffectKind = 'toilet';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(170).setAlpha(0);
    this.graphics = scene.add.graphics();
    this.title = scene.add
      .text(0, 0, '', {
        align: 'center',
        color: '#65ffd8',
        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
        fontSize: '28px',
        fontStyle: 'bold',
        backgroundColor: '#07100fee',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5);
    this.subtitle = scene.add
      .text(0, 0, '', {
        align: 'center',
        color: '#d8fff7',
        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        backgroundColor: '#07100fdd',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5);
    this.container.add([this.graphics, this.title, this.subtitle]);
  }

  show(kind: RoomEffectKind, title: string, subtitle: string): void {
    this.kind = kind;
    this.scene.tweens.killTweensOf(this.container);
    this.title.setText(title).setColor(Phaser.Display.Color.IntegerToColor(COLORS[kind]).rgba);
    this.subtitle.setText(subtitle);
    this.draw();
    this.container.setAlpha(1);

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      delay: kind === 'meeting' ? 1200 : 900,
      duration: 700,
      ease: 'Cubic.easeOut',
    });
  }

  layout(size: ViewportSize): void {
    this.viewportWidth = size.width;
    this.viewportHeight = size.height;
    this.title.setPosition(size.width / 2, Math.max(80, size.height * 0.23));
    this.subtitle.setPosition(size.width / 2, Math.max(125, size.height * 0.23 + 54));
    this.draw();
  }

  private draw(): void {
    const width = this.viewportWidth;
    const height = this.viewportHeight;
    if (width === 0 || height === 0) {
      return;
    }

    const color = COLORS[this.kind];
    const centerX = width / 2;
    const centerY = height / 2;
    this.graphics.clear();
    this.graphics.fillStyle(color, 0.07);
    this.graphics.fillRect(0, 0, width, height);
    this.graphics.lineStyle(4, color, 0.75);
    this.graphics.strokeRect(8, 8, width - 16, height - 16);

    if (this.kind === 'toilet') {
      this.graphics.lineStyle(3, color, 0.38);
      this.graphics.strokeCircle(centerX, centerY, Math.min(width, height) * 0.28);
      this.graphics.strokeCircle(centerX, centerY, Math.min(width, height) * 0.36);
      return;
    }

    if (this.kind === 'kitchen') {
      this.graphics.lineStyle(5, color, 0.45);
      for (let offset = -54; offset <= 54; offset += 54) {
        this.graphics.lineBetween(centerX + offset - 12, centerY + 35, centerX + offset, centerY - 35);
        this.graphics.lineBetween(centerX + offset, centerY - 35, centerX + offset + 12, centerY + 35);
      }
      return;
    }

    if (this.kind === 'meeting') {
      this.graphics.fillStyle(color, 0.22);
      this.graphics.fillRect(0, centerY - 10, width, 20);
      this.graphics.lineStyle(3, color, 0.5);
      for (let x = -height; x < width; x += 90) {
        this.graphics.lineBetween(x, height, x + height, 0);
      }
      return;
    }

    const corner = Math.min(width, height) * 0.18;
    this.graphics.lineStyle(6, color, 0.55);
    this.graphics.lineBetween(28, 28, 28 + corner, 28);
    this.graphics.lineBetween(28, 28, 28, 28 + corner);
    this.graphics.lineBetween(width - 28, 28, width - 28 - corner, 28);
    this.graphics.lineBetween(width - 28, 28, width - 28, 28 + corner);
    this.graphics.lineBetween(28, height - 28, 28 + corner, height - 28);
    this.graphics.lineBetween(28, height - 28, 28, height - 28 - corner);
    this.graphics.lineBetween(width - 28, height - 28, width - 28 - corner, height - 28);
    this.graphics.lineBetween(width - 28, height - 28, width - 28, height - 28 - corner);
  }
}
