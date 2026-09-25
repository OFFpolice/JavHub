import React, { useState, useEffect } from 'react';
import { FilterParams, VideoPost, Taxonomies } from '../types/api';
import { VideoCard } from '../components/VideoCard';
import { Pagination } from '../components/Pagination';
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  Film,
  Building,
  Users,
  Tags,
  ArrowUpDown,
} from 'lucide-react';

interface FiltersPageProps {
  filters: FilterParams;
  onFilterChange: (newFilters: Partial<FilterParams>) => void;
  onResetFilters: () => void;
  posts: VideoPost[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  taxonomies: Taxonomies;
  taxonomiesLoading: boolean;
  onSelectVideo: (video: VideoPost) => void;
  onSelectActor: (actor: string) => void;
  onSelectStudio: (studio: string) => void;
  onRetry: () => void;
}

export const FiltersPage: React.FC<FiltersPageProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  posts,
  isLoading,
  error,
  totalCount,
  totalPages,
  taxonomies,
  taxonomiesLoading,
  onSelectVideo,
  onSelectActor,
  onSelectStudio,
  onRetry,
}) => {
  // Local state for interactive filter selections before applying or instant update
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [selectedStudio, setSelectedStudio] = useState(filters.studio || '');
  const [selectedActor, setSelectedActor] = useState(filters.actor || '');
  const [selectedOrderby, setSelectedOrderby] = useState<'date' | 'views' | 'likes'>(
    filters.orderby || 'date'
  );

  useEffect(() => {
    setSelectedCategory(filters.category || '');
    setSelectedStudio(filters.studio || '');
    setSelectedActor(filters.actor || '');
    setSelectedOrderby(filters.orderby || 'date');
  }, [filters]);

  const handleApply = () => {
    onFilterChange({
      category: selectedCategory === 'all' ? '' : selectedCategory,
      studio: selectedStudio,
      actor: selectedActor,
      orderby: selectedOrderby,
      page: 1,
    });
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedStudio('');
    setSelectedActor('');
    setSelectedOrderby('date');
    onResetFilters();
  };

  return (
    <div className="w-full space-y-6">
      {/* Filter Controls Panel */}
      <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Sorting Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-rose-400" />
              Сортировка
            </label>
            <select
              value={selectedOrderby}
              onChange={(e) => setSelectedOrderby(e.target.value as 'date' | 'views' | 'likes')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none"
            >
              <option value="date">По дате добавления (Новые)</option>
              <option value="views">По количеству просмотров</option>
              <option value="likes">По оценкам и рейтингу</option>
            </select>
          </div>

          {/* 2. Category / Genre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tags className="w-3.5 h-3.5 text-rose-400" />
              Жанр / Категория
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none"
            >
              <option value="">Все категории ({taxonomies.categories.length})</option>
              {taxonomies.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Studio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-rose-400" />
              Студия
            </label>
            <select
              value={selectedStudio}
              onChange={(e) => setSelectedStudio(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none"
            >
              <option value="">Все студии ({taxonomies.studios.length})</option>
              {taxonomies.studios.map((stu) => (
                <option key={stu} value={stu}>
                  {stu}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Actress Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-400" />
              Имя актрисы
            </label>
            <input
              type="text"
              value={selectedActor}
              onChange={(e) => setSelectedActor(e.target.value)}
              placeholder="Например: Yua Mikami..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                Категория: {selectedCategory}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className="ml-1 text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {selectedStudio && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                Студия: {selectedStudio}
                <button
                  type="button"
                  onClick={() => setSelectedStudio('')}
                  className="ml-1 text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {selectedActor && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                Актриса: {selectedActor}
                <button
                  type="button"
                  onClick={() => setSelectedActor('')}
                  className="ml-1 text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Сбросить
            </button>
            <button
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-rose-950/40 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Применить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-5 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-rose-200">Ошибка связи с сервером</h3>
              <p className="text-xs text-rose-300/80">{error}</p>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Повторить
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-xs text-slate-400">Применение фильтров и поиск видео...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl">
          <Film className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300 mb-1">Ничего не найдено</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            По указанным фильтрам видео не обнаружены. Попробуйте смягчить условия поиска.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Сбросить все фильтры
          </button>
        </div>
      ) : (
        <>
          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {posts.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                onSelectActor={onSelectActor}
                onSelectStudio={onSelectStudio}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={filters.page || 1}
            totalPages={totalPages}
            onPageChange={(p) => onFilterChange({ page: p })}
          />
        </>
      )}
    </div>
  );
};
