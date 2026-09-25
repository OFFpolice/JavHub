import React, { useState, useMemo } from 'react';
import { VideoPost } from '../types/api';
import { VideoCard } from '../components/VideoCard';
import { Pagination } from '../components/Pagination';
import {
  Tags,
  Search,
  X,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Film,
} from 'lucide-react';

export interface CategoriesPageProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  onClearCategory: () => void;
  allCategories: string[];
  taxonomiesLoading: boolean;
  posts: VideoPost[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSelectVideo: (video: VideoPost) => void;
  onSelectActor: (actor: string) => void;
  onSelectStudio: (studio: string) => void;
  onRetry: () => void;
}

export type CategoriePageProps = CategoriesPageProps;

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  selectedCategory,
  onSelectCategory,
  onClearCategory,
  allCategories,
  taxonomiesLoading,
  posts,
  isLoading,
  error,
  totalPages,
  currentPage,
  onPageChange,
  onSelectVideo,
  onSelectActor,
  onSelectStudio,
  onRetry,
}) => {
  const [search, setSearch] = useState('');

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    return allCategories.filter((item) => {
      const trimmed = item.trim();
      if (!trimmed) return false;
      return !search.trim() || trimmed.toLowerCase().includes(search.toLowerCase().trim());
    });
  }, [allCategories, search]);

  // Mode 1: A specific category is selected -> show videos in this genre
  if (selectedCategory && selectedCategory !== 'all') {
    return (
      <div className="w-full space-y-6">
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
            <p className="text-xs text-slate-400">Загрузка видео категории {selectedCategory}...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl">
            <Film className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300 mb-1">Видео не найдены</h3>
            <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
              Пока нет опубликованных видео для этого жанра в текущем запросе.
            </p>
            <button
              onClick={onClearCategory}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Вернуться в каталог жанров
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
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>
    );
  }

  // Mode 2: Browse all categories
  return (
    <div className="w-full space-y-6">
      {/* Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tags className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Жанры и категории
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Тематические направления каталога. Выберите интересующий жанр для просмотра подборки.
          </p>
        </div>

        <div className="text-xs text-slate-400 tabular-nums self-end sm:self-center">
          Всего жанров: <strong className="text-slate-200">{allCategories.length.toLocaleString()}</strong>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск категории или жанра..."
          className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid of categories */}
      {taxonomiesLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs text-slate-400">Загрузка списка жанров из API...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm">
            Ничего не найдено по запросу «{search}»
          </p>
          <button
            onClick={() => setSearch('')}
            className="mt-3 text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Сбросить поиск
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {filteredCategories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className="flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 group-hover:scale-125 transition-all shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white truncate">
                  {category}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoriePage = CategoriesPage;
