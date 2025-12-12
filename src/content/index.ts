/**
 * Content Script
 * Runs in the context of web pages
 */

import "./content.css";

console.log("[Content Script] Loaded on:", window.location.href);

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("[Content Script] Message received:", message);

  switch (message.type) {
    case "CONTENT_ACTION": {
      const result = handleContentAction(message.payload);
      sendResponse({ success: true, data: result });
      break;
    }

    case "EXTENSION_STATE_CHANGED": {
      handleExtensionStateChange(message.payload.enabled);
      sendResponse({ success: true });
      break;
    }

    case "GET_TAB_INFO": {
      sendResponse({
        success: true,
        data: {
          url: window.location.href,
          title: document.title,
        },
      });
      break;
    }

    default:
      sendResponse({ success: false, error: "Unknown message type" });
  }

  return true; // Keep message channel open for async response
});

/**
 * Handle content actions from background/popup
 */
function handleContentAction(payload: { action: string; data?: unknown }): unknown {
  console.log("[Content Script] Handling action:", payload.action);

  switch (payload.action) {
    case "highlight":
      highlightPage();
      return { highlighted: true };

    case "getData":
      return getPageData();

    case "inject":
      injectElement();
      return { injected: true };

    default:
      console.warn("[Content Script] Unknown action:", payload.action);
      return null;
  }
}

/**
 * Handle extension state changes
 */
function handleExtensionStateChange(enabled: boolean): void {
  console.log("[Content Script] Extension state changed:", enabled);

  if (enabled) {
    // Extension enabled - activate features
    document.body.classList.add("extension-active");
  } else {
    // Extension disabled - deactivate features
    document.body.classList.remove("extension-active");
    removeInjectedElements();
  }
}

/**
 * Example: Highlight page elements
 */
function highlightPage(): void {
  const style = document.createElement("style");
  style.id = "extension-highlight-style";
  style.textContent = `
    * {
      outline: 1px solid rgba(59, 130, 246, 0.3) !important;
    }
  `;
  document.head.appendChild(style);

  // Remove after 3 seconds
  setTimeout(() => {
    style.remove();
  }, 3000);
}

/**
 * Example: Get page data
 */
function getPageData(): object {
  return {
    url: window.location.href,
    title: document.title,
    description:
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") ?? "",
    headings: Array.from(document.querySelectorAll("h1, h2, h3")).map(
      (h) => h.textContent?.trim() ?? ""
    ),
    links: document.querySelectorAll("a").length,
    images: document.querySelectorAll("img").length,
  };
}

/**
 * Example: Inject a floating element
 */
function injectElement(): void {
  // Remove existing if present
  removeInjectedElements();

  const container = document.createElement("div");
  container.id = "extension-injected-element";
  container.innerHTML = `
    <div class="extension-floating-widget">
      <button class="extension-close-btn">&times;</button>
      <div class="extension-widget-content">
        <h3>Chrome Extension</h3>
        <p>This is an injected widget!</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Add close functionality
  container.querySelector(".extension-close-btn")?.addEventListener("click", () => {
    container.remove();
  });
}

/**
 * Remove injected elements
 */
function removeInjectedElements(): void {
  document.getElementById("extension-injected-element")?.remove();
  document.getElementById("extension-highlight-style")?.remove();
}

// Initialize content script
async function init(): Promise<void> {
  // Check if extension is enabled
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_SETTINGS",
      payload: undefined,
    });

    if (response?.success && response.data?.enabled) {
      document.body.classList.add("extension-active");
    }
  } catch (error) {
    console.error("[Content Script] Failed to get settings:", error);
  }
}

// Run initialization
init();

// Export for type checking
export {};
