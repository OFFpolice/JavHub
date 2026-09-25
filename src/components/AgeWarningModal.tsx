import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';
import { hasAcceptedAgeWarning, setAcceptedAgeWarning } from '../services/storage';

interface AgeWarningModalProps {
  onAccept?: () => void;
}

export const AgeWarningModal: React.FC<AgeWarningModalProps> = ({ onAccept }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!hasAcceptedAgeWarning()) {
      setIsOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    setAcceptedAgeWarning();
    setIsOpen(false);
    if (onAccept) onAccept();
  };

  const handleLeave = () => {
    window.location.href = 'https://google.com';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 gpu-layer">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          Добро пожаловать в JavHub.life
        </h2>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Сайт <strong className="text-slate-200">JavHub.life</strong> содержит медиаматериалы исключительно для совершеннолетней аудитории (18+). Подтвердите, что вам исполнилось 18 лет, для доступа к просмотру.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-rose-900/30"
          >
            <CheckCircle className="w-4 h-4" />
            Мне есть 18 лет
          </button>
          <button
            onClick={handleLeave}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700/60"
          >
            Покинуть сайт
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Нажимая «Мне есть 18 лет», вы подтверждаете согласие с просмотром контента для взрослых.
        </p>
      </div>
    </div>
  );
};
