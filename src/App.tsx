import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar, ActiveTab, AgeWarningModal } from './components';
import { FilterParams, VideoPost, Taxonomies } from './types';
import { fetchPosts, fetchPostById, fetchTaxonomies } from './services';
import {
  HomePage,
  TrendingPage,
  TopPage,
  SearchPage,
  FiltersPage,
  ActressesPage,
  StudiosPage,
  CategoriesPage,
  WatchPage,
  WatchSource,
} from './pages';

function getInitialState() {
  if (typeof window === 'undefined') {
    return {
      tab: 'catalog' as ActiveTab,
      filters: {
        page: 1,
        per_page: 20,
        orderby: 'date' as const,
        order: 'desc' as const,
        search: '',
        category: '',
        actor: '',
        studio: '',
      },
      watchId: null as number | null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  let tab = (params.get('tab') as ActiveTab) || 'catalog';
  if ((tab as string) === 'top') tab = 'top-rated';
  if ((tab as string) === 'home') tab = 'catalog';

  const page = parseInt(params.get('page') || '1', 10);
  const search = params.get('q') || params.get('search') || '';
  const category = params.get('category') || '';
  const actor = params.get('actor') || '';
  const studio = params.get('studio') || '';
  const orderby =
    (params.get('orderby') as 'date' | 'views' | 'likes') ||
    (tab === 'trending' ? 'views' : tab === 'top-rated' ? 'likes' : 'date');

  const rawWatch = params.get('watch');
  const watchId = rawWatch ? parseInt(rawWatch, 10) : null;

  return {
    tab,
    filters: {
      page: isNaN(page) ? 1 : page,
      per_page: 20,
      orderby,
      order: 'desc' as const,
      search,
      category,
      actor,
      studio,
    },
    watchId: isNaN(watchId || NaN) ? null : watchId,
  };
}

function buildAppUrl(tab: ActiveTab, currentFilters: FilterParams, watchId?: number | null): string {
  const params = new URLSearchParams();

  if (tab !== 'catalog') {
    params.set('tab', tab === 'top-rated' ? 'top' : tab);
  }
  if (currentFilters.search) params.set('q', currentFilters.search);
  if (currentFilters.category && currentFilters.category !== 'all') params.set('category', currentFilters.category);
  if (currentFilters.actor) params.set('actor', currentFilters.actor);
  if (currentFilters.studio) params.set('studio', currentFilters.studio);
  if (currentFilters.page && currentFilters.page > 1) params.set('page', String(currentFilters.page));
  if (currentFilters.orderby && currentFilters.orderby !== 'date' && tab === 'catalog') {
    params.set('orderby', currentFilters.orderby);
  }

  if (watchId) {
    params.set('watch', String(watchId));
  }

  const query = params.toString();
  return query ? `?${query}` : window.location.pathname;
}

function pushAppUrl(tab: ActiveTab, currentFilters: FilterParams, watchId?: number | null, replace = false) {
  const url = buildAppUrl(tab, currentFilters, watchId);
  try {
    if (replace) {
      window.history.replaceState({ tab, filters: currentFilters, watchId }, '', url);
    } else {
      window.history.pushState({ tab, filters: currentFilters, watchId }, '', url);
    }
  } catch {}
}

export default function App() {
  const initialState = useMemo(() => getInitialState(), []);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialState.tab);

  // Query filters state
  const [filters, setFilters] = useState<FilterParams>(initialState.filters);

  // Data state
  const [posts, setPosts] = useState<VideoPost[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected video for WatchPage
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoPost[]>([]);

  // Taxonomies
  const [taxonomies, setTaxonomies] = useState<Taxonomies>({
    categories: [],
    tags: [],
    actors: [],
    studios: [],
  });
  const [taxonomiesLoading, setTaxonomiesLoading] = useState<boolean>(false);

  // Load taxonomies once
  useEffect(() => {
    let mounted = true;
    setTaxonomiesLoading(true);
    fetchTaxonomies()
      .then((data) => {
        if (mounted) {
          setTaxonomies(data);
          setTaxonomiesLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load taxonomies:', err);
        if (mounted) setTaxonomiesLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Initial load if ?watch=ID is present in URL
  useEffect(() => {
    if (initialState.watchId) {
      fetchPostById(initialState.watchId).then((v) => {
        setSelectedVideo(v);
      });
    }
  }, [initialState.watchId]);

  // Fetch posts when filters or tab change
  const loadPosts = useCallback(async () => {
    // Only fetch posts when in views that display video grids
    const needsFetch =
      activeTab === 'catalog' ||
      activeTab === 'trending' ||
      activeTab === 'top-rated' ||
      activeTab === 'search' ||
      activeTab === 'filters' ||
      (activeTab === 'actresses' && Boolean(filters.actor)) ||
      (activeTab === 'studios' && Boolean(filters.studio)) ||
      (activeTab === 'categories' && Boolean(filters.category && filters.category !== 'all'));

    if (!needsFetch) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchPosts(filters);
      setPosts(response.posts);
      setTotalCount(response.total);
      setTotalPages(response.totalPages);

      // If there is a watch param and video isn't loaded yet, try to find it in response
      const params = new URLSearchParams(window.location.search);
      const watchParam = params.get('watch');
      if (watchParam) {
        const vidId = parseInt(watchParam, 10);
        if (!selectedVideo || selectedVideo.id !== vidId) {
          const found = response.posts.find((p) => p.id === vidId);
          if (found) {
            setSelectedVideo(found);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Не удалось подключиться к API server.apijav.com. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, activeTab, selectedVideo]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Handle browser Back and Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = async () => {
      const params = new URLSearchParams(window.location.search);
      let tabParam = (params.get('tab') as ActiveTab) || 'catalog';
      if ((tabParam as string) === 'top') tabParam = 'top-rated';
      if ((tabParam as string) === 'home') tabParam = 'catalog';

      const watchParam = params.get('watch');
      const searchParam = params.get('q') || params.get('search') || '';
      const categoryParam = params.get('category') || '';
      const actorParam = params.get('actor') || '';
      const studioParam = params.get('studio') || '';
      const pageParam = parseInt(params.get('page') || '1', 10);
      const orderbyParam =
        (params.get('orderby') as 'date' | 'views' | 'likes') ||
        (tabParam === 'trending' ? 'views' : tabParam === 'top-rated' ? 'likes' : 'date');

      setActiveTab(tabParam);
      setFilters({
        page: isNaN(pageParam) ? 1 : pageParam,
        per_page: 20,
        orderby: orderbyParam,
        order: 'desc',
        search: searchParam,
        category: categoryParam,
        actor: actorParam,
        studio: studioParam,
      });

      if (watchParam) {
        const vidId = parseInt(watchParam, 10);
        if (!isNaN(vidId)) {
          if (selectedVideo?.id === vidId) {
            // Already current
          } else {
            const found = posts.find((p) => p.id === vidId);
            if (found) {
              setSelectedVideo(found);
            } else {
              const fetched = await fetchPostById(vidId);
              setSelectedVideo(fetched);
            }
          }
        }
      } else {
        setSelectedVideo(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [posts, selectedVideo]);

  // Handle Tab Switch
  const handleSelectTab = (tab: ActiveTab) => {
    setSelectedVideo(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let newFilters: FilterParams = {
      page: 1,
      per_page: 20,
      orderby: 'date',
      order: 'desc',
      search: '',
      category: '',
      actor: '',
      studio: '',
    };

    if (tab === 'catalog') {
      newFilters.orderby = 'date';
    } else if (tab === 'trending') {
      newFilters.orderby = 'views';
    } else if (tab === 'top-rated') {
      newFilters.orderby = 'likes';
    } else if (tab === 'filters') {
      newFilters = { ...filters, page: 1 };
    }

    setFilters(newFilters);
    pushAppUrl(tab, newFilters, null, false);
  };

  // Handle filter changes (e.g. pagination or sorting)
  const handleFilterChange = (newFilters: Partial<FilterParams>) => {
    setSelectedVideo(null);
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    pushAppUrl(activeTab, updated, null, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedVideo(null);
    const freshFilters: FilterParams = {
      page: 1,
      per_page: 20,
      orderby: 'date',
      order: 'desc',
      search: '',
      category: '',
      actor: '',
      studio: '',
    };
    setFilters(freshFilters);
    setActiveTab('catalog');
    pushAppUrl('catalog', freshFilters, null, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Actress selection & clearing
  const handleSelectActor = (actor: string) => {
    setSelectedVideo(null);
    const newFilters: FilterParams = {
      page: 1,
      per_page: 20,
      actor,
      search: '',
      category: '',
      studio: '',
      orderby: 'date',
      order: 'desc',
    };
    setFilters(newFilters);
    setActiveTab('actresses');
    pushAppUrl('actresses', newFilters, null, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearActor = () => {
    setSelectedVideo(null);
    const newFilters: FilterParams = {
      ...filters,
      actor: '',
      page: 1,
    };
    setFilters(newFilters);
    pushAppUrl('actresses', newFilters, null, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Studio selection & clearing
  const handleSelectStudio = (studio: string) => {
    setSelectedVideo(null);
    const newFilters: FilterParams = {
      page: 1,
      per_page: 20,
      studio,
      search: '',
      category: '',
      actor: '',
      orderby: 'date',
      order: 'desc',
    };
    setFilters(newFilters);
    setActiveTab('studios');
    pushAppUrl('studios', newFilters, null, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearStudio = () => {
    setSelectedVideo(null);
    const newFilters: FilterParams = {
      ...filters,
      studio: '',
      page: 1,
    };
    setFilters(newFilters);
    pushAppUrl('studios', newFilters, null, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category selection & clearing
  const handleSelectCategory = (category: string) => {
    setSelectedVideo(null);
    const newFilters: FilterParams = {
      page: 1,
      per_page: 20,
      category,
      search: '',
      studio: '',
      actor: '',
      orderby: 'date',
      order: 'desc',
    };
    setFilters(newFilters);
    setActiveTab('categories');
    pushAppUrl('categories', newFilters, null, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearCategory = () => {
    setSelectedVideo(null);
    const newFilters: FilterParams = {
      ...filters,
      category: '',
      page: 1,
    };
    setFilters(newFilters);
    pushAppUrl('categories', newFilters, null, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search handler
  const handleSearch = (query: string) => {
    setSelectedVideo(null);
    const newFilters: FilterParams = {
      page: 1,
      per_page: 20,
      search: query,
      category: '',
      studio: '',
      actor: '',
      orderby: 'date',
      order: 'desc',
    };
    setFilters(newFilters);
    const nextTab: ActiveTab = query ? 'search' : 'catalog';
    setActiveTab(nextTab);
    pushAppUrl(nextTab, newFilters, null, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Video in WatchPage
  const handleOpenVideo = (video: VideoPost) => {
    setSelectedVideo(video);
    pushAppUrl(activeTab, filters, video.id, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Recommendation logic
    const matching = posts.filter(
      (p) =>
        p.id !== video.id &&
        (p.studio === video.studio ||
          p.actors?.some((a) => video.actors?.includes(a)) ||
          p.categories?.some((c) => video.categories?.includes(c)))
    );
    const nonMatching = posts.filter(
      (p) => p.id !== video.id && !matching.some((m) => m.id === p.id)
    );
    setRelatedVideos([...matching, ...nonMatching].slice(0, 16));
  };

  // Back from WatchPage: native browser back if possible or clean state
  const handleBackFromWatch = () => {
    if (window.history.state?.watchId || window.location.search.includes('watch=')) {
      window.history.back();
    } else {
      setSelectedVideo(null);
      pushAppUrl(activeTab, filters, null, false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic context for WatchPage breadcrumbs
  const watchSource: WatchSource = useMemo(() => {
    if (activeTab === 'search' || filters.search) {
      return { type: 'search', query: filters.search || '' };
    }
    if (activeTab === 'filters') {
      return { type: 'filters' };
    }
    if (filters.actor || activeTab === 'actresses') {
      return { type: 'actress', name: filters.actor || '' };
    }
    if (filters.studio || activeTab === 'studios') {
      return { type: 'studio', name: filters.studio || '' };
    }
    if ((filters.category && filters.category !== 'all') || activeTab === 'categories') {
      return { type: 'category', name: filters.category || '' };
    }
    if (activeTab === 'trending') {
      return { type: 'trending' };
    }
    if (activeTab === 'top-rated') {
      return { type: 'top-rated' };
    }
    return { type: 'home' };
  }, [activeTab, filters]);

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col selection:bg-rose-600 selection:text-white">
      {/* 18+ Age Disclaimer Modal */}
      <AgeWarningModal />

      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onResetFilters={handleResetFilters}
        onToggleFilters={() => handleSelectTab('filters')}
        isFiltersOpen={activeTab === 'filters'}
        searchQuery={filters.search || ''}
        onSearch={handleSearch}
      />

      {/* Main View Area */}
      {selectedVideo ? (
        <main className="flex-1 w-full">
          <WatchPage
            video={selectedVideo}
            onBack={handleBackFromWatch}
            source={watchSource}
            onNavigateTab={(tab) => {
              setSelectedVideo(null);
              handleSelectTab((tab === 'home' ? 'catalog' : tab) as ActiveTab);
            }}
            onSelectActor={handleSelectActor}
            onSelectStudio={handleSelectStudio}
            onSelectCategory={handleSelectCategory}
            relatedVideos={relatedVideos}
            onSelectRelated={handleOpenVideo}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 1. ГЛАВНАЯ (HomePage.tsx) */}
          {activeTab === 'catalog' && (
            <HomePage
              posts={posts}
              isLoading={isLoading}
              error={error}
              totalCount={totalCount}
              totalPages={totalPages}
              currentPage={filters.page || 1}
              onPageChange={(page) => handleFilterChange({ page })}
              onSelectVideo={handleOpenVideo}
              onSelectActor={handleSelectActor}
              onSelectStudio={handleSelectStudio}
              onRetry={loadPosts}
              onOpenFilters={() => handleSelectTab('filters')}
            />
          )}

          {/* 2. ПОПУЛЯРНЫЕ (TrendingPage.tsx) */}
          {activeTab === 'trending' && (
            <TrendingPage
              posts={posts}
              isLoading={isLoading}
              error={error}
              totalCount={totalCount}
              totalPages={totalPages}
              currentPage={filters.page || 1}
              onPageChange={(page) => handleFilterChange({ page })}
              onSelectVideo={handleOpenVideo}
              onSelectActor={handleSelectActor}
              onSelectStudio={handleSelectStudio}
              onRetry={loadPosts}
            />
          )}

          {/* 3. ТОП РЕЙТИНГ (TopPage.tsx) */}
          {activeTab === 'top-rated' && (
            <TopPage
              posts={posts}
              isLoading={isLoading}
              error={error}
              totalCount={totalCount}
              totalPages={totalPages}
              currentPage={filters.page || 1}
              onPageChange={(page) => handleFilterChange({ page })}
              onSelectVideo={handleOpenVideo}
              onSelectActor={handleSelectActor}
              onSelectStudio={handleSelectStudio}
              onRetry={loadPosts}
            />
          )}

          {/* 4. ПОИСК (SearchPage.tsx) */}
          {activeTab === 'search' && (
            <SearchPage
              searchQuery={filters.search || ''}
              onSearch={handleSearch}
              posts={posts}
              isLoading={isLoading}
              error={error}
              totalCount={totalCount}
              totalPages={totalPages}
              currentPage={filters.page || 1}
              onPageChange={(page) => handleFilterChange({ page })}
              onSelectVideo={handleOpenVideo}
              onSelectActor={handleSelectActor}
              onSelectStudio={handleSelectStudio}
              onRetry={loadPosts}
            />
          )}

          {/* 5. ФИЛЬТРЫ (FiltersPage.tsx) */}
          {activeTab === 'filters' && (
            <FiltersPage
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              posts={posts}
              isLoading={isLoading}
              error={error}
              totalCount={totalCount}
              totalPages={totalPages}
              taxonomies={taxonomies}
              taxonomiesLoading={taxonomiesLoading}
              onSelectVideo={handleOpenVideo}
              onSelectActor={handleSelectActor}
              onSelectStudio={handleSelectStudio}
              onRetry={loadPosts}
            />
          )}

          {/* 6. АКТРИСЫ (ActressesPage.tsx) */}
          {activeTab === 'actresses' && (
            <ActressesPage
              selectedActor={filters.actor || null}
              onSelectActor={handleSelectActor}
              onClearActor={handleClearActor}
              allActresses={taxonomies.actors}
              taxonomiesLoading={taxonomiesLoading}
              posts={posts}
              isLoading={isLoading}
              error={error}
              totalCount={totalCount}
              totalPages={totalPages}
              currentPage={filters.page || 1}
              onPageChange={(page) => handleFilterChange({ page })}
              onSelectVideo={handleOpenVideo}
              onSelectStudio={handleSelectStudio}
              onRetry={loadPosts}
            />
          )}

          {/* 7. СТУДИИ (StudiosPage.tsx) */}
          {activeTab === 'studios' && (
            <StudiosPage
              selectedStudio={filters.studio || null}
              onSelectStudio={handleSelectStudio}
              onClearStudio={handleClearStudio}
              allStudios={taxonomies.studios}
              taxonomiesLoading={taxonomiesLoading}
              posts={posts}
              isLoading={isLoading}
              error={error}
              totalCount={totalCount}
              totalPages={totalPages}
              currentPage={filters.page || 1}
              onPageChange={(page) => handleFilterChange({ page })}
              onSelectVideo={handleOpenVideo}
              onSelectActor={handleSelectActor}
              onRetry={loadPosts}
            />
          )}

          {/* 8. ЖАНРЫ (CategoriesPage.tsx) */}
          {activeTab === 'categories' && (
            <CategoriesPage
              selectedCategory={filters.category || null}
              onSelectCategory={handleSelectCategory}
              onClearCategory={handleClearCategory}
              allCategories={taxonomies.categories}
              taxonomiesLoading={taxonomiesLoading}
              posts={posts}
              isLoading={isLoading}
              error={error}
              totalCount={totalCount}
              totalPages={totalPages}
              currentPage={filters.page || 1}
              onPageChange={(page) => handleFilterChange({ page })}
              onSelectVideo={handleOpenVideo}
              onSelectActor={handleSelectActor}
              onSelectStudio={handleSelectStudio}
              onRetry={loadPosts}
            />
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#090b10] py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <a
              href="https://javhub.life/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display font-semibold text-slate-200 hover:text-rose-400 transition-colors"
            >
              JavHub<span className="text-rose-500">.life</span>
            </a>
            <span>·</span>
            <a
              href="https://javhub.life/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 underline underline-offset-2 decoration-slate-700"
            >
              https://javhub.life/
            </a>
            <span>·</span>
            <span>
              Данные предоставлены{' '}
              <a
                href="https://apijav.com/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-rose-400 underline underline-offset-2 decoration-slate-700 transition-colors"
              >
                apijav.com
              </a>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>18+ Только для совершеннолетних</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
