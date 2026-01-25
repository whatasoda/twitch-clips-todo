import type { EventManager } from "./event-manager";

export interface DraggableOptions {
  element: HTMLElement;
  handle?: HTMLElement;
  threshold?: number; // Default 3px
  bounds?: { width: number; height: number } | (() => { width: number; height: number });
  onDragStart?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  onClick?: () => void;
}

export interface DraggableBehavior {
  readonly isDragging: boolean;
  readonly didDrag: boolean;
  destroy(): void;
}

interface DragState {
  isDragging: boolean;
  didDrag: boolean;
  startPos: { x: number; y: number };
  elementStartPos: { x: number; y: number };
}

export function createDraggable(
  options: DraggableOptions,
  eventManager: EventManager,
): DraggableBehavior {
  const { element, handle, threshold = 3, bounds, onDragStart, onDragEnd, onClick } = options;

  const dragHandle = handle ?? element;

  const state: DragState = {
    isDragging: false,
    didDrag: false,
    startPos: { x: 0, y: 0 },
    elementStartPos: { x: 0, y: 0 },
  };

  function getBounds(): { width: number; height: number } {
    if (!bounds) {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return typeof bounds === "function" ? bounds() : bounds;
  }

  function handleMouseDown(e: MouseEvent): void {
    state.isDragging = true;
    state.didDrag = false;
    state.startPos = { x: e.clientX, y: e.clientY };
    const rect = element.getBoundingClientRect();
    state.elementStartPos = { x: rect.left, y: rect.top };
    onDragStart?.();
  }

  function handleMouseMove(e: MouseEvent): void {
    if (!state.isDragging) return;

    const deltaX = e.clientX - state.startPos.x;
    const deltaY = e.clientY - state.startPos.y;

    // Mark as dragged if moved more than threshold
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      state.didDrag = true;
    }

    const { width, height } = getBounds();
    const elementRect = element.getBoundingClientRect();

    let newX = state.elementStartPos.x + deltaX;
    let newY = state.elementStartPos.y + deltaY;

    // Keep within bounds
    newX = Math.max(0, Math.min(newX, width - elementRect.width));
    newY = Math.max(0, Math.min(newY, height - elementRect.height));

    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;
  }

  function handleMouseUp(): void {
    if (state.isDragging) {
      state.isDragging = false;
      if (state.didDrag) {
        const rect = element.getBoundingClientRect();
        onDragEnd?.({ x: rect.left, y: rect.top });
      }
    }
  }

  function handleClick(e: MouseEvent): void {
    e.stopPropagation();
    // Only trigger click if we didn't actually drag
    if (!state.didDrag) {
      onClick?.();
    }
  }

  // Bind events
  dragHandle.addEventListener("mousedown", handleMouseDown);
  dragHandle.addEventListener("click", handleClick);
  eventManager.bind({ target: document, event: "mousemove", handler: handleMouseMove });
  eventManager.bind({ target: document, event: "mouseup", handler: handleMouseUp });

  return {
    get isDragging() {
      return state.isDragging;
    },
    get didDrag() {
      return state.didDrag;
    },
    destroy() {
      dragHandle.removeEventListener("mousedown", handleMouseDown);
      dragHandle.removeEventListener("click", handleClick);
      // Note: document events are cleaned up via eventManager.cleanup()
    },
  };
}
