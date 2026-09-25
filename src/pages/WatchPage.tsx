import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Calendar,
  Users,
  Tag,
  Play,
  ChevronRight,
} from 'lucide-react';
import { VideoPost } from '../types/api';
import { formatViews, formatDate } from '../utils';

export type WatchSource =
  | { type: 'home' }
  | { type: 'catalog' }
  | { type: 'trending' }
  | { type: 'top' }
  | { type: 'top-rated' }
  | { type: 'search'; query: string }
  | { type: 'filters' }
  | { type: 'actress'; name: string }
  | { type: 'studio'; name: string }
  | { type: 'category'; name: string };

export type PageSource = WatchSource;

export interface WatchPageProps {
  video: VideoPost;
  onBack: () => void;
  source?: WatchSource;
  onNavigateTab?: (tab: string) => void;
  onSelectActor?: (actor: string) => void;
  onSelectStudio?: (studio: string) => void;
  onSelectCategory?: (category: string) => void;
  relatedVideos?: VideoPost[];
  onSelectRelated?: (video: VideoPost) => void;
}

export type PageProps = WatchPageProps;

export const WatchPage: React.FC<WatchPageProps> = ({
  video,
  onBack,
  source = { type: 'home' },
  onNavigateTab,
  onSelectActor,
  onSelectStudio,
  onSelectCategory,
  relatedVideos = [],
  onSelectRelated,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerStageRef = useRef<HTMLDivElement>(null);

  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Reset loading animation whenever video changes
  useEffect(() => {
    setIframeLoaded(false);
    const timer = setTimeout(() => {
      setIframeLoaded(true);
    }, 2400);
    return () => clearTimeout(timer);
  }, [video?.id]);

  // Keyboard shortcut listener (Esc for back)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const currentEmbedUrl = video.embed_url || `https://server.apijav.com/?mvapm_embed=${video.id}`;

  return (
    <div ref={containerRef} className="w-full flex flex-col pb-16 selection:bg-rose-600 selection:text-white">
      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col pt-3 sm:pt-5">
        
        {/* Dynamic Context Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-3.5">
          {/* Root Home Button */}
          <button
            onClick={() => {
              if (source.type === 'home' || source.type === 'catalog') {
                onBack();
              } else {
                onNavigateTab?.('home');
              }
            }}
            className="hover:text-rose-400 transition-colors cursor-pointer"
          >
            Главная
          </button>

          {/* Trending Tab */}
          {source.type === 'trending' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <button
                onClick={onBack}
                className="hover:text-rose-400 transition-colors text-slate-300 font-medium cursor-pointer"
              >
                Популярные
              </button>
            </>
          )}

          {/* Top-Rated Tab */}
          {(source.type === 'top' || source.type === 'top-rated') && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <button
                onClick={onBack}
                className="hover:text-rose-400 transition-colors text-slate-300 font-medium cursor-pointer"
              >
                Топ Рейтинг
              </button>
            </>
          )}

          {/* Search Results */}
          {source.type === 'search' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <button
                onClick={onBack}
                className="hover:text-rose-400 transition-colors text-slate-300 font-medium cursor-pointer truncate max-w-[200px]"
                title={`Поиск: ${source.query}`}
              >
                Поиск: «{source.query}»
              </button>
            </>
          )}

          {/* Filters Tab */}
          {source.type === 'filters' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <button
                onClick={onBack}
                className="hover:text-rose-400 transition-colors text-slate-300 font-medium cursor-pointer"
              >
                Фильтры
              </button>
            </>
          )}

          {/* Actress Catalog */}
          {source.type === 'actress' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <button
                onClick={() => onNavigateTab?.('actresses')}
                className="hover:text-rose-400 transition-colors cursor-pointer"
              >
                Актрисы
              </button>
              {source.name && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <button
                    onClick={onBack}
                    className="hover:text-purple-400 transition-colors text-purple-400 font-medium cursor-pointer"
                  >
                    {source.name}
                  </button>
                </>
              )}
            </>
          )}

          {/* Studio Catalog */}
          {source.type === 'studio' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <button
                onClick={() => onNavigateTab?.('studios')}
                className="hover:text-rose-400 transition-colors cursor-pointer"
              >
                Студии
              </button>
              {source.name && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <button
                    onClick={onBack}
                    className="hover:text-rose-400 transition-colors text-rose-400 font-medium cursor-pointer"
                  >
                    {source.name}
                  </button>
                </>
              )}
            </>
          )}

          {/* Category / Genre Catalog */}
          {source.type === 'category' && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <button
                onClick={() => onNavigateTab?.('categories')}
                className="hover:text-rose-400 transition-colors cursor-pointer"
              >
                Жанры
              </button>
              {source.name && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <button
                    onClick={onBack}
                    className="hover:text-emerald-400 transition-colors text-emerald-400 font-medium cursor-pointer"
                  >
                    {source.name}
                  </button>
                </>
              )}
            </>
          )}

          {/* Studio sub-link if available and not redundant */}
          {video.studio && (source.type !== 'studio' || source.name !== video.studio) && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <button
                onClick={() => onSelectStudio?.(video.studio)}
                className="hover:text-rose-400 transition-colors text-slate-400 hover:text-slate-200 truncate max-w-[180px] cursor-pointer"
                title={`Студия ${video.studio}`}
              >
                {video.studio}
              </button>
            </>
          )}
        </div>

        {/* VIDEO PLAYER STAGE */}
        <div
          ref={playerStageRef}
          className="relative w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-rose-950/20 border border-slate-800/80 mb-6"
        >
          {/* Ambient backlight glow */}
          {video.thumbnail && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl pointer-events-none scale-105"
              style={{ backgroundImage: `url(${video.thumbnail})` }}
            />
          )}

          {/* Poster Skeleton while loading */}
          {!iframeLoaded && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90">
              {video.thumbnail && (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-25 blur-sm"
                />
              )}
              <div className="relative z-20 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-600/50 animate-pulse">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <span className="text-sm font-medium text-slate-200 tracking-wide">
                  Подключение видеопотока...
                </span>
              </div>
            </div>
          )}

          {/* Player Iframe */}
          <iframe
            key={`watch-player-${video.id}`}
            src={currentEmbedUrl}
            title={video.title}
            className="relative z-10 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            onLoad={() => setIframeLoaded(true)}
          />
        </div>

        {/* TITLE */}
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug mb-4">
          {video.title}
        </h1>

        {/* METADATA BAR (VIEWS & DATE) */}
        <div className="flex items-center gap-4 py-3 px-4 bg-slate-900/60 border border-slate-800/80 rounded-xl mb-6 text-xs sm:text-sm text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Eye className="w-4 h-4 text-slate-500" />
            {formatViews(video.views)} просмотров
          </span>
          {video.date && (
            <>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                {formatDate(video.date)}
              </span>
            </>
          )}
        </div>

        {/* STUDIO & CAST INFORMATION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Studio Card */}
          {video.studio && (
            <div className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Студия производства
                </span>
                <span className="text-sm font-semibold text-white">
                  {video.studio}
                </span>
              </div>
              {onSelectStudio && (
                <button
                  onClick={() => onSelectStudio(video.studio)}
                  className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/40 cursor-pointer"
                >
                  Все видео →
                </button>
              )}
            </div>
          )}

          {/* Primary Actress Card */}
          {video.actors && video.actors.length > 0 && (
            <div className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Актриса ({video.actors.length})
                </span>
                <span className="text-sm font-semibold text-white truncate block">
                  {video.actors.join(', ')}
                </span>
              </div>
              {onSelectActor && (
                <button
                  onClick={() => onSelectActor(video.actors[0])}
                  className="px-2.5 py-1 text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-lg transition-colors border border-purple-900/40 shrink-0 ml-2 cursor-pointer"
                >
                  Профиль →
                </button>
              )}
            </div>
          )}
        </div>

        {/* CAST LIST (IF MULTIPLE ACTRESSES) */}
        {video.actors && video.actors.length > 1 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-400" />
              В главных ролях:
            </h3>
            <div className="flex flex-wrap gap-2">
              {video.actors.map((actor, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectActor?.(actor)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>{actor}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES / GENRES */}
        {video.categories && video.categories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-rose-400" />
              Жанры и категории:
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {video.categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectCategory?.(cat)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 rounded-md transition-colors cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RELATED VIDEOS RECOMMENDATION SECTION */}
        {relatedVideos && relatedVideos.length > 0 && (
          <div className="pt-6 border-t border-slate-800">
            <h2 className="text-sm sm:text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Рекомендуемые похожие видео
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedVideos.slice(0, 8).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelated?.(rel)}
                  className="group relative bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
                    {rel.thumbnail && (
                      <img
                        src={rel.thumbnail}
                        alt={rel.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-slate-200 line-clamp-2 group-hover:text-rose-400 transition-colors">
                      {rel.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                      <span>{formatViews(rel.views)} просмотров</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Page = WatchPage;
