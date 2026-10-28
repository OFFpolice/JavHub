import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Film,
  Image as ImageIcon,
  HardDriveDownload,
  Sparkles,
} from 'lucide-react';
import { VideoPost } from '../types/api';

interface DownloadModalProps {
  video: VideoPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  video,
  isOpen,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen || !video) return null;

  const displayCode =
    video.code ||
    video.title.match(/^([A-Za-z0-9]+-[0-9A-Za-z]+)/)?.[1] ||
    video.slug.split('-').slice(0, 2).join('-').toUpperCase();

  const embedUrl = video.embed_url || `https://server.apijav.com/?mvapm_embed=${video.id}`;
  const ytdlpCommand = `yt-dlp "${embedUrl}"`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const handleDownloadThumbnail = async () => {
    if (!video.thumbnail) return;
    try {
      const response = await fetch(video.thumbnail);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${displayCode || 'video'}-cover.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(video.thumbnail, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Скачать видео
                {displayCode && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-rose-600/30 text-rose-400 border border-rose-500/40 rounded">
                    {displayCode}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md">
                {video.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Method 1: Open direct player page */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/90 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <HardDriveDownload className="w-3.5 h-3.5" />
                  Способ 1: Прямая ссылка на плеер
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Откройте плеер в отдельном окне. Вы можете нажать правой кнопкой мыши по видео и выбрать{' '}
                  <strong className="text-white">«Сохранить видео как...»</strong> или воспользоваться
                  расширениями загрузки (SaveFrom, Video DownloadHelper).
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-rose-950 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Открыть видео для загрузки
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(embedUrl, 'embed')}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                {copiedType === 'embed' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Ссылка скопирована!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Скопировать ссылку</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Method 2: yt-dlp Console Downloader */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/90 rounded-xl space-y-3">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Terminal className="w-3.5 h-3.5" />
                Способ 2: Загрузка через yt-dlp (Рекомендуется)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Бесплатная утилита <strong className="text-slate-100">yt-dlp</strong> скачивает видеопоток
                в исходном качестве (1080p/720p) и сохраняет в готовый <strong className="text-white">.mp4</strong> файл.
              </p>
            </div>
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-slate-300 break-all select-all">
              <span className="text-slate-500 mr-2 shrink-0">$</span>
              <span className="truncate flex-1">{ytdlpCommand}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(ytdlpCommand, 'ytdlp')}
                className="ml-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 text-xs rounded transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Скопировать команду"
              >
                {copiedType === 'ytdlp' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Копировать</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Method 3: Torrent Searches for 1080p / 4K Original by Release Code */}
          {displayCode && (
            <div className="p-4 bg-slate-950/70 border border-slate-800/90 rounded-xl space-y-3">
              <div>
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Film className="w-3.5 h-3.5" />
                  Способ 3: Оригинал в HD / 4K через торрент
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Поиск несжатой полной версии фильма по артикулу <strong className="text-white font-mono">{displayCode}</strong> на крупнейших каталогах:
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                <a
                  href={`https://sukebei.nyaa.si/?f=0&c=0_0&q=${encodeURIComponent(displayCode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-lg text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
                >
                  <span>Sukebei (Nyaa)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
                <a
                  href={`https://www.tokyotosho.info/search.php?terms=${encodeURIComponent(displayCode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-lg text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
                >
                  <span>Tokyo Toshokan</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(displayCode + ' download torrent 1080p')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-lg text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
                >
                  <span>Google Поиск</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>
            </div>
          )}

          {/* Additional tools: Cover / Poster download */}
          {video.thumbnail && (
            <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Обложка фильма (Постер)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Оригинальное изображение в высоком разрешении
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadThumbnail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Скачать постер
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Поддерживаются все популярные загрузчики (IDM, JDownloader, yt-dlp)
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
