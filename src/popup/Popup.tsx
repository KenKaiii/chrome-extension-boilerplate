import { useState, useEffect } from "react";
import { sendToBackground, sendToActiveTab } from "@/lib/messaging";

interface Settings {
  enabled: boolean;
  theme: "light" | "dark" | "system";
  notifications: boolean;
}

interface TabInfo {
  url: string;
  title: string;
}

export function Popup() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionResult, setActionResult] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Get settings
      const settingsResponse = await sendToBackground("GET_SETTINGS", undefined);
      if (settingsResponse.success && settingsResponse.data) {
        setSettings(settingsResponse.data);
      }

      // Get current tab info
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab) {
        setTabInfo({
          url: tab.url ?? "",
          title: tab.title ?? "",
        });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleEnabled() {
    if (!settings) return;

    const newEnabled = !settings.enabled;
    const response = await sendToBackground("TOGGLE_EXTENSION", {
      enabled: newEnabled,
    });

    if (response.success) {
      setSettings({ ...settings, enabled: newEnabled });
    }
  }

  async function handleAction(action: string) {
    setActionResult("");

    const response = await sendToActiveTab("CONTENT_ACTION", {
      action,
      data: { timestamp: Date.now() },
    });

    if (response.success) {
      setActionResult(`Action "${action}" completed!`);
    } else {
      setActionResult(`Error: ${response.error}`);
    }

    // Clear result after 3 seconds
    setTimeout(() => setActionResult(""), 3000);
  }

  function openOptions() {
    chrome.runtime.openOptionsPage();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">
          Chrome Extension
        </h1>
        <button
          onClick={openOptions}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Current Tab Info */}
      {tabInfo && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Current Page</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {tabInfo.title || "Untitled"}
          </p>
          <p className="text-xs text-gray-500 truncate">{tabInfo.url}</p>
        </div>
      )}

      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
        <span className="text-sm font-medium text-gray-700">
          Extension Enabled
        </span>
        <button
          onClick={toggleEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings?.enabled ? "bg-primary-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings?.enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => handleAction("highlight")}
          disabled={!settings?.enabled}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Highlight Page
        </button>
        <button
          onClick={() => handleAction("inject")}
          disabled={!settings?.enabled}
          className="w-full px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Inject Widget
        </button>
        <button
          onClick={() => handleAction("getData")}
          disabled={!settings?.enabled}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Get Page Data
        </button>
      </div>

      {/* Action Result */}
      {actionResult && (
        <div className="mt-3 p-2 text-sm text-center text-green-700 bg-green-50 rounded-lg animate-slide-up">
          {actionResult}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-center text-gray-400">
          Version {chrome.runtime.getManifest().version}
        </p>
      </div>
    </div>
  );
}
