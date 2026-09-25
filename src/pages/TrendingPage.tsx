import React from 'react';
import { VideoPost } from '../types/api';
import { VideoCard } from '../components/VideoCard';
import { Pagination } from '../components/Pagination';
import { Loader2, AlertCircle, RefreshCw, Flame } from 'lucide-react';

interface TrendingPageProps {
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

export const TrendingPage: React.FC<TrendingPageProps> = ({
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
          <p className="text-xs text-slate-400">Загрузка популярных видео...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl">
          <Flame className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300 mb-1">Видео не найдены</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Не удалось загрузить тренды. Попробуйте обновить страницу.
          </p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Обновить
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
};
