import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEventManager } from "./event-manager";

describe("createEventManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("binds event listener to target", () => {
    const manager = createEventManager();
    const target = document.createElement("div");
    const handler = vi.fn();

    manager.bind({ target, event: "click", handler });
    target.dispatchEvent(new MouseEvent("click"));

    expect(handler).toHaveBeenCalledOnce();
  });

  it("removes event listeners on cleanup", () => {
    const manager = createEventManager();
    const target = document.createElement("div");
    const handler = vi.fn();

    manager.bind({ target, event: "click", handler });
    manager.cleanup();
    target.dispatchEvent(new MouseEvent("click"));

    expect(handler).not.toHaveBeenCalled();
  });

  it("handles multiple bindings", () => {
    const manager = createEventManager();
    const target1 = document.createElement("div");
    const target2 = document.createElement("div");
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    manager.bind({ target: target1, event: "click", handler: handler1 });
    manager.bind({ target: target2, event: "click", handler: handler2 });

    target1.dispatchEvent(new MouseEvent("click"));
    target2.dispatchEvent(new MouseEvent("click"));

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it("cleans up all bindings at once", () => {
    const manager = createEventManager();
    const target1 = document.createElement("div");
    const target2 = document.createElement("div");
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    manager.bind({ target: target1, event: "click", handler: handler1 });
    manager.bind({ target: target2, event: "click", handler: handler2 });
    manager.cleanup();

    target1.dispatchEvent(new MouseEvent("click"));
    target2.dispatchEvent(new MouseEvent("click"));

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });
});
