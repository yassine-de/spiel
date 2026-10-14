import type { QualitySetting, ReducedMotionSetting } from '../../storage/settingsStore';
import { DESIGN_HEIGHT } from '../config/constants';

export interface DeviceInfo {
  devicePixelRatio: number;
  /** Höhe des sichtbaren Bereichs in CSS-Pixeln (die kürzere Seite im Querformat). */
  cssHeight: number;
  /** navigator.deviceMemory in GB, falls der Browser es verrät. */
  deviceMemory?: number;
}

/**
 * Bestimmt, in welcher Auflösung die Spielwelt gerendert wird (1 = 720 Pixel Höhe).
 * „Hoch“ nutzt bis zu 2×, „Automatisch“ bis zu 1,5×, „Sparsam“ immer 1×.
 */
export function computeRenderScale(quality: QualitySetting, device: DeviceInfo): number {
  if (quality === 'low') return 1;
  const physicalHeight = device.cssHeight * Math.max(1, device.devicePixelRatio);
  const ideal = physicalHeight / DESIGN_HEIGHT;
  let max = quality === 'high' ? 2 : 1.5;
  if (quality === 'auto' && device.deviceMemory !== undefined && device.deviceMemory < 4) max = 1;
  const scale = Math.min(max, Math.max(1, ideal));
  return Math.round(scale * 4) / 4;
}

/** Aktuelle Render-Auflösung; Szenen nutzen sie als Kamera-Zoom. */
export const renderQuality = { scale: 1 };

export function readDeviceInfo(): DeviceInfo {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    devicePixelRatio: window.devicePixelRatio || 1,
    cssHeight: Math.min(window.innerWidth, window.innerHeight),
    deviceMemory: nav.deviceMemory,
  };
}

export function isReducedMotion(setting: ReducedMotionSetting): boolean {
  if (setting === 'on') return true;
  if (setting === 'off') return false;
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
