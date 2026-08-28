import type { JunScienceDesktopAPI } from '../../electron/preload';

declare global {
  interface Window {
    junscience?: JunScienceDesktopAPI;
  }
}

export {};
