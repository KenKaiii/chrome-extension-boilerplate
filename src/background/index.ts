/**
 * Background Service Worker
 * Handles extension lifecycle, messaging, and background tasks
 */

import { createMessageHandler } from "@/lib/messaging";
import {
  getStorage,
  setStorage,
  initializeStorage,
  defaultSettings,
} from "@/lib/storage";

console.log("[Background] Service worker started");

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("[Background] Extension installed:", details.reason);

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // First-time installation
    await initializeStorage();
    console.log("[Background] Storage initialized with defaults");

    // Optional: Open welcome/onboarding page
    // chrome.tabs.create({ url: chrome.runtime.getURL("src/options/options.html") });
  }

  if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    // Extension updated
    console.log(
      "[Background] Extension updated from version:",
      details.previousVersion
    );
  }
});

// Handle extension startup (browser restart, etc.)
chrome.runtime.onStartup.addListener(async () => {
  console.log("[Background] Extension started");
  await initializeStorage();
});

// Set up message handlers
createMessageHandler({
  GET_TAB_INFO: async (_payload, sender) => {
    const tab = sender.tab;
    return {
      url: tab?.url ?? "",
      title: tab?.title ?? "",
    };
  },

  GET_SETTINGS: async () => {
    const settings = await getStorage("settings");
    return settings ?? defaultSettings;
  },

  UPDATE_SETTINGS: async (payload) => {
    const currentSettings = (await getStorage("settings")) ?? defaultSettings;
    const newSettings = { ...currentSettings, ...payload };
    await setStorage("settings", newSettings);
    return { success: true };
  },

  TOGGLE_EXTENSION: async (payload) => {
    const currentSettings = (await getStorage("settings")) ?? defaultSettings;
    await setStorage("settings", { ...currentSettings, enabled: payload.enabled });

    // Notify all tabs about the state change
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: "EXTENSION_STATE_CHANGED",
            payload: { enabled: payload.enabled },
          });
        } catch {
          // Tab might not have content script loaded
        }
      }
    }

    return { success: true };
  },

  CONTENT_ACTION: async (payload) => {
    console.log("[Background] Content action received:", payload);
    return { success: true, result: payload.data };
  },
});

// Handle extension icon click (if no popup)
chrome.action.onClicked.addListener(async (tab) => {
  // This only fires if there's no default_popup in manifest
  console.log("[Background] Extension icon clicked on tab:", tab.id);
});

// Context menu setup (optional)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "extension-action",
    title: "Extension Action",
    contexts: ["page", "selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "extension-action") {
    console.log("[Background] Context menu clicked:", info, tab);
    // Handle context menu action
  }
});

// Handle tab updates (optional)
chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const settings = await getStorage("settings");
    if (settings?.enabled) {
      // Perform action when tab loads
      console.log("[Background] Tab loaded:", tab.url);
    }
  }
});

// Keep service worker alive for long-running tasks (use sparingly)
// chrome.alarms.create("keepAlive", { periodInMinutes: 0.5 });
// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === "keepAlive") {
//     console.log("[Background] Keep alive alarm");
//   }
// });

// Export for type checking
export {};
