import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { JOURNAL_ARTICLES } from '../../data/journal';

export const EditorialJournalPreview: React.FC = () => {
  const articles = JOURNAL_ARTICLES.slice(0, 3);

  return (
    <section className="py-20 sm:py-28 bg-atelier-ivory border-b border-atelier-parchment/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 space-y-4 md:space-y-0">
          <div className="space-y-2">
            <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium block">
              Notes on Craft & Living
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-atelier-softblack font-normal tracking-tight">
              The Atelier Journal
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/journal/${article.slug}`}
              className="group flex flex-col space-y-4"
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
      </div>
    </section>
  );
};
