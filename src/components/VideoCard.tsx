import React, { useState } from 'react';
import { Play, Eye, ThumbsUp, Film } from 'lucide-react';
import { VideoPost } from '../types/api';
import { formatViews, formatDate } from '../services/apijav';

interface VideoCardProps {
  video: VideoPost;
  onSelect: (video: VideoPost) => void;
  onSelectActor?: (actor: string) => void;
  onSelectStudio?: (studio: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  onSelectActor,
  onSelectStudio,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Extract primary release code or fallback to studio/short tag
  const displayCode = video.code || (video.title.match(/^([A-Za-z0-9]+-[0-9A-Za-z]+)/)?.[1] ?? '');
  const primaryActor = video.actors?.[0];

  return (
    <article
      onClick={() => onSelect(video)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden cursor-pointer transition-colors duration-150 gpu-card"
    >
      {/* Thumbnail Aspect Ratio Container (16:9 / 4:3 cinema standard) */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {!imageError && video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-500">
            <Film className="w-8 h-8 mb-2 opacity-40 text-rose-500" />
            <span className="text-xs font-mono text-slate-400 font-semibold">{displayCode || 'JAVHUB'}</span>
          </div>
        )}

        {/* Contrast Scrim overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Top badges (Code & HD) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {displayCode ? (
            <span className="px-2 py-0.5 text-[11px] font-mono font-bold tracking-wider uppercase bg-black text-rose-400 border border-rose-500/40 rounded">
              {displayCode}
            </span>
          ) : <div />}

          <div className="flex items-center gap-1.5">
            {video.is_hd && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-rose-600 text-white rounded">
                HD
              </span>
            )}
          </div>
        </div>

        {/* Center Play Button on hover */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-150 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-950 pl-0.5">
            <Play className="w-5 h-5 fill-white" />
          </div>
        </div>

        {/* Bottom bar inside thumbnail: Duration & Views */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-slate-300 font-medium tabular-nums">
          <span className="flex items-center gap-1 bg-black/90 px-1.5 py-0.5 rounded border border-slate-800">
            <Eye className="w-3 h-3 text-slate-400" />
            {formatViews(video.views)}
          </span>

          {video.likes > 0 && (
            <span className="flex items-center gap-1 bg-black/90 px-1.5 py-0.5 rounded border border-slate-800">
              <ThumbsUp className="w-3 h-3 text-rose-400" />
              {video.likes}
            </span>
          )}
        </div>
      </div>

      {/* Content description (anti-slop: clean unboxed text metadata) */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Studio & Actress quiet metadata */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            {video.studio && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStudio?.(video.studio);
                }}
                className="hover:text-rose-400 transition-colors truncate max-w-[120px] font-medium"
              >
                {video.studio}
              </button>
            )}

            {video.studio && primaryActor && <span aria-hidden="true" className="text-slate-600">·</span>}

            {primaryActor && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectActor?.(primaryActor);
                }}
                className="hover:text-rose-400 transition-colors text-slate-300 truncate max-w-[130px]"
              >
                {primaryActor}
              </button>
            )}
          </div>

          {/* Title */}
          <h3
            title={video.title}
            className="text-sm font-semibold text-slate-100 group-hover:text-rose-300 transition-colors line-clamp-2 leading-snug"
          >
            {video.title}
          </h3>
        </div>

        {/* Bottom quiet metadata line */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
          <span>{formatDate(video.date)}</span>
          {video.categories?.[0] && (
            <span className="text-slate-400 truncate max-w-[140px]">
              {video.categories[0]}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
