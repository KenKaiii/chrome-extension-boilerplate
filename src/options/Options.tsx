import { useState, useEffect } from "react";
import { sendToBackground } from "@/lib/messaging";
import { onStorageChange, clearStorage } from "@/lib/storage";

interface Settings {
  enabled: boolean;
  theme: "light" | "dark" | "system";
  notifications: boolean;
}

export function Options() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();

    // Listen for storage changes
    const unsubscribe = onStorageChange((changes) => {
      if (changes["settings"]) {
        setSettings(changes["settings"].newValue as Settings);
      }
    });

    return unsubscribe;
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const response = await sendToBackground("GET_SETTINGS", undefined);
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    if (!settings) return;

    setSaving(true);
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await sendToBackground("UPDATE_SETTINGS", { [key]: value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save setting:", error);
      setSettings(settings); // Revert on error
    } finally {
      setSaving(false);
    }
  }

  async function handleResetSettings() {
    if (!confirm("Are you sure you want to reset all settings to defaults?")) {
      return;
    }

    setSaving(true);
    try {
      await clearStorage();
      await loadSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to reset settings:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Extension Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure your Chrome extension preferences
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {/* Enable/Disable */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Enable Extension
                </h3>
                <p className="text-sm text-gray-500">
                  Toggle the extension on or off globally
                </p>
              </div>
              <button
                onClick={() => updateSetting("enabled", !settings?.enabled)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.enabled ? "bg-primary-600" : "bg-gray-300"
                } disabled:opacity-50`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Theme</h3>
            <p className="text-sm text-gray-500 mb-4">
              Choose your preferred color theme
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateSetting("theme", theme)}
                  disabled={saving}
                  className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                    settings?.theme === theme
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  } disabled:opacity-50`}
                >
                  <span className="capitalize">{theme}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Notifications
                </h3>
                <p className="text-sm text-gray-500">
                  Receive notifications from the extension
                </p>
              </div>
              <button
                onClick={() =>
                  updateSetting("notifications", !settings?.notifications)
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings?.notifications ? "bg-primary-600" : "bg-gray-300"
                } disabled:opacity-50`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Reset Settings
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Restore all settings to their default values
            </p>
            <button
              onClick={handleResetSettings}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Save Indicator */}
        {saved && (
          <div className="mt-4 p-3 text-sm text-center text-green-700 bg-green-50 rounded-lg animate-fade-in">
            Settings saved successfully!
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Chrome Extension Boilerplate v{chrome.runtime.getManifest().version}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Created by Ken Kai |{" "}
            <a
              href="https://www.youtube.com/@kenkaidoesai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              YouTube
            </a>{" "}
            |{" "}
            <a
              href="https://www.skool.com/kenkai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Skool
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
