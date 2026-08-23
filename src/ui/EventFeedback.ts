import Phaser from 'phaser';

type ViewportSize = {
  width: number;
  height: number;
};

export class EventFeedback {
  private readonly scene: Phaser.Scene;
  private readonly text: Phaser.GameObjects.Text;
  private viewportWidth = 0;
  private viewportHeight = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.text = scene.add
      .text(0, 0, '', {
        align: 'center',
        color: '#65ffd8',
        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
        fontSize: '18px',
        fontStyle: 'bold',
        backgroundColor: '#07100fdd',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(180)
      .setAlpha(0);
  }

  show(message: string, color: string): void {
    this.scene.tweens.killTweensOf(this.text);
    this.text
      .setText(message)
      .setColor(color)
      .setPosition(this.viewportWidth / 2, this.viewportHeight - 145)
      .setAlpha(1)
      .setScale(0.92);

    this.scene.tweens.add({
      targets: this.text,
      alpha: 0,
      scale: 1.05,
      y: this.text.y - 18,
      delay: 2000,
      duration: 900,
      ease: 'Cubic.easeOut',
    });
  }

  layout(size: ViewportSize): void {
    this.viewportWidth = size.width;
    this.viewportHeight = size.height;
    if (this.text.alpha > 0) {
      this.text.setPosition(size.width / 2, size.height - 145);
    }
  }
}
