import { createChromeAPI } from "../infrastructure/chrome";
import { createRecordService, createLinkingService, createCleanupService } from "../services";
import { handleMessage } from "./message-handler";
import type { MessageToBackground } from "../shared/types";

// Initialize Chrome API
const chromeAPI = createChromeAPI();

// Create services with DI
const recordService = createRecordService({ storage: chromeAPI.storage });
const linkingService = createLinkingService({ recordService });
const cleanupService = createCleanupService({
  storage: chromeAPI.storage,
  alarms: chromeAPI.alarms,
});

// Initialize cleanup on startup
cleanupService.initialize();

// Message handler
chrome.runtime.onMessage.addListener((message: MessageToBackground, sender, sendResponse) => {
  // Handle OPEN_SIDE_PANEL separately as it needs sender.tab
  if (message.type === "OPEN_SIDE_PANEL" && sender.tab?.id) {
    chromeAPI.sidePanel.open({ tabId: sender.tab.id })
      .then(() => sendResponse({ success: true, data: null }))
      .catch((error) => sendResponse({ success: false, error: String(error) }));
    return true;
  }

  handleMessage(message, { recordService, linkingService })
    .then(sendResponse)
    .catch((error) =>
      sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" })
    );
  return true; // Keep channel open for async response
});

// Keyboard shortcut handler
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "record-moment" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_RECORD" });
  }
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chromeAPI.sidePanel.open({ tabId: tab.id });
  }
});

console.log("[Twitch Clip Todo] Service Worker initialized");
