import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useCallback } from "react";

type ApparatusItem = {
  id?: number;
  name: string;
  role: string;
  profile_summary?: string;
  img: string;
};

type PublicApparatusCarouselProps = {
  items: ApparatusItem[];
  eyebrow?: string;
  title: string;
  description?: string;
  detailBasePath?: string | null;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
};

const DEFAULT_USER_IMAGE = "/default-user.jpg";

const PublicApparatusCarousel = ({
  items,
  eyebrow = "Tim Aparatur Desa",
  title,
  description,
  detailBasePath = "/profil-desa/aparatur",
  isLoading = false,
  emptyMessage = "Data aparatur desa sedang disiapkan.",
  emptyTitle = "Tim Pemerintah Desa sedang diperbarui",
}: PublicApparatusCarouselProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const safeItems = useMemo(
    () => items.filter((item) => item.name && item.role),
    [items]
  );

  const getScrollStep = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return 0;
    const firstItem = slider.querySelector(".aparatur-slide-item") as HTMLElement | null;
    const gap = parseInt(window.getComputedStyle(slider).gap || "24", 10);
    return (firstItem?.getBoundingClientRect().width || 300) + gap;
  }, []);

  const slide = (direction: number) => {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.scrollBy({ left: getScrollStep() * direction, behavior: "smooth" });
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || safeItems.length <= 1) return;

    const interval = window.setInterval(() => {
      const step = getScrollStep();
      const nearEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 20;

      if (nearEnd) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        slider.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [safeItems, getScrollStep]);

  if (safeItems.length === 0) {
    return (
      <article className="w-full bg-white py-12">
        <div className="container mx-auto px-4 mb-10">
          <span className="rounded bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            {eyebrow}
          </span>
          <h3 className="mt-4 text-4xl font-semibold leading-tight text-gray-900">
            {title}
          </h3>
          {description ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-500">
              {description}
            </p>
          ) : null}
        </div>

        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-[4/5] rounded-2xl bg-gray-100" />
                  <div className="mt-5 h-5 w-40 rounded bg-gray-100" />
                  <div className="mt-2 h-4 w-28 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-300 shadow-sm">
                <i className="fas fa-users text-2xl" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-gray-900">
                {emptyTitle}
              </h4>
              <p className="mt-2 text-sm leading-6 text-gray-500">{emptyMessage}</p>
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="w-full bg-white py-12">
      {/* Header - Rata Kiri sesuai referensi gambar */}
      <div className="container mx-auto px-4 mb-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded">
          {eyebrow}
        </span>
        <h3 className="mt-4 text-4xl font-semibold text-gray-900 leading-tight">
          {title}
        </h3>
        {description && (
          <p className="mt-4 max-w-xl text-gray-500 text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Carousel Section */}
      <div className="relative group container mx-auto px-4">
        {/* Navigasi Panah - Minimalis */}
        <button
          onClick={() => slide(-1)}
          className="absolute -left-2 top-[40%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-gray-400 transition-all hover:text-black md:-left-8"
        >
          <i className="fas fa-chevron-left text-xl" />
        </button>

        <div
          ref={sliderRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {safeItems.map((item, index) => (
            <div
              key={`${item.id ?? index}-${item.name}`}
              className="aparatur-slide-item w-[260px] flex-none snap-start md:w-[280px]"
            >
              {detailBasePath ? (
                <Link
                  to={item.id ? `${detailBasePath}/${item.id}` : detailBasePath}
                  className="block"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100">
                    <img
                      src={item.img || DEFAULT_USER_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover grayscale-[0.2] transition-all duration-500 hover:scale-105 hover:grayscale-0"
                    />
                  </div>

                  <div className="mt-5 space-y-1">
                    <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
                    <p className="text-sm font-medium text-gray-500">{item.role}</p>
                  </div>
                </Link>
              ) : (
                <div className="block">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100">
                    <img
                      src={item.img || DEFAULT_USER_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="mt-5 space-y-1">
                    <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
                    <p className="text-sm font-medium text-gray-500">{item.role}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => slide(1)}
          className="absolute -right-2 top-[40%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-gray-400 transition-all hover:text-black md:-right-8"
        >
          <i className="fas fa-chevron-right text-xl" />
        </button>

        {/* Indikator Garis Bawah (Progress bar style) */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="h-[3px] w-12 rounded-full bg-gray-800" />
          <div className="h-[3px] w-12 rounded-full bg-gray-200" />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </article>
  );
};

export default PublicApparatusCarousel;
