import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import App from "./App";
import { api } from "./services/api";

// Mock the chrome API
const chromeMock = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

// Add chrome to global scope
Object.defineProperty(window, "chrome", {
  value: chromeMock,
  writable: true,
});

// Mock the useTabMonitor hook
vi.mock("./hooks/useTabMonitor", () => ({
  useTabMonitor: () => ({
    currentTabId: 1,
    currentUrl: "https://example.com",
  }),
}));

// Mock the api service
vi.mock("./services/api", () => ({
  api: {
    getPageVisits: vi.fn().mockResolvedValue({
      page_visits: [
        {
          id: 1,
          url: "https://example.com",
          image_count: 5,
          link_count: 10,
          word_count: 100,
          character_count: 500,
          datetime_visited: "2024-03-20T12:00:00Z",
        },
      ],
      total: 1,
      offset: 0,
      limit: 10,
    }),
  },
}));

// Mock the formatDate function
vi.mock("./libs", () => ({
  formatDate: (date: string) => date,
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title", async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText("History Sidepanel")).toBeInTheDocument();
  });

  it("displays page visit information when data is available", async () => {
    await act(async () => {
      render(<App />);
    });

    // Wait for the data to load
    expect(await screen.findByText("Page Info")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // image count
    expect(screen.getByText("10")).toBeInTheDocument(); // link count
    expect(screen.getByText("100")).toBeInTheDocument(); // word count
    expect(screen.getByText("500")).toBeInTheDocument(); // character count
  });

  it("shows no page visit message when API call fails", async () => {
    vi.mocked(api.getPageVisits).mockRejectedValueOnce(
      new Error("Failed to fetch page visits")
    );

    await act(async () => {
      render(<App />);
    });

    expect(
      await screen.findByText("No PageVisit Available for this page")
    ).toBeInTheDocument();
  });
});
