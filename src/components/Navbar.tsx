import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Search,
  Home,
  Flame,
  Sparkles,
  Users,
  Building,
  Tags,
  SlidersHorizontal,
} from 'lucide-react';

export type ActiveTab = 'catalog' | 'trending' | 'top-rated' | 'actresses' | 'studios' | 'categories' | 'search' | 'filters';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onResetFilters: () => void;
  onToggleFilters?: () => void;
  isFiltersOpen?: boolean;
  onSelectSortNewest?: () => void;
  isSortNewest?: boolean;
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onResetFilters,
  onToggleFilters,
  isFiltersOpen = false,
  onSelectSortNewest,
  isSortNewest = false,
  searchQuery = '',
  onSearch,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Keep local search input in sync with external prop
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  // Focus mobile input when opened
  useEffect(() => {
    if (isMobileSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [isMobileSearchOpen]);

  // Close menu on escape key and prevent body scroll when open
  useEffect(() => {
    if (!isMenuOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleSelectMenuTab = (tab: ActiveTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue.trim());
    setIsMobileSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    onSearch?.('');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090b10] gpu-layer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 relative flex items-center justify-between gap-3">
          {/* Mobile Full-width Search Overlay */}
          {isMobileSearchOpen ? (
            <div className="absolute inset-0 z-30 bg-[#090b10] px-4 flex items-center gap-2 sm:hidden">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center">
                <button
                  type="submit"
                  className="absolute left-2.5 p-1 text-slate-400 hover:text-rose-400 transition-colors"
                  aria-label="Искать"
                >
                  <Search className="w-4 h-4" />
                </button>
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Поиск видео, актрис, студий..."
                  aria-label="Поиск по сайту"
                  className="w-full pl-9 pr-9 py-2 bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Очистить поиск"
                    className="absolute right-2.5 p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Отмена
              </button>
            </div>
          ) : null}

          {/* Left Section: Icon-only Menu button */}
          <div className="flex items-center justify-start z-10 shrink-0">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl border bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border-slate-800 hover:border-slate-700 transition-colors shadow-sm flex items-center justify-center shrink-0"
              aria-expanded={isMenuOpen}
              aria-label="Открыть меню"
              title="Открыть меню"
            >
              <Menu className="w-5 h-5 text-rose-500" />
            </button>
          </div>

          {/* Center: Brand wordmark strictly in the center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto flex items-center justify-center">
            <a
              href="https://javhub.life/"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  onResetFilters();
                  onSelectTab('catalog');
                }
              }}
              className="group flex items-center justify-center focus:outline-none"
              title="JavHub.life - https://javhub.life/"
            >
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-rose-400 transition-colors select-none">
                JavHub<span className="text-rose-500">.life</span>
              </span>
            </a>
          </div>

          {/* Right Section: Search in Header */}
          <div className="flex items-center justify-end z-10 shrink-0">
            {/* Desktop Search Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden sm:flex items-center relative w-48 md:w-60 lg:w-72"
            >
              <button
                type="submit"
                aria-label="Искать"
                className="absolute left-2.5 p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Поиск по сайту..."
                aria-label="Поиск по сайту"
                className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none"
              />
              {searchValue ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Очистить поиск"
                  className="absolute right-2 p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </form>

            {/* Mobile Search Icon Button */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="sm:hidden p-2 rounded-xl border bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border-slate-800 hover:border-slate-700 transition-colors shadow-sm flex items-center justify-center"
              aria-label="Открыть поиск"
              title="Поиск"
            >
              <Search className="w-5 h-5 text-rose-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/80 transition-opacity duration-300 gpu-layer ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Sidebar: slides out from left to right */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] bg-[#0c1017] border-r border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out gpu-layer ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Главное меню"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#090b10]">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-white tracking-tight">
              JavHub<span className="text-rose-500">.life</span>
            </span>
          </div>

          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition-colors"
            aria-label="Закрыть меню"
            title="Закрыть меню"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body: 8 Menu items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-800/80">
          {/* Main 6 navigation items */}
          <div className="space-y-1 pb-2">
            {/* 1. Главная */}
            <button
              onClick={() => handleSelectMenuTab('catalog')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'catalog'
                  ? 'bg-rose-600/20 text-rose-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-rose-400" />
                <span>Главная</span>
              </div>
              {activeTab === 'catalog' && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>

            {/* 2. Популярные */}
            <button
              onClick={() => handleSelectMenuTab('trending')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'trending'
                  ? 'bg-rose-600/20 text-rose-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Популярные</span>
              </div>
              {activeTab === 'trending' && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>

            {/* 3. Топ Рейтинг */}
            <button
              onClick={() => handleSelectMenuTab('top-rated')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'top-rated'
                  ? 'bg-rose-600/20 text-rose-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Топ Рейтинг</span>
              </div>
              {activeTab === 'top-rated' && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>

            {/* 4. Актрисы */}
            <button
              onClick={() => handleSelectMenuTab('actresses')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'actresses'
                  ? 'bg-rose-600/20 text-rose-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-rose-400" />
                <span>Актрисы</span>
              </div>
              {activeTab === 'actresses' && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>

            {/* 5. Студии */}
            <button
              onClick={() => handleSelectMenuTab('studios')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'studios'
                  ? 'bg-rose-600/20 text-rose-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-rose-400" />
                <span>Студии</span>
              </div>
              {activeTab === 'studios' && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>

            {/* 6. Жанры */}
            <button
              onClick={() => handleSelectMenuTab('categories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'categories'
                  ? 'bg-rose-600/20 text-rose-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tags className="w-4 h-4 text-rose-400" />
                <span>Жанры</span>
              </div>
              {activeTab === 'categories' && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          </div>

          {/* Filters & Sorting */}
          <div className="space-y-1 pt-2">
            {/* 7. Фильтры */}
            <button
              onClick={() => handleSelectMenuTab('filters')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === 'filters'
                  ? 'bg-rose-600/20 text-rose-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-4 h-4 text-rose-400" />
                <span>Фильтры</span>
              </div>
              {activeTab === 'filters' && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
