/**
 * Type-safe messaging utilities for Chrome extension communication
 * Supports communication between: background <-> content <-> popup
 */

// Define all message types and their payloads
export interface MessageTypes {
  GET_TAB_INFO: {
    request: void;
    response: { url: string; title: string };
  };
  TOGGLE_EXTENSION: {
    request: { enabled: boolean };
    response: { success: boolean };
  };
  GET_SETTINGS: {
    request: void;
    response: {
      enabled: boolean;
      theme: "light" | "dark" | "system";
      notifications: boolean;
    };
  };
  UPDATE_SETTINGS: {
    request: Partial<{
      enabled: boolean;
      theme: "light" | "dark" | "system";
      notifications: boolean;
    }>;
    response: { success: boolean };
  };
  CONTENT_ACTION: {
    request: { action: string; data?: unknown };
    response: { success: boolean; result?: unknown };
  };
}

export type MessageType = keyof MessageTypes;

export interface Message<T extends MessageType = MessageType> {
  type: T;
  payload: MessageTypes[T]["request"];
}

export interface MessageResponse<T extends MessageType = MessageType> {
  success: boolean;
  data?: MessageTypes[T]["response"];
  error?: string;
}

/**
 * Send a message to the background script
 */
export async function sendToBackground<T extends MessageType>(
  type: T,
  payload: MessageTypes[T]["request"]
): Promise<MessageResponse<T>> {
  try {
    const response = await chrome.runtime.sendMessage<
      Message<T>,
      MessageResponse<T>
    >({
      type,
      payload,
    });
    return response;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a message to a specific tab's content script
 */
export async function sendToTab<T extends MessageType>(
  tabId: number,
  type: T,
  payload: MessageTypes[T]["request"]
): Promise<MessageResponse<T>> {
  try {
    const response = await chrome.tabs.sendMessage<
      Message<T>,
      MessageResponse<T>
    >(tabId, {
      type,
      payload,
    });
    return response;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a message to the active tab's content script
 */
export async function sendToActiveTab<T extends MessageType>(
  type: T,
  payload: MessageTypes[T]["request"]
): Promise<MessageResponse<T>> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return { success: false, error: "No active tab found" };
  }
  return sendToTab(tab.id, type, payload);
}

/**
 * Create a message handler for the background script
 */
export function createMessageHandler(
  handlers: Partial<{
    [K in MessageType]: (
      payload: MessageTypes[K]["request"],
      sender: chrome.runtime.MessageSender
    ) => Promise<MessageTypes[K]["response"]> | MessageTypes[K]["response"];
  }>
): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, payload } = message as Message;
    const handler = handlers[type] as
      | ((
          payload: unknown,
          sender: chrome.runtime.MessageSender
        ) => Promise<unknown> | unknown)
      | undefined;

    if (handler) {
      Promise.resolve(handler(payload, sender))
        .then((data) => {
          sendResponse({ success: true, data });
        })
        .catch((error) => {
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        });
      return true; // Keep the message channel open for async response
    }

    return false;
  });
}
