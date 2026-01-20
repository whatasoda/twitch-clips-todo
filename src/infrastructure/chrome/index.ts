export { createAlarmsAPI } from "./alarms";
export { createCommandsAPI } from "./commands";
export { createRuntimeAPI } from "./runtime";
export { createSidePanelAPI } from "./side-panel";
export { createStorageAPI } from "./storage";
export { createTabsAPI } from "./tabs";
export * from "./types";

import { createAlarmsAPI } from "./alarms";
import { createCommandsAPI } from "./commands";
import { createRuntimeAPI } from "./runtime";
import { createSidePanelAPI } from "./side-panel";
import { createStorageAPI } from "./storage";
import { createTabsAPI } from "./tabs";
import type { ChromeAPI } from "./types";

export function createChromeAPI(): ChromeAPI {
  return {
    storage: createStorageAPI(),
    runtime: createRuntimeAPI(),
    tabs: createTabsAPI(),
    commands: createCommandsAPI(),
    sidePanel: createSidePanelAPI(),
    alarms: createAlarmsAPI(),
  };
}
