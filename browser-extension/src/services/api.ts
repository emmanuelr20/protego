import { API_URL } from "../const";
import { PageVisitResponse } from "../types";

interface PageVisitRequest {
  linkCount: number;
  imageCount: number;
  characterCount: number;
  datetimeVisited: string;
  url: string;
  wordCount: number;
}

export const api = {
  async getPageVisits(
    url: string,
    offset: number,
    limit: number
  ): Promise<PageVisitResponse> {
    const response = await fetch(
      `${API_URL}/page-visits?url=${encodeURI(
        url
      )}&offset=${offset}&limit=${limit}`
    );

    if (response.status !== 200) {
      throw new Error("Failed to fetch page visits");
    }

    return response.json();
  },

  async createPageVisit(data: PageVisitRequest): Promise<void> {
    const response = await fetch(`${API_URL}/page-visits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.status !== 200) {
      throw new Error("Failed to create page visit");
    }

    return response.json();
  },
};
