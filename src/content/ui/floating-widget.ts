import widgetStyles from "./floating-widget.css?raw";
import { createShadowHost, injectStyles } from "./shadow-dom";
import { BOOKMARK_ICON_OUTLINED } from "./styles";

const STORAGE_KEY = "twitch-clip-todo-widget-position";
const HIDE_DELAY_MS = 3000;
const WIDGET_WIDTH = 60;
const WIDGET_HEIGHT = 40;

interface WidgetPosition {
  horizontal: "left" | "right";
  horizontalOffset: number;
  vertical: "top" | "bottom";
  verticalOffset: number;
}

interface DragState {
  isDragging: boolean;
  didDrag: boolean;
  startPos: { x: number; y: number };
  widgetStartPos: { x: number; y: number };
}

interface AutoHideState {
  timeoutId: number | null;
  isHidden: boolean;
}

interface EventHandlers {
  mouseMove: ((e: MouseEvent) => void) | null;
  mouseUp: (() => void) | null;
  mouseLeave: ((e: MouseEvent) => void) | null;
  mouseEnter: (() => void) | null;
}

class FloatingWidgetManager {
  private host: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;
  private onClick: (() => void) | null = null;

  private dragState: DragState = {
    isDragging: false,
    didDrag: false,
    startPos: { x: 0, y: 0 },
    widgetStartPos: { x: 0, y: 0 },
  };

  private autoHideState: AutoHideState = {
    timeoutId: null,
    isHidden: false,
  };

  private eventHandlers: EventHandlers = {
    mouseMove: null,
    mouseUp: null,
    mouseLeave: null,
    mouseEnter: null,
  };

  show(count: number, onClick: () => void): void {
    // Clean up existing widget
    this.hide();

    this.onClick = onClick;

    const widget = this.createWidget(count);
    this.host = widget;

    // Set initial position
    const pos = this.loadPosition();
    widget.style.cssText = `
      position: fixed;
      left: ${pos.x}px;
      top: ${pos.y}px;
      z-index: 10000;
    `;

    document.body.appendChild(widget);

    this.setupDragHandlers();
    this.setupAutoHide();
  }

  hide(): void {
    if (this.autoHideState.timeoutId) {
      clearTimeout(this.autoHideState.timeoutId);
      this.autoHideState.timeoutId = null;
    }

    this.cleanupEventListeners();

    this.host?.remove();
    this.host = null;
    this.shadow = null;
    this.onClick = null;
    this.dragState.isDragging = false;
    this.autoHideState.isHidden = false;
  }

  updateCount(count: number): void {
    if (!this.shadow) return;

    const button = this.shadow.querySelector("button");
    if (!button) return;

    // Find existing badge
    const existingBadge = button.querySelector(".badge");

    if (count > 0) {
      if (existingBadge) {
        existingBadge.textContent = String(count);
      } else {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = String(count);
        button.appendChild(badge);
      }
    } else {
      existingBadge?.remove();
    }

    button.setAttribute(
      "aria-label",
      count > 0
        ? `${count} pending clips - Click to open popup`
        : "Clip Todo - Click to open popup",
    );
  }

  private loadPosition(): { x: number; y: number } {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const pos: WidgetPosition = JSON.parse(saved);
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Convert edge-based offset to absolute coordinates
        const x =
          pos.horizontal === "left"
            ? pos.horizontalOffset
            : vw - pos.horizontalOffset - WIDGET_WIDTH;
        const y =
          pos.vertical === "top" ? pos.verticalOffset : vh - pos.verticalOffset - WIDGET_HEIGHT;

        return {
          x: Math.max(0, Math.min(x, vw - WIDGET_WIDTH)),
          y: Math.max(0, Math.min(y, vh - WIDGET_HEIGHT)),
        };
      }
    } catch {
      // Ignore parse errors or old format
    }
    // Default: top-right area
    return { x: window.innerWidth - 80, y: 100 };
  }

  private savePosition(rect: DOMRect): void {
    try {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Determine which edge is closer
      const pos: WidgetPosition = {
        horizontal: rect.left < vw - rect.right ? "left" : "right",
        horizontalOffset: rect.left < vw - rect.right ? rect.left : vw - rect.right,
        vertical: rect.top < vh - rect.bottom ? "top" : "bottom",
        verticalOffset: rect.top < vh - rect.bottom ? rect.top : vh - rect.bottom,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch {
      // Ignore storage errors
    }
  }

  private createWidget(count: number): HTMLElement {
    const { host, shadow } = createShadowHost("twitch-clip-todo-floating-widget");
    this.shadow = shadow;

    // Inject CSS from file
    injectStyles(shadow, widgetStyles);

    const button = document.createElement("button");
    button.className = "widget";
    button.setAttribute(
      "aria-label",
      count > 0
        ? `${count} pending clips - Click to open popup`
        : "Clip Todo - Click to open popup",
    );
    button.title = "Click to open Clip Todo panel\nDrag to move";
    button.innerHTML = `
      <span class="icon">${BOOKMARK_ICON_OUTLINED}</span>
      ${count > 0 ? `<span class="badge">${count}</span>` : ""}
    `;

    // Drag start
    button.addEventListener("mousedown", (e) => {
      this.dragState.isDragging = true;
      this.dragState.didDrag = false;
      this.dragState.startPos = { x: e.clientX, y: e.clientY };
      const rect = host.getBoundingClientRect();
      this.dragState.widgetStartPos = { x: rect.left, y: rect.top };
      button.classList.add("dragging");
    });

    // Click (only if not dragging)
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      // Only trigger click if we didn't actually drag
      if (!this.dragState.didDrag && this.onClick) {
        this.onClick();
      }
    });

    shadow.appendChild(button);

    return host;
  }

  private setupDragHandlers(): void {
    this.eventHandlers.mouseMove = (e: MouseEvent) => {
      if (!this.dragState.isDragging || !this.host) return;

      const deltaX = e.clientX - this.dragState.startPos.x;
      const deltaY = e.clientY - this.dragState.startPos.y;

      // Mark as dragged if moved more than 3 pixels
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        this.dragState.didDrag = true;
      }

      let newX = this.dragState.widgetStartPos.x + deltaX;
      let newY = this.dragState.widgetStartPos.y + deltaY;

      // Keep within viewport
      newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 40));

      this.host.style.left = `${newX}px`;
      this.host.style.top = `${newY}px`;
    };

    this.eventHandlers.mouseUp = () => {
      if (this.dragState.isDragging && this.host) {
        this.dragState.isDragging = false;
        const button = this.shadow?.querySelector("button");
        if (button) {
          button.classList.remove("dragging");
        }
        // Save position using edge-based logic
        this.savePosition(this.host.getBoundingClientRect());
      }
    };

    document.addEventListener("mousemove", this.eventHandlers.mouseMove);
    document.addEventListener("mouseup", this.eventHandlers.mouseUp);
  }

  private setupAutoHide(): void {
    // Use mouseout with relatedTarget check for reliable detection
    this.eventHandlers.mouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse actually leaves the document (relatedTarget is null)
      if (e.relatedTarget !== null) return;

      if (this.autoHideState.timeoutId) {
        clearTimeout(this.autoHideState.timeoutId);
      }
      this.autoHideState.timeoutId = window.setTimeout(() => {
        const button = this.shadow?.querySelector("button");
        if (button && !this.dragState.isDragging) {
          this.autoHideState.isHidden = true; // Mark as auto-hidden immediately
          button.classList.add("hiding");
          setTimeout(() => {
            button.classList.remove("hiding");
            button.classList.add("hidden");
          }, 300);
        }
      }, HIDE_DELAY_MS);
    };

    this.eventHandlers.mouseEnter = () => {
      if (this.autoHideState.timeoutId) {
        clearTimeout(this.autoHideState.timeoutId);
        this.autoHideState.timeoutId = null;
      }
      // Don't re-show if auto-hidden
      if (this.autoHideState.isHidden) return;

      const button = this.shadow?.querySelector("button");
      if (button) {
        button.classList.remove("hidden", "hiding");
      }
    };

    document.addEventListener("mouseout", this.eventHandlers.mouseLeave);
    document.addEventListener("mouseenter", this.eventHandlers.mouseEnter);
  }

  private cleanupEventListeners(): void {
    if (this.eventHandlers.mouseMove) {
      document.removeEventListener("mousemove", this.eventHandlers.mouseMove);
      this.eventHandlers.mouseMove = null;
    }
    if (this.eventHandlers.mouseUp) {
      document.removeEventListener("mouseup", this.eventHandlers.mouseUp);
      this.eventHandlers.mouseUp = null;
    }
    if (this.eventHandlers.mouseLeave) {
      document.removeEventListener("mouseout", this.eventHandlers.mouseLeave);
      this.eventHandlers.mouseLeave = null;
    }
    if (this.eventHandlers.mouseEnter) {
      document.removeEventListener("mouseenter", this.eventHandlers.mouseEnter);
      this.eventHandlers.mouseEnter = null;
    }
  }
}

// Singleton instance
const widgetManager = new FloatingWidgetManager();

// Export functions that delegate to the manager (maintain existing API)
export function showFloatingWidget(count: number, onClick: () => void): void {
  widgetManager.show(count, onClick);
}

export function hideFloatingWidget(): void {
  widgetManager.hide();
}

export function updateFloatingWidgetCount(count: number): void {
  widgetManager.updateCount(count);
}
