import { FilterParams, PostsApiResponse, Taxonomies, VideoPost } from '../types/api';
import { extractReleaseCode, formatViews, formatDate } from '../utils';

export { extractReleaseCode, formatViews, formatDate };

const API_BASE = 'https://server.apijav.com/wp-json';

// In-memory cache for taxonomy
let cachedTaxonomies: Taxonomies | null = null;

/**
 * Normalizes video item fields (fills missing code, checks URLs)
 */
function normalizePost(post: VideoPost): VideoPost {
  return {
    ...post,
    code: extractReleaseCode(post),
    thumbnail: post.thumbnail || '',
    embed_url: post.embed_url || `https://server.apijav.com/?mvapm_embed=${post.id}`,
    iframe_html:
      post.iframe_html ||
      `<iframe src="https://server.apijav.com/?mvapm_embed=${post.id}" width="100%" height="500" frameborder="0" allowfullscreen allow="autoplay; fullscreen; encrypted-media" scrolling="no"></iframe>`,
  };
}

/**
 * Fetch video posts with filtering, search, and pagination
 */
export async function fetchPosts(params: FilterParams = {}): Promise<PostsApiResponse> {
  const query = new URLSearchParams();

  query.set('page', String(params.page || 1));
  query.set('per_page', String(params.per_page || 20));

  if (params.search && params.search.trim().length > 0) {
    query.set('search', params.search.trim());
  }
  if (params.category && params.category !== 'all') {
    query.set('category', params.category);
  }
  if (params.actor) {
    query.set('actor', params.actor);
  }
  if (params.studio) {
    query.set('studio', params.studio);
  }
  if (params.tag) {
    query.set('tag', params.tag);
  }
  if (params.orderby) {
    query.set('orderby', params.orderby);
  }
  if (params.order) {
    query.set('order', params.order);
  }

  const endpointUrl = `${API_BASE}/myvideo/v1/posts?${query.toString()}`;
  const startTime = performance.now();

  try {
    const res = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const totalHeader = res.headers.get('x-wp-total');
    const totalPagesHeader = res.headers.get('x-wp-totalpages');

    const rawData = await res.json();
    const posts: VideoPost[] = Array.isArray(rawData) ? rawData.map(normalizePost) : [];

    const total = totalHeader ? parseInt(totalHeader, 10) : posts.length;
    const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;
    const currentPage = params.page || 1;

    return {
      posts,
      total,
      totalPages,
      currentPage,
      hasMore: currentPage < totalPages,
      endpointUrl,
      responseTimeMs,
    };
  } catch (error) {
    console.error('Failed to fetch posts from APIJAV:', error);
    throw error;
  }
}

/**
 * Fetch a single post by ID (for direct deep links or browser navigation)
 */
export async function fetchPostById(id: number): Promise<VideoPost> {
  try {
    const res = await fetch(`${API_BASE}/myvideo/v1/posts/${id}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) {
        return normalizePost(data);
      }
    }
  } catch (e) {
    console.warn('Failed to fetch post by ID:', e);
  }

  // Fallback if individual endpoint is not enabled on the REST API
  return normalizePost({
    id,
    title: `Видео #${id}`,
    slug: `video-${id}`,
    code: '',
    date: '',
    thumbnail: '',
    duration: '',
    categories: [],
    tags: [],
    actors: [],
    studio: '',
    views: 0,
    likes: 0,
    dislikes: 0,
    is_hd: false,
    player_api: `https://server.apijav.com/?mvapm_embed=${id}`,
    embed_url: `https://server.apijav.com/?mvapm_embed=${id}`,
    iframe_html: `<iframe src="https://server.apijav.com/?mvapm_embed=${id}" width="100%" height="500" frameborder="0" allowfullscreen allow="autoplay; fullscreen; encrypted-media" scrolling="no"></iframe>`,
  });
}

/**
 * Fetch full taxonomies (categories, tags, actors, studios)
 */
export async function fetchTaxonomies(): Promise<Taxonomies> {
  if (cachedTaxonomies) {
    return cachedTaxonomies;
  }

  try {
    const res = await fetch(`${API_BASE}/myvideo/v1/taxonomies`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch taxonomies: ${res.status}`);
    }

    const data: Taxonomies = await res.json();
    cachedTaxonomies = data;
    return data;
  } catch (err) {
    console.warn('Could not fetch full taxonomies, using fallback popular list', err);
    return {
      categories: [
        'Amateur', 'Big Breasts', 'Cosplay', 'Creampie', 'Exclusive',
        'Famous', 'Hd', 'Individual', 'Japanese', 'Mature Woman',
        'Oral Sex', 'Orgy', 'Slender', 'Subtitled', 'VR'
      ],
      tags: ['1080p', 'Hd', 'viral', 'uncensored', '4k'],
      actors: [
        'Yua Mikami', 'Eimi Fukada', 'Karen Kaede', 'Tsukasa Aoi',
        'Saika Kawakita', 'Miru', 'Minami Aizawa', 'Rara Anzai',
        'Sarina Momonaga', 'Remu Suzumori', 'Kana Momonogi'
      ],
      studios: [
        'S1', 'FALENO', 'MOODYZ', 'SOD', 'Attackers',
        'IdeaPocket', 'PRESTIGE', 'Premium', 'ロイヤル'
      ]
    };
  }
}
