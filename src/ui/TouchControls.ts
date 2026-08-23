import type { MovementState } from '../game/systems/InputController';

const DIRECTION_THRESHOLD = 0.28;

export class TouchControls {
  private readonly root: HTMLDivElement;
  private readonly pad: HTMLDivElement;
  private readonly knob: HTMLDivElement;
  private movement: MovementState = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  private restartPressed = false;
  private soundPressed = false;
  private activePointerId: number | null = null;
  private readonly onInteraction: () => void;

  constructor(parent: HTMLElement, onInteraction: () => void) {
    this.onInteraction = onInteraction;
    this.root = document.createElement('div');
    this.root.className = 'touch-controls';
    this.root.setAttribute('aria-label', 'Touch controls');

    this.pad = document.createElement('div');
    this.pad.className = 'touch-pad';
    this.pad.setAttribute('aria-label', 'Movement joystick');

    this.knob = document.createElement('div');
    this.knob.className = 'touch-pad__knob';
    this.pad.append(this.knob);

    const actions = document.createElement('div');
    actions.className = 'touch-actions';
    actions.append(
      this.createActionButton('MUTE', 'Toggle sound', () => {
        this.soundPressed = true;
      }),
      this.createActionButton('RESTART', 'Restart after game over', () => {
        this.restartPressed = true;
      }),
    );

    this.root.append(this.pad, actions);
    parent.append(this.root);

    this.pad.addEventListener('pointerdown', this.onPointerDown);
    this.pad.addEventListener('pointermove', this.onPointerMove);
    this.pad.addEventListener('pointerup', this.onPointerEnd);
    this.pad.addEventListener('pointercancel', this.onPointerEnd);
  }

  getMovement(): MovementState {
    return { ...this.movement };
  }

  consumeRestart(): boolean {
    const pressed = this.restartPressed;
    this.restartPressed = false;
    return pressed;
  }

  consumeSoundToggle(): boolean {
    const pressed = this.soundPressed;
    this.soundPressed = false;
    return pressed;
  }

  dispose(): void {
    this.pad.removeEventListener('pointerdown', this.onPointerDown);
    this.pad.removeEventListener('pointermove', this.onPointerMove);
    this.pad.removeEventListener('pointerup', this.onPointerEnd);
    this.pad.removeEventListener('pointercancel', this.onPointerEnd);
    this.root.remove();
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.onInteraction();
    this.activePointerId = event.pointerId;
    this.pad.setPointerCapture(event.pointerId);
    this.updateJoystick(event);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId === this.activePointerId) {
      this.updateJoystick(event);
    }
  };

  private readonly onPointerEnd = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    this.activePointerId = null;
    this.movement = { up: false, down: false, left: false, right: false };
    this.knob.style.transform = 'translate(0, 0)';
  };

  private updateJoystick(event: PointerEvent): void {
    const bounds = this.pad.getBoundingClientRect();
    const radius = bounds.width / 2;
    const rawX = (event.clientX - bounds.left - radius) / radius;
    const rawY = (event.clientY - bounds.top - radius) / radius;
    const length = Math.hypot(rawX, rawY);
    const scale = length > 1 ? 1 / length : 1;
    const x = rawX * scale;
    const y = rawY * scale;

    this.movement = {
      up: y < -DIRECTION_THRESHOLD,
      down: y > DIRECTION_THRESHOLD,
      left: x < -DIRECTION_THRESHOLD,
      right: x > DIRECTION_THRESHOLD,
    };
    this.knob.style.transform = `translate(${x * radius * 0.48}px, ${y * radius * 0.48}px)`;
  }

  private createActionButton(label: string, ariaLabel: string, action: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'touch-action';
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-label', ariaLabel);
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.onInteraction();
      action();
    });
    return button;
  }
}
