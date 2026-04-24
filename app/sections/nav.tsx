'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet';
import { useTranslations } from 'next-intl';
import { useCart } from '@/components/contexts/CartContext';

type SearchResult = {
  id: string;
  slug: string;
  name: string;
  price: number;
  original_price: number | null;
  main_image: string;
};

export default function Nav() {
  const tNav = useTranslations('nav');
  const tHeader = useTranslations('header');

  const NAV_LINKS = [
    { label: tNav('home'), href: '/' },
    { label: tNav('products'), href: '/shop' },
    { label: tNav('about'), href: '/about' },
    { label: tNav('contact'), href: '/contact' },
  ];

  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const [badgePop, setBadgePop] = useState(false);
  const prevCountRef = useRef(totalItems);

  // ── Search state ─────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Animate badge on count increase
  useEffect(() => {
    if (totalItems > prevCountRef.current) {
      requestAnimationFrame(() => setBadgePop(true));
      const timer = setTimeout(() => setBadgePop(false), 400);
      prevCountRef.current = totalItems;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = totalItems;
  }, [totalItems]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [searchOpen]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (desktopSearchRef.current && desktopSearchRef.current.contains(target)) ||
        (mobileSearchRef.current && mobileSearchRef.current.contains(target)) ||
        (mobileBtnRef.current && mobileBtnRef.current.contains(target))
      ) {
        return;
      }
      setSearchOpen(false);
    };
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  // Close search on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // ── Debounced search ─────────────────────────────────────────
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 1) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.products || []);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 pt-4 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group" id="nav-logo">
            <Image
              src="/images/logo.png"
              alt="جيارو"
              width={500}
              height={500}
              className="h-24 w-auto transition-transform duration-200 group-hover:scale-105 mix-blend-multiply"
              priority
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-link-${link.href.replace('/', '') || 'home'}`}
                className="
                  px-4 py-2 text-sm font-medium text-neutral-600
                  transition-colors duration-200 rounded-lg
                  hover:text-neutral-950 hover:bg-neutral-50
                "
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <div ref={desktopSearchRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl"
                id="nav-search-btn"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>

              {/* Search Dropdown */}
              {searchOpen && (
                <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Search Input */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
                    <Search className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="ابحث عن منتج..."
                      className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
                      style={{ direction: 'rtl' }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => { setSearchQuery(''); setSearchResults([]); searchInputRef.current?.focus(); }}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Results */}
                  <div className="max-h-[360px] overflow-y-auto">
                    {searchLoading && (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-5 w-5 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
                      </div>
                    )}

                    {!searchLoading && searchQuery.length > 0 && searchResults.length === 0 && (
                      <div className="py-8 text-center text-sm text-neutral-400" style={{ direction: 'rtl' }}>
                        لا توجد نتائج لـ &quot;{searchQuery}&quot;
                      </div>
                    )}

                    {!searchLoading && searchResults.length > 0 && (
                      <div>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id || Math.random().toString()}
                            href={product.slug ? `/shop/${product.slug}` : '#'}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                            style={{ direction: 'rtl' }}
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                              {product.main_image ? (
                                <Image
                                  src={product.main_image}
                                  alt={product.name || 'Product'}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-400">?</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {product.name || 'منتج غير معروف'}
                              </p>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                {product.original_price && product.original_price > product.price ? (
                                  <>
                                    <span className="line-through text-neutral-400 ml-2">
                                      {product.original_price} EGP
                                    </span>
                                    <span className="text-neutral-900 font-medium">
                                      {product.price} EGP
                                    </span>
                                  </>
                                ) : (
                                  <span>{product.price} EGP</span>
                                )}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {!searchLoading && !searchQuery && (
                      <div className="py-8 text-center text-xs text-neutral-400" style={{ direction: 'rtl' }}>
                        اكتب للبحث عن المنتجات
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl"
                id="nav-cart-btn"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-neutral-900 text-white text-[10px] font-bold px-1 transition-transform duration-300 ${badgePop ? 'scale-125' : 'scale-100'}`}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Search Button */}
            <Button
              ref={mobileBtnRef}
              variant="ghost"
              size="icon"
              className="text-neutral-500 hover:text-neutral-900 rounded-xl"
              id="nav-search-btn-mobile"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>

            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-neutral-500 hover:text-neutral-900 rounded-xl"
                id="nav-cart-btn-mobile"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-neutral-900 text-white text-[10px] font-bold px-1 transition-transform duration-300 ${badgePop ? 'scale-125' : 'scale-100'}`}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-neutral-500 hover:text-neutral-900 rounded-xl"
                  id="nav-mobile-menu-trigger"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0" aria-describedby={undefined} showCloseButton={false}>
                <SheetTitle className="sr-only">قائمة التصفح</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-5 border-b border-neutral-100">
                    <Image
                      src="/images/logo.png"
                      alt="جيارو"
                      width={120}
                      height={50}
                      className="h-12 w-auto"
                      style={{ background: 'transparent' }}
                    />
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl text-neutral-400">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Mobile Links */}
                  <div className="flex-1 px-3 py-4 space-y-2 mt-4">
                    {NAV_LINKS.map((link, index) => (
                      <SheetClose key={link.href} asChild>
                        <Link
                          href={link.href}
                          className="
                            flex items-center gap-3 px-4 py-3 rounded-xl
                            text-lg font-semibold text-neutral-700
                            transition-all duration-200
                            hover:bg-neutral-50 hover:text-neutral-950 hover:pl-6
                            active:scale-[0.98]
                            animate-in fade-in slide-in-from-left-8 duration-500
                          "
                          style={{ animationFillMode: 'both', animationDelay: `${(index + 1) * 100}ms` }}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>

                  {/* Mobile Footer */}
                  <div className="p-4 border-t border-neutral-100">
                    <SheetClose asChild>
                      <Link href="/products">
                        <Button
                          className="w-full rounded-xl h-12 text-base font-semibold bg-neutral-900 hover:bg-neutral-800"
                          id="nav-mobile-shop-btn"
                        >
                          {tHeader('shopNow')}
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>

      {/* Mobile Search Overlay (full-width below nav) */}
      {searchOpen && (
        <div className="md:hidden animate-in fade-in slide-in-from-top-2 duration-200" ref={mobileSearchRef}>
          <div className="bg-white border-t border-neutral-100 shadow-lg">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
              <Search className="h-4 w-4 text-neutral-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
                style={{ direction: 'rtl' }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {searchLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
                </div>
              )}

              {!searchLoading && searchQuery.length > 0 && searchResults.length === 0 && (
                <div className="py-8 text-center text-sm text-neutral-400" style={{ direction: 'rtl' }}>
                  لا توجد نتائج لـ &quot;{searchQuery}&quot;
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div>
                  {searchResults.map((product) => (
                    <Link
                      key={product.id || Math.random().toString()}
                      href={product.slug ? `/shop/${product.slug}` : '#'}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                      style={{ direction: 'rtl' }}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                        {product.main_image ? (
                          <Image
                            src={product.main_image}
                            alt={product.name || 'Product'}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-400">?</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {product.name || 'منتج غير معروف'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {product.original_price && product.original_price > product.price ? (
                            <>
                              <span className="line-through text-neutral-400 ml-2">
                                {product.original_price} EGP
                              </span>
                              <span className="text-neutral-900 font-medium">
                                {product.price} EGP
                              </span>
                            </>
                          ) : (
                            <span>{product.price} EGP</span>
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!searchLoading && !searchQuery && (
                <div className="py-8 text-center text-xs text-neutral-400" style={{ direction: 'rtl' }}>
                  اكتب للبحث عن المنتجات
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
