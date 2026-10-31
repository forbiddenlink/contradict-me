'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Argument } from '@/lib/types';
import { isUnverifiedSource } from '@/lib/source-status';

interface CitationTooltipProps {
  source: Argument['sourceMetadata'];
  index: number;
  snippet?: string;
}

export default function CitationTooltip({ source, index, snippet }: CitationTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Mobile: tap to toggle, Desktop: hover
  const handleInteraction = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(!isMobileOpen);
    }
  };

  const isVisible = isOpen || isMobileOpen;

  return (
    <span className="relative inline-block">
      {/* Citation Number - Faceted Button */}
      <button
        className="citation-marker group"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={handleInteraction}
        aria-label={`Citation ${index}: ${source.title}`}
        aria-describedby={isVisible ? `citation-tooltip-${index}` : undefined}
      >
        <sup className="citation-number">[{index}]</sup>
      </button>

      {/* Tooltip - Glassmorphic Card */}
      <AnimatePresence>
        {isVisible && (
          <m.div
            id={`citation-tooltip-${index}`}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="citation-tooltip"
            role="tooltip"
          >
            {/* Faceted Glass Border Effect */}
            <div className="citation-tooltip-border" />

            <div className="citation-tooltip-content">
              {/* Source Type Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="citation-badge">
                  {isUnverifiedSource(source) && <>Source not verified</>}
                  {source.publicationType === 'peer-reviewed' && (
                    <>
                      <span aria-hidden="true">📊</span> Peer-Reviewed
                    </>
                  )}
                  {source.publicationType === 'report' && (
                    <>
                      <span aria-hidden="true">📄</span> Report
                    </>
                  )}
                  {source.publicationType === 'book' && (
                    <>
                      <span aria-hidden="true">📚</span> Book
                    </>
                  )}
                  {source.publicationType === 'article' && (
                    <>
                      <span aria-hidden="true">📰</span> Article
                    </>
                  )}
                </span>
                {source.yearPublished && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {source.yearPublished}
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className="citation-title">{source.title}</h4>

              {/* Authors & Institution */}
              <div className="mt-2 space-y-1">
                {source.authors && source.authors.length > 0 && (
                  <p className="citation-authors">
                    {source.authors.slice(0, 2).join(', ')}
                    {source.authors.length > 2 && ` +${source.authors.length - 2} more`}
                  </p>
                )}
                {source.institution && !isUnverifiedSource(source) && (
                  <p className="citation-institution">{source.institution}</p>
                )}
              </div>

              {/* Snippet Preview */}
              {snippet && <p className="citation-snippet">&ldquo;{snippet}&rdquo;</p>}

              {/* Citation Count */}
              {source.citationCount && source.citationCount > 0 && (
                <div className="citation-metrics">
                  <span className="citation-metric-item">
                    <span aria-hidden="true">📈</span> {source.citationCount.toLocaleString()}{' '}
                    citations
                  </span>
                </div>
              )}

              {/* Link */}
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="citation-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  View source →
                </a>
              )}
            </div>

            {/* Arrow pointer */}
            <div className="citation-arrow" />
          </m.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .citation-marker {
          @apply relative inline-flex items-center justify-center;
          @apply transition-all duration-200;
          @apply cursor-pointer;
        }

        .citation-number {
          @apply inline-flex items-center justify-center;
          @apply text-[10px] font-bold;
          @apply px-1.5 py-0.5 rounded-md;
          @apply bg-gradient-to-br from-violet-500/90 to-violet-600/90;
          @apply text-white;
          @apply shadow-sm;
          @apply transition-all duration-200;
          @apply hover:from-violet-600 hover:to-violet-700;
          @apply hover:shadow-md hover:scale-110;
          @apply dark:from-violet-400/90 dark:to-violet-500/90;
        }

        .citation-tooltip {
          @apply absolute bottom-full left-1/2 -translate-x-1/2 mb-2;
          @apply w-80 max-w-[90vw];
          @apply pointer-events-auto;
          @apply z-50;
        }

        .citation-tooltip-border {
          @apply absolute inset-0;
          @apply rounded-xl;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.4) 0%,
            rgba(13, 154, 155, 0.3) 50%,
            rgba(124, 58, 237, 0.4) 100%
          );
          @apply blur-sm;
          @apply -z-10;
        }

        .citation-tooltip-content {
          @apply relative;
          @apply p-4 rounded-xl;
          @apply bg-white/95 dark:bg-slate-800/95;
          @apply backdrop-blur-xl;
          @apply border border-violet-200/50 dark:border-violet-700/50;
          @apply shadow-xl;
          box-shadow:
            0 10px 40px rgba(139, 92, 246, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .dark .citation-tooltip-content {
          box-shadow:
            0 10px 40px rgba(139, 92, 246, 0.25),
            0 4px 12px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .citation-badge {
          @apply inline-flex items-center gap-1;
          @apply px-2 py-0.5 rounded-md;
          @apply bg-violet-100 dark:bg-violet-900/40;
          @apply text-violet-700 dark:text-violet-300;
          @apply text-xs font-semibold;
          @apply border border-violet-200/50 dark:border-violet-700/50;
        }

        .citation-title {
          @apply text-sm font-bold;
          @apply text-slate-800 dark:text-slate-100;
          @apply leading-snug;
          @apply line-clamp-2;
        }

        .citation-authors {
          @apply text-xs;
          @apply text-slate-700 dark:text-slate-300;
          @apply font-medium;
        }

        .citation-institution {
          @apply text-xs;
          @apply text-slate-500 dark:text-slate-500;
          @apply italic;
        }

        .citation-snippet {
          @apply mt-3 pt-3;
          @apply border-t border-slate-200 dark:border-slate-700;
          @apply text-xs italic;
          @apply text-slate-700 dark:text-slate-300;
          @apply leading-relaxed;
          @apply line-clamp-3;
        }

        .citation-metrics {
          @apply mt-3 pt-2;
          @apply border-t border-slate-200 dark:border-slate-700;
          @apply flex items-center gap-3;
        }

        .citation-metric-item {
          @apply text-xs font-semibold;
          @apply text-emerald-600 dark:text-emerald-400;
        }

        .citation-link {
          @apply mt-3 inline-flex items-center gap-1;
          @apply text-xs font-semibold;
          @apply text-violet-600 dark:text-violet-400;
          @apply hover:text-violet-700 dark:hover:text-violet-300;
          @apply transition-colors;
          @apply underline decoration-dotted underline-offset-2;
        }

        .citation-arrow {
          @apply absolute top-full left-1/2 -translate-x-1/2 -mt-px;
          @apply w-3 h-3;
          @apply bg-white dark:bg-slate-800;
          @apply border-r border-b border-violet-200/50 dark:border-violet-700/50;
          @apply rotate-45;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .citation-tooltip {
            @apply left-0 translate-x-0;
            @apply w-full max-w-[calc(100vw-2rem)];
          }

          .citation-arrow {
            @apply left-8;
          }
        }
      `}</style>
    </span>
  );
}
