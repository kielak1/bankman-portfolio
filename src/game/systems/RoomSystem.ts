import Phaser from 'phaser';
import type { MapRect } from '../maps/floor1Map';

export type RoomId =
  | 'director'
  | 'conference-left'
  | 'conference-right'
  | 'toilet-upper'
  | 'toilet-lower'
  | 'kitchen';

export type RoomEvent =
  | { type: 'toilet-entered' }
  | { type: 'kitchen-refill' }
  | { type: 'meeting-trap' }
  | { type: 'director-order'; order: DirectorOrder };

export type DirectorOrder = 'budget-approved' | 'town-hall' | 'cost-optimization' | 'strategic-priority';

export type RoomUpdate = {
  room: RoomId | null;
  event: RoomEvent | null;
};

type FunctionalRoom = MapRect & {
  label: string;
  color: number;
};

const KITCHEN_COOLDOWN_SECONDS = 24;
const MEETING_COOLDOWN_SECONDS = 18;
const DIRECTOR_COOLDOWN_SECONDS = 28;

const ROOMS: FunctionalRoom[] = [
  { id: 'director', label: 'EXECUTIVE', color: 0xff64b4, x: 78, y: 142, width: 90, height: 102 },
  { id: 'conference-left', label: 'MEETING', color: 0xffc857, x: 704, y: 140, width: 74, height: 100 },
  { id: 'conference-right', label: 'MEETING', color: 0xffc857, x: 780, y: 140, width: 75, height: 100 },
  { id: 'toilet-upper', label: 'SAFE BREAK', color: 0x65ffd8, x: 970, y: 334, width: 48, height: 64 },
  { id: 'toilet-lower', label: 'SAFE BREAK', color: 0x65ffd8, x: 970, y: 402, width: 48, height: 71 },
  { id: 'kitchen', label: 'KITCHEN', color: 0x79ff8f, x: 1065, y: 326, width: 88, height: 186 },
];

export class RoomSystem {
  private readonly cooldowns = new Map<RoomId, number>();
  private currentRoom: RoomId | null = null;

  constructor(scene: Phaser.Scene) {
    for (const room of ROOMS) {
      scene.add
        .text(room.x + room.width / 2, room.y + room.height / 2, room.label, {
          color: Phaser.Display.Color.IntegerToColor(room.color).rgba,
          fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
          fontSize: '8px',
          fontStyle: 'bold',
          backgroundColor: '#07100fbb',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5)
        .setDepth(14)
        .setAlpha(0.72);
    }
  }

  update(elapsedSeconds: number, playerPosition?: Phaser.Math.Vector2): RoomUpdate {
    const room = playerPosition ? this.findRoom(playerPosition) : null;
    const enteredRoom = room !== null && room !== this.currentRoom;
    this.currentRoom = room;

    if (!enteredRoom) {
      return { room, event: null };
    }

    if (room === 'toilet-upper' || room === 'toilet-lower') {
      return { room, event: { type: 'toilet-entered' } };
    }

    if (!this.isReady(room, elapsedSeconds)) {
      return { room, event: null };
    }

    if (room === 'kitchen') {
      this.cooldowns.set(room, elapsedSeconds + KITCHEN_COOLDOWN_SECONDS);
      return { room, event: { type: 'kitchen-refill' } };
    }

    if (room === 'conference-left' || room === 'conference-right') {
      this.cooldowns.set(room, elapsedSeconds + MEETING_COOLDOWN_SECONDS);
      return { room, event: { type: 'meeting-trap' } };
    }

    this.cooldowns.set(room, elapsedSeconds + DIRECTOR_COOLDOWN_SECONDS);
    return {
      room,
      event: {
        type: 'director-order',
        order: Phaser.Math.RND.pick<DirectorOrder>([
          'budget-approved',
          'town-hall',
          'cost-optimization',
          'strategic-priority',
        ]),
      },
    };
  }

  static isToilet(room: RoomId | null): boolean {
    return room === 'toilet-upper' || room === 'toilet-lower';
  }

  static getRoomLabel(room: RoomId | null): string {
    if (RoomSystem.isToilet(room)) {
      return 'SAFE BREAK';
    }

    if (room === 'kitchen') {
      return 'KITCHEN';
    }

    if (room === 'conference-left' || room === 'conference-right') {
      return 'MEETING ROOM';
    }

    return room === 'director' ? 'EXECUTIVE OFFICE' : '';
  }

  private isReady(room: RoomId, elapsedSeconds: number): boolean {
    return elapsedSeconds >= (this.cooldowns.get(room) ?? 0);
  }

  private findRoom(position: Phaser.Math.Vector2): RoomId | null {
    const room = ROOMS.find(
      ({ x, y, width, height }) =>
        position.x >= x &&
        position.x <= x + width &&
        position.y >= y &&
        position.y <= y + height,
    );

    return (room?.id as RoomId | undefined) ?? null;
  }
}
