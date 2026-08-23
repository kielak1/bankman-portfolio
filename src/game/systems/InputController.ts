import Phaser from 'phaser';
import { TouchControls } from '../../ui/TouchControls';

export type MovementState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export class InputController {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keys: Record<'w' | 'a' | 's' | 'd' | 'f1' | 'r' | 'm', Phaser.Input.Keyboard.Key>;
  private readonly touchControls: TouchControls | null;

  constructor(scene: Phaser.Scene, onTouchInteraction: () => void) {
    if (!scene.input.keyboard) {
      throw new Error('Keyboard input is not available.');
    }

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      f1: Phaser.Input.Keyboard.KeyCodes.F1,
      r: Phaser.Input.Keyboard.KeyCodes.R,
      m: Phaser.Input.Keyboard.KeyCodes.M,
    }) as Record<'w' | 'a' | 's' | 'd' | 'f1' | 'r' | 'm', Phaser.Input.Keyboard.Key>;
    this.touchControls = this.createTouchControls(onTouchInteraction);
  }

  getMovement(): MovementState {
    const touch = this.touchControls?.getMovement();

    return {
      up: Boolean(this.cursors.up?.isDown || this.keys.w.isDown || touch?.up),
      down: Boolean(this.cursors.down?.isDown || this.keys.s.isDown || touch?.down),
      left: Boolean(this.cursors.left?.isDown || this.keys.a.isDown || touch?.left),
      right: Boolean(this.cursors.right?.isDown || this.keys.d.isDown || touch?.right),
    };
  }

  didToggleDebug(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.f1);
  }

  didRestart(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.r) || Boolean(this.touchControls?.consumeRestart());
  }

  didToggleSound(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.m) || Boolean(this.touchControls?.consumeSoundToggle());
  }

  dispose(): void {
    this.touchControls?.dispose();
  }

  private createTouchControls(onInteraction: () => void): TouchControls | null {
    if (!window.matchMedia('(pointer: coarse)').matches) {
      return null;
    }

    const gameRoot = document.querySelector<HTMLElement>('#game-root');
    return gameRoot ? new TouchControls(gameRoot, onInteraction) : null;
  }
}
