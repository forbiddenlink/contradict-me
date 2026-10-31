'use client';

import { m } from 'framer-motion';
import { Argument } from '@/lib/types';
import { isUnverifiedSource } from '@/lib/source-status';

interface SourceCredibilityBadgeProps {
  source: Argument['sourceMetadata'];
  score?: number;
  compact?: boolean;
}

export default function SourceCredibilityBadge({
  source,
  score,
  compact = false,
}: SourceCredibilityBadgeProps) {
  if (isUnverifiedSource(source)) {
    return <span className="credibility-micro-badge">Source not verified</span>;
  }

  const isPeerReviewed = source.publicationType === 'peer-reviewed';
  const hasCitations = source.citationCount && source.citationCount > 0;
  const isRecent = source.yearPublished && source.yearPublished >= new Date().getFullYear() - 3;

  // Calculate visual credibility level from score
  const getCredibilityLevel = (s?: number) => {
    if (!s) return 'medium';
    if (s >= 85) return 'high';
    if (s >= 60) return 'medium';
    return 'low';
  };

  const credibilityLevel = getCredibilityLevel(score);

  const levelStyles = {
    high: {
      bg: 'from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-800/30',
      border: 'border-violet-400/60 dark:border-violet-500/40',
      text: 'text-violet-800 dark:text-violet-200',
      icon: '🏆',
    },
    medium: {
      bg: 'from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-800/30',
      border: 'border-blue-400/60 dark:border-blue-500/40',
      text: 'text-blue-800 dark:text-blue-200',
      icon: '✓',
    },
    low: {
      bg: 'from-gray-100 to-slate-100 dark:from-gray-800/40 dark:to-slate-700/30',
      border: 'border-gray-400/60 dark:border-gray-500/40',
      text: 'text-gray-700 dark:text-gray-300',
      icon: '○',
    },
  };

  const style = levelStyles[credibilityLevel];

  // Compact version - just badges
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {isPeerReviewed && (
          <span className="credibility-micro-badge peer-reviewed">✓ Peer-Reviewed</span>
        )}
        {hasCitations && (
          <span className="credibility-micro-badge citations">
            📈 {source.citationCount!.toLocaleString()}
          </span>
        )}
        {isRecent && <span className="credibility-micro-badge recent">🕐 Recent</span>}
      </div>
    );
  }

  // Full version - detailed card
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`
        credibility-badge
        bg-gradient-to-br ${style.bg}
        ${style.border}
      `}
    >
      {/* Header with score */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{style.icon}</span>
          <span className={`text-sm font-bold ${style.text}`}>Source Credibility</span>
        </div>
        {score !== undefined && (
          <div className={`credibility-score ${style.text}`}>
            <span className="text-xl font-bold tabular-nums">{score}</span>
            <span className="text-xs opacity-60">/100</span>
          </div>
        )}
      </div>

      {/* Credibility Indicators */}
      <div className="space-y-2">
        {/* Peer Review Status */}
        {isPeerReviewed && (
          <div className="credibility-indicator peer-reviewed-indicator">
            <span className="credibility-indicator-icon">✓</span>
            <span className="credibility-indicator-text">Peer-Reviewed Publication</span>
          </div>
        )}

        {/* Citation Count */}
        {hasCitations && (
          <div className="credibility-indicator citations-indicator">
            <span className="credibility-indicator-icon">📈</span>
            <span className="credibility-indicator-text">
              {source.citationCount!.toLocaleString()} Academic Citations
            </span>
          </div>
        )}

        {/* Recency */}
        {isRecent && (
          <div className="credibility-indicator recent-indicator">
            <span className="credibility-indicator-icon">🕐</span>
            <span className="credibility-indicator-text">
              Published {source.yearPublished} (Recent)
            </span>
          </div>
        )}

        {/* Institution */}
        {source.institution && (
          <div className="credibility-indicator institution-indicator">
            <span className="credibility-indicator-icon">🏛️</span>
            <span className="credibility-indicator-text">{source.institution}</span>
          </div>
        )}

        {/* Journal (if available) */}
        {source.journal && (
          <div className="credibility-indicator journal-indicator">
            <span className="credibility-indicator-icon">📰</span>
            <span className="credibility-indicator-text">{source.journal}</span>
          </div>
        )}
      </div>

      {/* Faceted shine effect */}
      <div className="credibility-shine" />

      <style jsx>{`
        .credibility-badge {
          @apply relative p-4 rounded-xl;
          @apply border;
          @apply overflow-hidden;
          box-shadow:
            0 4px 12px rgba(139, 92, 246, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .dark .credibility-badge {
          box-shadow:
            0 4px 12px rgba(139, 92, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .credibility-score {
          @apply flex items-baseline gap-0.5;
        }

        .credibility-indicator {
          @apply flex items-center gap-2;
          @apply text-xs;
        }

        .credibility-indicator-icon {
          @apply text-sm flex-shrink-0;
        }

        .credibility-indicator-text {
          @apply font-medium;
          @apply text-slate-700 dark:text-slate-300;
        }

        .credibility-micro-badge {
          @apply inline-flex items-center gap-1;
          @apply px-2 py-0.5 rounded-md;
          @apply text-[10px] font-semibold;
          @apply border;
          @apply transition-all duration-200;
        }

        .credibility-micro-badge.peer-reviewed {
          @apply bg-violet-100 dark:bg-violet-900/40;
          @apply border-violet-300 dark:border-violet-700;
          @apply text-violet-700 dark:text-violet-300;
        }

        .credibility-micro-badge.citations {
          @apply bg-emerald-100 dark:bg-emerald-900/40;
          @apply border-emerald-300 dark:border-emerald-700;
          @apply text-emerald-700 dark:text-emerald-300;
        }

        .credibility-micro-badge.recent {
          @apply bg-blue-100 dark:bg-blue-900/40;
          @apply border-blue-300 dark:border-blue-700;
          @apply text-blue-700 dark:text-blue-300;
        }

        .credibility-shine {
          @apply absolute inset-0;
          @apply opacity-10;
          @apply pointer-events-none;
          background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(255, 255, 255, 0.9) 48%,
            rgba(255, 255, 255, 1) 50%,
            rgba(255, 255, 255, 0.9) 52%,
            transparent 100%
          );
          background-size: 200% 200%;
          animation: credibility-shine-sweep 5s ease-in-out infinite;
        }

        @keyframes credibility-shine-sweep {
          0%,
          100% {
            background-position: -100% 0;
          }
          50% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </m.div>
  );
}
