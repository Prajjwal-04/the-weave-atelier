import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { JOURNAL_ARTICLES } from '../data/journal';
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react';

export const JournalPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // If viewing a single article
  if (slug) {
    const article = JOURNAL_ARTICLES.find((a) => a.slug === slug) || JOURNAL_ARTICLES[0];
    const otherArticles = JOURNAL_ARTICLES.filter((a) => a.id !== article.id);

    return (
      <div className="pt-24 sm:pt-28 pb-24 bg-atelier-ivory min-h-screen">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Back link & Category */}
          <div className="flex items-center justify-between text-xs text-atelier-taupe border-b border-atelier-parchment pb-4">
            <Link to="/journal" className="inline-flex items-center hover:text-atelier-softblack transition-colors">
              <ArrowLeft size={13} className="mr-1.5" />
              <span>Back to Journal</span>
            </Link>
            <div className="flex items-center space-x-3">
              <span className="uppercase tracking-widest">{article.category}</span>
              <span>·</span>
              <span className="font-mono flex items-center">
                <Clock size={12} className="mr-1" />
                {article.readTime}
              </span>
            </div>
          </div>

          {/* Article Title & Subtitle */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-atelier-softblack font-light leading-tight">
              {article.title}
            </h1>
            <p className="text-base sm:text-lg text-atelier-charcoal font-light leading-relaxed">
              {article.subtitle}
            </p>
            <div className="text-xs text-atelier-taupe pt-2">
              Published by <span className="text-atelier-softblack font-medium">{article.author}</span> · {article.publishedDate}
            </div>
          </div>

          {/* Hero Image */}
          <div className="aspect-[16/9] overflow-hidden bg-atelier-parchment border border-atelier-parchment shadow-subtle">
            <img
              src={article.heroImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Body Content */}
          <div className="max-w-2xl mx-auto space-y-8 text-sm sm:text-base text-atelier-charcoal font-light leading-relaxed">
            {article.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                {section.heading && (
                  <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal pt-4">
                    {section.heading}
                  </h2>
                )}
                {section.body.map((p, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {p}
                  </p>
                ))}
                {section.quote && (
                  <blockquote className="my-6 p-6 border-l-2 border-atelier-darkbrown bg-atelier-cream font-serif italic text-lg sm:text-xl text-atelier-darkbrown">
                    “{section.quote}”
                  </blockquote>
                )}
              </div>
            ))}
          </div>

          {/* Author attribution */}
          <div className="max-w-2xl mx-auto pt-8 border-t border-atelier-parchment text-xs text-atelier-taupe flex items-center justify-between">
            <div>The Weave Atelier Journal · Bhadohi, India</div>
            <Link to="/shop" className="hover:underline text-atelier-softblack">
              Explore Handmade Rugs →
            </Link>
          </div>

          {/* More Articles */}
          <div className="pt-16 border-t border-atelier-parchment space-y-8">
            <h3 className="font-serif text-2xl text-atelier-softblack">
              Further Notes from the Atelier
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {otherArticles.map((other) => (
                <Link
                  key={other.id}
                  to={`/journal/${other.slug}`}
                  className="group block space-y-3"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-atelier-cream border border-atelier-parchment">
                    <img
                      src={other.heroImage}
                      alt={other.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-atelier-taupe font-medium">
                    {other.category} · {other.readTime}
                  </div>
                  <h4 className="font-serif text-xl text-atelier-softblack group-hover:text-atelier-darkbrown transition-colors">
                    {other.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Journal Index
  return (
    <div className="pt-24 sm:pt-28 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="border-b border-atelier-parchment pb-8 max-w-3xl">
          <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium mb-2">
            The Weave Atelier Magazine
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-atelier-softblack font-light tracking-tight">
            The Journal
          </h1>
          <p className="text-sm sm:text-base text-atelier-charcoal font-light mt-3 leading-relaxed">
            Essays on Indian carpet heritage, architectural sizing principles, natural living fibers, and interior styling from our Bhadohi studio.
          </p>
        </div>

        {/* Featured Top Article */}
        {JOURNAL_ARTICLES[0] && (
          <Link
            to={`/journal/${JOURNAL_ARTICLES[0].slug}`}
            className="group block bg-atelier-cream border border-atelier-parchment overflow-hidden hover:border-atelier-taupe transition-colors"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 aspect-[16/10] overflow-hidden">
                <img
                  src={JOURNAL_ARTICLES[0].heroImage}
                  alt={JOURNAL_ARTICLES[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-atelier-taupe">
                    <span className="uppercase tracking-wider font-medium">{JOURNAL_ARTICLES[0].category}</span>
                    <span className="font-mono text-[11px]">{JOURNAL_ARTICLES[0].readTime}</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-atelier-softblack font-normal leading-snug group-hover:text-atelier-darkbrown transition-colors">
                    {JOURNAL_ARTICLES[0].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-atelier-charcoal font-light leading-relaxed">
                    {JOURNAL_ARTICLES[0].excerpt}
                  </p>
                </div>
                <div className="flex items-center text-xs tracking-widest uppercase text-atelier-softblack font-medium group-hover:text-atelier-darkbrown">
                  <span>Read Full Essay</span>
                  <ArrowRight size={13} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Other Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {JOURNAL_ARTICLES.slice(1).map((article) => (
            <Link
              key={article.id}
              to={`/journal/${article.slug}`}
              className="group block space-y-4 bg-atelier-ivory border border-atelier-parchment p-6 hover:border-atelier-taupe transition-colors"
            >
              <div className="aspect-[16/10] overflow-hidden bg-atelier-cream border border-atelier-parchment">
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-atelier-taupe">
                  <span className="uppercase tracking-wider font-medium">{article.category}</span>
                  <span className="font-mono text-[10px]">{article.readTime}</span>
                </div>
                <h3 className="font-serif text-2xl text-atelier-softblack font-normal group-hover:text-atelier-darkbrown transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-atelier-charcoal font-light leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="pt-2 text-[11px] tracking-wider uppercase text-atelier-taupe group-hover:text-atelier-softblack flex items-center">
                  <span>Read Article</span>
                  <ArrowRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
