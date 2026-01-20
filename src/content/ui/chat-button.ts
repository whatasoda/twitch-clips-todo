import { styles } from "./styles";

let chatButtonElement: HTMLElement | null = null;
let retryTimeoutId: number | null = null;
let observer: MutationObserver | null = null;

// Same bookmark icon as the player button
const bookmarkIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
  <path d="M4 2h12a1 1 0 0 1 1 1v15.143a.5.5 0 0 1-.766.424L10 15.03l-6.234 3.536A.5.5 0 0 1 3 18.143V3a1 1 0 0 1 1-1z"/>
</svg>`;

function createChatButton(onClick: () => void): HTMLElement {
  const host = document.createElement("div");
  host.id = "twitch-clips-todo-chat-button";
  const shadowRoot = host.attachShadow({ mode: "closed" });

  const button = document.createElement("button");
  button.setAttribute("style", styles.chatButton.base);
  button.setAttribute("aria-label", "Clip Later (Alt+Shift+C)");
  button.title = "Record moment (Alt+Shift+C)";
  button.innerHTML = bookmarkIcon;

  button.addEventListener("mouseenter", () => {
    button.style.background = "rgba(255, 255, 255, 0.15)";
  });
  button.addEventListener("mouseleave", () => {
    button.style.background = "transparent";
  });
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });

  shadowRoot.appendChild(button);

  return host;
}

/**
 * Find the chat settings gear button.
 */
function findChatSettingsButton(): HTMLElement | null {
  return document.querySelector('[data-a-target="chat-settings"]');
}

/**
 * Try to inject the button next to chat settings gear icon.
 * Returns true if successful.
 */
function tryInjectNextToChatSettings(buttonHost: HTMLElement): boolean {
  const chatSettings = findChatSettingsButton();

  if (chatSettings) {
    // Navigate up to find the wrapper
    let wrapper = chatSettings.parentElement;

    while (wrapper && wrapper.parentElement) {
      const parent = wrapper.parentElement;
      // Check if parent is a button container
      if (parent.children.length >= 1) {
        // Insert our button before the chat settings button's wrapper
        parent.insertBefore(buttonHost, wrapper);
        return true;
      }
      wrapper = parent;
    }
  }

  return false;
}

function attemptInjection(onClick: () => void): void {
  if (chatButtonElement) return;

  const button = createChatButton(onClick);
  chatButtonElement = button;

  if (!tryInjectNextToChatSettings(button)) {
    // If we couldn't inject, store the button but don't add it to DOM yet
    chatButtonElement = null;
  }
}

export function injectChatButton(onClick: () => void): void {
  // Clean up any previous retry attempts
  if (retryTimeoutId !== null) {
    clearTimeout(retryTimeoutId);
    retryTimeoutId = null;
  }
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Try immediate injection
  attemptInjection(onClick);

  // If injection failed, set up observer to retry
  if (!chatButtonElement) {
    const button = createChatButton(onClick);

    observer = new MutationObserver(() => {
      if (chatButtonElement) return;

      const chatSettings = findChatSettingsButton();
      if (chatSettings) {
        chatButtonElement = button;

        if (!tryInjectNextToChatSettings(button)) {
          chatButtonElement = null;
        } else {
          // Success - clean up observer
          observer?.disconnect();
          observer = null;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also retry with a timeout as backup
    retryTimeoutId = window.setTimeout(() => {
      if (chatButtonElement) return;

      chatButtonElement = button;
      if (!tryInjectNextToChatSettings(button)) {
        chatButtonElement = null;
      }

      // Clean up observer
      observer?.disconnect();
      observer = null;
    }, 2000);
  }
}

export function removeChatButton(): void {
  if (retryTimeoutId !== null) {
    clearTimeout(retryTimeoutId);
    retryTimeoutId = null;
  }
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  chatButtonElement?.remove();
  chatButtonElement = null;
}
