import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPositionPersistence } from "./position-persistence";

describe("createPositionPersistence", () => {
  const storageKey = "test-position";

  beforeEach(() => {
    localStorage.clear();
    // Mock window dimensions
    vi.stubGlobal("innerWidth", 1920);
    vi.stubGlobal("innerHeight", 1080);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns default position when no saved position exists", () => {
    const persistence = createPositionPersistence({
      storageKey,
      elementSize: { width: 100, height: 50 },
      defaultPosition: { x: 500, y: 200 },
    });

    const pos = persistence.load();
    expect(pos).toEqual({ x: 500, y: 200 });
  });

  it("returns calculated default when no defaultPosition provided", () => {
    const persistence = createPositionPersistence({
      storageKey,
      elementSize: { width: 100, height: 50 },
    });

    const pos = persistence.load();
    // Default: innerWidth - width - 20 = 1920 - 100 - 20 = 1800
    expect(pos.x).toBe(1800);
    expect(pos.y).toBe(100);
  });

  it("saves position as edge-based coordinates", () => {
    const persistence = createPositionPersistence({
      storageKey,
      elementSize: { width: 100, height: 50 },
    });

    // Position near top-left
    persistence.save({ left: 100, top: 80, right: 200, bottom: 130 } as DOMRect);

    const savedJson = localStorage.getItem(storageKey);
    expect(savedJson).not.toBeNull();
    const saved = JSON.parse(savedJson ?? "");
    expect(saved.horizontal).toBe("left");
    expect(saved.horizontalOffset).toBe(100);
    expect(saved.vertical).toBe("top");
    expect(saved.verticalOffset).toBe(80);
  });

  it("saves position near right edge correctly", () => {
    const persistence = createPositionPersistence({
      storageKey,
      elementSize: { width: 100, height: 50 },
    });

    // Position near bottom-right: left=1800, right=1900, window=1920
    // Distance from left: 1800, Distance from right: 1920-1900=20
    persistence.save({
      left: 1800,
      top: 900,
      right: 1900,
      bottom: 950,
    } as DOMRect);

    const savedJson = localStorage.getItem(storageKey);
    expect(savedJson).not.toBeNull();
    const saved = JSON.parse(savedJson ?? "");
    expect(saved.horizontal).toBe("right");
    expect(saved.horizontalOffset).toBe(20); // 1920 - 1900
  });

  it("loads saved position correctly", () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        horizontal: "left",
        horizontalOffset: 150,
        vertical: "top",
        verticalOffset: 100,
      }),
    );

    const persistence = createPositionPersistence({
      storageKey,
      elementSize: { width: 100, height: 50 },
    });

    const pos = persistence.load();
    expect(pos).toEqual({ x: 150, y: 100 });
  });

  it("loads right-edge position correctly", () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        horizontal: "right",
        horizontalOffset: 20, // 20px from right edge
        vertical: "bottom",
        verticalOffset: 30, // 30px from bottom edge
      }),
    );

    const persistence = createPositionPersistence({
      storageKey,
      elementSize: { width: 100, height: 50 },
    });

    const pos = persistence.load();
    // x = 1920 - 20 - 100 = 1800
    // y = 1080 - 30 - 50 = 1000
    expect(pos).toEqual({ x: 1800, y: 1000 });
  });

  it("clamps position to viewport bounds", () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        horizontal: "left",
        horizontalOffset: -100, // Invalid negative offset
        vertical: "top",
        verticalOffset: -50,
      }),
    );

    const persistence = createPositionPersistence({
      storageKey,
      elementSize: { width: 100, height: 50 },
    });

    const pos = persistence.load();
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeGreaterThanOrEqual(0);
  });
});
