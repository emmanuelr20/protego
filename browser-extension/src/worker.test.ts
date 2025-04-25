import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./services/api";

// Mock console.debug to prevent noise in test output
console.debug = vi.fn();

// Mock Date.toISOString to return a consistent value
const mockDate = "2021-01-01T00:00:00.000Z";
vi.spyOn(Date.prototype, "toISOString").mockReturnValue(mockDate);

// Mock the result of the script execution
const mockResult = {
  linkCount: 10,
  imageCount: 5,
  characterCount: 1000,
  visibleText: "This is a test page with some content",
  datetimeVisited: mockDate,
};

// Mock the chrome API
const chromeMock = {
  tabs: {
    onUpdated: {
      addListener: vi.fn(),
    },
  },
  scripting: {
    executeScript: vi.fn(),
  },
  runtime: {
    sendMessage: vi.fn(),
  },
};

// Add chrome to global scope
Object.defineProperty(window, "chrome", {
  value: chromeMock,
  writable: true,
});

// Mock the api service
vi.mock("./services/api", () => ({
  api: {
    createPageVisit: vi.fn(),
  },
}));

describe("Worker", () => {
  let tabUpdateListener: (
    tabId: number,
    info: { url?: string }
  ) => Promise<void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Import the worker to register the listener
    await import("./worker");

    // Get the registered listener
    const [[listener]] = chromeMock.tabs.onUpdated.addListener.mock.calls;
    tabUpdateListener = listener;
  });

  it("should not process non http or https URLs", async () => {
    await tabUpdateListener(1, { url: "chrome://extensions" });
    expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled();
  });

  it("should process valid URLs and create page visit", async () => {
    // Mock successful script execution
    chromeMock.scripting.executeScript.mockResolvedValueOnce([
      { result: mockResult },
    ]);

    await tabUpdateListener(1, { url: "https://example.com" });

    // Check script execution
    expect(chromeMock.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 1 },
      func: expect.any(Function),
    });

    // Check page visit creation
    expect(api.createPageVisit).toHaveBeenCalledWith({
      linkCount: 10,
      imageCount: 5,
      characterCount: 1000,
      datetimeVisited: mockDate,
      url: "https://example.com",
      wordCount: 8,
    });

    // Check send message to get page visits from the extension
    expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith({
      type: "GET_PAGE_VISITS",
    });
  });

  it("should handle script execution errors gracefully", async () => {
    const error = new Error("Script execution failed");
    chromeMock.scripting.executeScript.mockRejectedValueOnce(error);

    await tabUpdateListener(1, { url: "https://example.com" });

    expect(api.createPageVisit).not.toHaveBeenCalled();
    expect(chromeMock.runtime.sendMessage).not.toHaveBeenCalled();
    expect(console.debug).toHaveBeenCalledWith({
      error,
      info: { url: "https://example.com" },
      tabId: 1,
    });
  });

  it("should handle empty script execution result gracefully", async () => {
    chromeMock.scripting.executeScript.mockResolvedValueOnce([]);

    await tabUpdateListener(1, { url: "https://example.com" });

    expect(api.createPageVisit).not.toHaveBeenCalled();
    expect(chromeMock.runtime.sendMessage).not.toHaveBeenCalled();
    expect(console.debug).toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    const error = new Error("API error");

    // Mock successful script execution but failed API call
    chromeMock.scripting.executeScript.mockResolvedValueOnce([
      { result: mockResult },
    ]);
    vi.mocked(api.createPageVisit).mockRejectedValueOnce(error);

    await tabUpdateListener(1, { url: "https://example.com" });

    expect(chromeMock.runtime.sendMessage).not.toHaveBeenCalled();
    expect(console.debug).toHaveBeenCalledWith({
      error,
      info: { url: "https://example.com" },
      tabId: 1,
    });
  });
});
