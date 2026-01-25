export interface EventBinding<K extends keyof DocumentEventMap> {
  target: Document | HTMLElement | Window;
  event: K;
  handler: (e: DocumentEventMap[K]) => void;
  options?: AddEventListenerOptions;
}

export interface EventManager {
  bind<K extends keyof DocumentEventMap>(binding: EventBinding<K>): void;
  cleanup(): void;
}

export function createEventManager(): EventManager {
  const bindings: Array<{
    target: EventTarget;
    event: string;
    handler: EventListener;
    options?: AddEventListenerOptions;
  }> = [];

  return {
    bind({ target, event, handler, options }) {
      target.addEventListener(event, handler as EventListener, options);
      bindings.push({ target, event, handler: handler as EventListener, options });
    },
    cleanup() {
      for (const { target, event, handler, options } of bindings) {
        target.removeEventListener(event, handler, options);
      }
      bindings.length = 0;
    },
  };
}
