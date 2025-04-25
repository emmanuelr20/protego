export interface PageVisit {
  id: number;
  url: string;
  image_count: number;
  character_count: number;
  datetime_visited: string;
  word_count: number;
  link_count: number;
}

export interface PageVisitResponse {
  page_visits: PageVisit[];
  offset: number;
  limit: number;
  total: number;
}

export interface PageVisitRequest {
  linkCount: number;
  imageCount: number;
  characterCount: number;
  datetimeVisited: string;
  url: string;
  wordCount: number;
}
