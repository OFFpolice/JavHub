export interface VideoPost {
  id: number;
  title: string;
  slug: string;
  date: string;
  thumbnail: string;
  duration: string;
  categories: string[];
  tags: string[];
  actors: string[];
  studio: string;
  code: string;
  views: number;
  likes: number;
  dislikes: number;
  is_hd: boolean;
  player_api: string;
  embed_url: string;
  iframe_html: string;
}

export interface Taxonomies {
  categories: string[];
  tags: string[];
  actors: string[];
  studios: string[];
}

export type SortOrderBy = 'date' | 'views' | 'likes';
export type SortOrder = 'desc' | 'asc';

export interface FilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  actor?: string;
  studio?: string;
  tag?: string;
  orderby?: SortOrderBy;
  order?: SortOrder;
}

export interface PostsApiResponse {
  posts: VideoPost[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  endpointUrl: string;
  responseTimeMs: number;
}
