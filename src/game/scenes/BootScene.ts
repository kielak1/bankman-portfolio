import Phaser from 'phaser';
import { ASSET_KEYS, ASSET_URLS } from '../assets';
import { announceGameReady } from '../gameEvents';
import { SCENE_KEYS } from './sceneKeys';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.boot);
  }

  preload(): void {
    this.load.image(ASSET_KEYS.floorMap, ASSET_URLS.floorMap);
  }

  create(): void {
    announceGameReady();
  }
}
