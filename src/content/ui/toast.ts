import { createShadowHost, injectStyles } from "./shadow-dom";
import { styles } from "./styles";

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info",
  duration = 3000,
): void {
  // Remove existing toast
  const existing = document.getElementById("twitch-clips-todo-toast");
  existing?.remove();
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  const { host, shadow } = createShadowHost("twitch-clips-todo-toast");

  // Add animation keyframes
  injectStyles(
    shadow,
    `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `,
  );

  const toast = document.createElement("div");
  const typeStyle = styles.toast[type];
  toast.setAttribute("style", styles.toast.base + typeStyle);
  toast.textContent = message;

  shadow.appendChild(toast);
  document.body.appendChild(host);

  toastTimeout = setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => host.remove(), 300);
  }, duration);
}
