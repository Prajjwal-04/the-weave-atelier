import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { JOURNAL_ARTICLES } from '../../data/journal';

export const EditorialJournalPreview: React.FC = () => {
  const articles = JOURNAL_ARTICLES.slice(0, 3);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const itemWidth = clientWidth * 0.82;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveIdx(Math.min(articles.length - 1, Math.max(0, index)));
  };

  return (
    <section className="py-20 sm:py-28 bg-atelier-ivory border-b border-atelier-parchment/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 space-y-4 md:space-y-0">
          <div className="space-y-2">
            <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-medium flex items-center space-x-2">
              <span className="text-atelier-agedgold">SLOW ESSAYS</span>
              <span className="text-atelier-taupe/40">·</span>
              <span className="text-atelier-taupe">NOTES ON CRAFT & LIVING</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-atelier-softblack font-normal tracking-tight">
              The Atelier <span className="italic font-normal text-atelier-agedgold">Journal</span>
            </h2>
          </div>
          <Link
            to="/journal"
            className="inline-flex items-center text-xs tracking-widest text-atelier-charcoal hover:text-atelier-softblack uppercase font-medium border-b border-atelier-taupe/40 pb-0.5 group transition-colors"
          >
            <span>Read All Articles</span>
            <ArrowRight size={13} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Responsive Hybrid: Mobile Swipe Rail | Desktop 3-Column Grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-3 gap-5 md:gap-8 overflow-x-auto md:overflow-visible scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 pb-4 md:pb-0"
        >
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/journal/${article.slug}`}
              className="flex-shrink-0 w-[82vw] sm:w-[50vw] md:w-auto snap-start group flex flex-col space-y-4 bg-atelier-cream/40 md:bg-transparent p-4 md:p-0 border md:border-0 border-atelier-parchment/70"
            >
              <div className="aspect-[16/10] overflow-hidden bg-atelier-cream border border-atelier-parchment">
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-atelier-taupe">
                    <span className="uppercase tracking-wider font-medium">{article.category}</span>
                    <span className="flex items-center font-mono text-[10px]">
                      <Clock size={11} className="mr-1" />
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-atelier-softblack font-normal leading-snug group-hover:text-atelier-darkbrown transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-xs text-atelier-charcoal/80 font-light leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] tracking-widest uppercase text-atelier-taupe group-hover:text-atelier-softblack inline-flex items-center transition-colors">
                    <span>Read Article</span>
                    <ArrowRight size={12} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Swipe Pagination Dots Indicator */}
        <div className="flex md:hidden items-center justify-center space-x-1.5 mt-6">
          {articles.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIdx === idx ? 'w-6 bg-atelier-softblack' : 'w-1.5 bg-atelier-parchment'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
