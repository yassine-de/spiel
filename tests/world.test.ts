import { describe, expect, it } from 'vitest';
import { TILE_SIZE } from '../src/game/config/constants';
import { computeRenderScale } from '../src/game/managers/QualityManager';
import type { CollisionManager } from '../src/game/systems/CollisionManager';
import { BUILDINGS, type BuildingId } from '../src/game/world/buildings';
import { type WorldLayout, buildingBase, createCityLayout, createLayoutCollisions, doorFront } from '../src/game/world/cityLayout';
import {
  CAFE_TABLES,
  INTERIORS,
  SALON_CHAIRS_X,
  SALON_CHAIR_Y,
  SCHOOL_DESKS,
  exitPoint,
  floorArea,
  interiorLayout,
  roomStarts,
  spawnPoint,
} from '../src/game/world/interiors';
import { findPlacement, isFreeSpot } from '../src/game/world/placement';
import { propFootprint } from '../src/game/world/props';

const PLAYER = { w: 30, h: 14 };
const STEP = 8;

const footprintAt = (x: number, y: number) => ({ x: x - PLAYER.w / 2, y: y - PLAYER.h / 2, ...PLAYER });

/** Alle Punkte (Raster 8 Einheiten), die die Figur von `start` aus erreichen kann. */
function reachable(collisions: CollisionManager, start: { x: number; y: number }): Set<string> {
  const s = { gx: Math.round(start.x / STEP), gy: Math.round(start.y / STEP) };
  const seen = new Set<string>([`${s.gx},${s.gy}`]);
  const queue = [s];
  while (queue.length > 0) {
    const { gx, gy } = queue.pop()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = gx + dx;
      const ny = gy + dy;
      const key = `${nx},${ny}`;
      if (seen.has(key)) continue;
      if (collisions.collides(footprintAt(nx * STEP, ny * STEP))) continue;
      seen.add(key);
      queue.push({ gx: nx, gy: ny });
    }
  }
  return seen;
}

function canReachNear(points: Set<string>, x: number, y: number, radius: number): boolean {
  for (const key of points) {
    const [gx, gy] = key.split(',').map(Number);
    if (Math.hypot(gx * STEP - x, gy * STEP - y) <= radius) return true;
  }
  return false;
}

function propsInside(layout: WorldLayout): boolean {
  const w = layout.cols * TILE_SIZE;
  const h = layout.rows * TILE_SIZE;
  return layout.props.every((p) => p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h);
}

describe('Stadt', () => {
  const layout = createCityLayout();
  const collisions = createLayoutCollisions(layout);
  const points = reachable(collisions, layout.spawn);
  const width = layout.cols * TILE_SIZE;
  const height = layout.rows * TILE_SIZE;

  it('ist deutlich größer als der Bildschirm', () => {
    expect(width).toBeGreaterThan(1280 * 2.5);
    expect(height).toBeGreaterThan(720 * 3.5);
  });

  it('enthält alle acht Orte des Spielkonzepts', () => {
    for (const id of ['home', 'boutique', 'rewe', 'toystore', 'cafe', 'salon', 'school'] as BuildingId[]) {
      expect(layout.props.some((p) => p.type === `building-${id}`)).toBe(true);
    }
    expect(layout.zones.some((z) => z.id === 'park')).toBe(true);
  });

  it('trägt die gewünschten Namen', () => {
    expect(BUILDINGS.rewe.name).toBe('REWE');
    expect(BUILDINGS.rewe.labels[0].text).toBe('REWE');
    expect(BUILDINGS.rewe.labels[0].color).toBe('#ffffff');
    expect(BUILDINGS.rewe.visual.sign?.fill).toBe('#d9262e');
    expect(BUILDINGS.school.name).toBe('Adolf-Reichwein-Schule');
    expect(BUILDINGS.boutique.labels[0].text).toBe("Samya's Boutique");
    expect(BUILDINGS.home.labels[0].text).toBe('Hier wohnt Samya 🏠');
  });

  it('alle Orte außer den Nachbarhäusern sind betretbar', () => {
    const enterable = Object.values(BUILDINGS)
      .filter((b) => b.interior)
      .map((b) => b.id)
      .sort();
    expect(enterable).toEqual(['boutique', 'cafe', 'home', 'rewe', 'salon', 'school', 'toystore']);
    for (const def of Object.values(BUILDINGS)) {
      if (def.interior) expect(INTERIORS[def.interior].building, def.id).toBe(def.id);
    }
  });

  it('der Startpunkt ist frei und alle Objekte liegen in der Welt', () => {
    expect(collisions.collides(footprintAt(layout.spawn.x, layout.spawn.y))).toBe(false);
    expect(propsInside(layout)).toBe(true);
  });

  it('ein großer Teil der Stadt ist begehbar', () => {
    expect(points.size / ((width / STEP) * (height / STEP))).toBeGreaterThan(0.5);
  });

  it('jede Ladentür ist erreichbar, und vor der Tür ist Platz zum Herauskommen', () => {
    for (const def of Object.values(BUILDINGS)) {
      if (!def.discoverable) continue;
      const front = doorFront(def.id);
      expect(collisions.collides(footprintAt(front.x, front.y)), def.id).toBe(false);
      expect(canReachNear(points, front.x, front.y, 12), def.id).toBe(true);
      // Der Eingangsbereich (Button) liegt direkt vor der Tür
      const base = buildingBase(def.id);
      expect(canReachNear(points, base.x, base.y + 30, 30), def.id).toBe(true);
    }
  });

  it('Park, Brunnen und Schilder sind erreichbar', () => {
    const find = (id: string) => layout.props.find((p) => p.id === id)!;
    for (const id of ['fountain', 'welcome-sign', 'park-sign', 'pond']) {
      const p = find(id);
      expect(canReachNear(points, p.x, p.y + 14, 120), id).toBe(true);
    }
  });

  it('Nachbarhäuser sind durch einen Gartenzaun verschlossen', () => {
    for (const id of ['neighborBlue', 'neighborYellow'] as BuildingId[]) {
      const base = buildingBase(id);
      expect(canReachNear(points, base.x, base.y + 10, 6), id).toBe(false);
    }
  });

  it('Autos fahren auf der Fahrbahn', () => {
    expect(layout.lanes.length).toBeGreaterThanOrEqual(2);
    for (const lane of layout.lanes) {
      const row = Math.floor((lane.y - 1) / TILE_SIZE);
      const tile = layout.tiles[row][5];
      expect([5, 6]).toContain(tile);
    }
  });
});

describe('Innenräume', () => {
  for (const def of Object.values(INTERIORS)) {
    it(`${def.id}: Eingang frei, Ausgang erreichbar, Möbel im Raum`, () => {
      const layout = interiorLayout(def);
      const collisions = createLayoutCollisions(layout);
      const spawn = spawnPoint(def);
      const exit = exitPoint(def);
      expect(collisions.collides(footprintAt(spawn.x, spawn.y))).toBe(false);
      expect(propsInside(layout)).toBe(true);
      const points = reachable(collisions, spawn);
      expect(canReachNear(points, exit.x, exit.y, 20)).toBe(true);
      // Ein großer Teil des Bodens ist begehbar
      const floorCells = ((layout.cols * TILE_SIZE) / STEP) * ((layout.rows * TILE_SIZE - 176) / STEP);
      expect(points.size / floorCells).toBeGreaterThan(0.5);
    });
  }
});

describe('Samyas Haus', () => {
  const def = INTERIORS.home;
  const layout = interiorLayout(def);
  const collisions = createLayoutCollisions(layout);
  const points = reachable(collisions, spawnPoint(def));

  it('hat Wohnzimmer, Schlafzimmer und Küche mit der geforderten Einrichtung', () => {
    expect(def.rooms.map((r) => r.name).sort()).toEqual(['Küche', 'Schlafzimmer', 'Wohnzimmer']);
    const types = new Set(def.props.map((p) => p.type));
    for (const t of ['sofa', 'coffeeTable', 'rug', 'tv', 'plant', 'bed', 'wardrobe', 'mirror', 'nightstand', 'fridge', 'diningTable', 'kitchenCounter']) {
      expect(types.has(t as never), t).toBe(true);
    }
  });

  it('alle drei Räume sind durch die Durchgänge erreichbar', () => {
    const starts = roomStarts(def);
    def.rooms.forEach((room, i) => {
      const cx = starts[i] + (room.cols * TILE_SIZE) / 2;
      expect(canReachNear(points, cx, 620, 40), room.name).toBe(true);
    });
  });

  it('Kleiderschrank, Spiegel, Spielzeugkiste, Kühlschrank, Bett und Fernseher sind erreichbar', () => {
    for (const id of ['wardrobe', 'home-mirror', 'toybox', 'fridge', 'bed', 'tv']) {
      const p = def.props.find((x) => x.id === id)!;
      expect(canReachNear(points, p.x, p.y + 24, 110), id).toBe(true);
    }
  });
});

describe('Salon, Café und Schule', () => {
  const setup = (id: 'salon' | 'cafe' | 'school') => {
    const def = INTERIORS[id];
    const collisions = createLayoutCollisions(interiorLayout(def));
    return { collisions, points: reachable(collisions, spawnPoint(def)) };
  };

  it('Salon: alle drei Stühle sind erreichbar, vor dem Stuhl kann man aufstehen', () => {
    const { collisions, points } = setup('salon');
    expect(SALON_CHAIRS_X).toHaveLength(3);
    for (const x of SALON_CHAIRS_X) {
      expect(canReachNear(points, x, SALON_CHAIR_Y + 42, 60), `Stuhl ${x}`).toBe(true);
      expect(collisions.collides(footprintAt(x, SALON_CHAIR_Y + 46))).toBe(false);
    }
  });

  it('Café: Theke, Tische und Kuchentisch sind erreichbar; neben dem Tisch kann man aufstehen', () => {
    const { collisions, points } = setup('cafe');
    expect(canReachNear(points, 704, 402, 80)).toBe(true);
    expect(canReachNear(points, 1110, 682, 80)).toBe(true);
    for (const t of CAFE_TABLES) {
      expect(canReachNear(points, t.x, t.y + 24, 70), `Tisch ${t.x}/${t.y}`).toBe(true);
      expect(collisions.collides(footprintAt(t.x + 80, t.y - 8))).toBe(false);
      expect(canReachNear(points, t.x + 80, t.y - 8, 12)).toBe(true);
    }
  });

  it('Schule: Tafel, Bänke, Malecke, Xylophon, Regal und Globus sind erreichbar', () => {
    const { collisions, points } = setup('school');
    for (const [x, y] of [[704, 250], [150, 628], [1260, 628], [160, 356], [1060, 346]]) {
      expect(canReachNear(points, x, y, 90), `${x}/${y}`).toBe(true);
    }
    for (const d of SCHOOL_DESKS) {
      expect(canReachNear(points, d.x, d.y + 28, 50), `Bank ${d.x}/${d.y}`).toBe(true);
      expect(collisions.collides(footprintAt(d.x, d.y + 30))).toBe(false);
    }
  });
});

describe('Spielzeug aufstellen', () => {
  const def = INTERIORS.home;
  const layout = interiorLayout(def);
  const solids = layout.props.map((p) => propFootprint(p)).filter((r): r is NonNullable<typeof r> => r !== null);
  const exit = exitPoint(def);
  const ctx = (occupied: { x: number; y: number }[] = []) => ({
    area: floorArea(def),
    solids: [...solids, ...(layout.solids ?? [])],
    occupied,
    keepClear: [{ x: exit.x, y: exit.y, r: 110 }],
  });

  it('stellt vor die Figur, wenn dort Platz ist', () => {
    const spot = findPlacement({ x: 1500, y: 620 }, 'left', ctx());
    expect(spot).toEqual({ x: 1436, y: 630 });
  });

  it('nicht in Möbel, nicht an die Wand, nicht vor die Haustür', () => {
    const sofa = def.props.find((p) => p.type === 'sofa')!;
    expect(isFreeSpot({ x: sofa.x, y: sofa.y - 10 }, ctx())).toBe(false);
    expect(isFreeSpot({ x: 600, y: 120 }, ctx())).toBe(false);
    expect(isFreeSpot({ x: exit.x, y: exit.y - 20 }, ctx())).toBe(false);
  });

  it('nicht auf ein anderes Spielzeug', () => {
    expect(isFreeSpot({ x: 1500, y: 620 }, ctx([{ x: 1510, y: 625 }]))).toBe(false);
    expect(isFreeSpot({ x: 1500, y: 620 }, ctx([{ x: 1700, y: 625 }]))).toBe(true);
  });

  it('weicht aus, wenn vorne kein Platz ist', () => {
    const wardrobe = def.props.find((p) => p.type === 'wardrobe')!;
    const spot = findPlacement({ x: wardrobe.x, y: wardrobe.y + 40 }, 'up', ctx());
    expect(spot).not.toBeNull();
    expect(isFreeSpot(spot!, ctx())).toBe(true);
  });
});

describe('computeRenderScale', () => {
  it('nutzt bei „Sparsam“ immer 1×', () => {
    expect(computeRenderScale('low', { devicePixelRatio: 3, cssHeight: 390 })).toBe(1);
  });

  it('nutzt bei hochauflösenden Handys mehr Auflösung', () => {
    expect(computeRenderScale('auto', { devicePixelRatio: 3, cssHeight: 390 })).toBe(1.5);
    expect(computeRenderScale('high', { devicePixelRatio: 3, cssHeight: 390 })).toBe(1.75);
    expect(computeRenderScale('high', { devicePixelRatio: 2, cssHeight: 1024 })).toBe(2);
  });

  it('spart auf Geräten mit wenig Speicher', () => {
    expect(computeRenderScale('auto', { devicePixelRatio: 3, cssHeight: 390, deviceMemory: 2 })).toBe(1);
  });

  it('rechnet nie unter 1×', () => {
    expect(computeRenderScale('auto', { devicePixelRatio: 1, cssHeight: 300 })).toBe(1);
  });
});
