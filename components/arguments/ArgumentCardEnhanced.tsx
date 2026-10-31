'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Argument } from '@/lib/types';
import { isUnverifiedSource } from '@/lib/source-status';
import ConfidenceBar from '../ui/ConfidenceBar';
import EvidenceBadge from '../ui/EvidenceBadge';
import SourceCredibilityBadge from '../ui/SourceCredibilityBadge';
import CitationTooltip from '../ui/CitationTooltip';

interface ArgumentCardEnhancedProps {
  argument: Argument;
  index?: number;
}

export default function ArgumentCardEnhanced({ argument, index = 0 }: ArgumentCardEnhancedProps) {
  const [showLimitations, setShowLimitations] = useState(false);
  const [showFullSource, setShowFullSource] = useState(false);
  const [showSupportingPoints, setShowSupportingPoints] = useState(true);

  // Extract snippet from evidence for citation tooltip
  const evidenceSnippet = argument.evidence.split('.')[0] + '.';

  return (
    <m.div
      initial={{ opacity: 0, y: 24, rotateX: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
        delay: index * 0.1,
      }}
      className="argument-card-enhanced group"
    >
      {/* Faceted glass border effect */}
      <div className="argument-facet-border" />

      {/* Header Section */}
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* Position Badge */}
        <div className="flex-shrink-0">
          <m.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
              delay: index * 0.1 + 0.2,
            }}
            className={`position-badge ${
              argument.position === 'against'
                ? 'position-badge-counterargument'
                : 'position-badge-supporting'
            }`}
          >
            <span className="position-icon">{argument.position === 'against' ? '⚡' : '✓'}</span>
            <span className="position-text">
              {argument.position === 'against' ? 'Challenge' : 'Support'}
            </span>
          </m.div>
        </div>

        {/* Evidence Badge */}
        <div className="flex-shrink-0">
          <EvidenceBadge
            strength={argument.metadata.strength}
            type={argument.metadata.argumentType}
            animated={true}
          />
        </div>
      </div>

      {/* Main Claim with Citation */}
      <h3 className="argument-claim group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
        {argument.mainClaim}
        <CitationTooltip source={argument.sourceMetadata} index={1} snippet={evidenceSnippet} />
      </h3>

      {/* Evidence */}
      <div className="mt-4 mb-5">
        <p className="argument-evidence">{argument.evidence}</p>
      </div>

      {/* Quality Metrics - Horizontal Bars */}
      <div className="quality-metrics-section">
        <ConfidenceBar
          score={argument.qualityScore}
          label="Quality Score"
          size="md"
          animated={true}
        />
        <ConfidenceBar
          score={argument.sourceCredibility}
          label="Source Credibility"
          size="sm"
          showNumeric={false}
          animated={true}
        />
        <ConfidenceBar
          score={argument.evidenceStrength}
          label="Evidence Strength"
          size="sm"
          showNumeric={false}
          animated={true}
        />
      </div>

      {/* Supporting Points - Collapsible */}
      {argument.supportingPoints && argument.supportingPoints.length > 0 && (
        <div className="mt-5">
          <button
            onClick={() => setShowSupportingPoints(!showSupportingPoints)}
            className="collapsible-trigger"
            aria-expanded={showSupportingPoints}
          >
            <span className="collapsible-icon">
              <m.span
                animate={{ rotate: showSupportingPoints ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                ▼
              </m.span>
            </span>
            <span className="collapsible-title">
              Key Supporting Points ({argument.supportingPoints.length})
            </span>
          </button>

          <AnimatePresence>
            {showSupportingPoints && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <ul className="supporting-points-list">
                  {argument.supportingPoints.map((point, idx) => (
                    <m.li
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="supporting-point-item"
                    >
                      <span className="supporting-point-bullet">●</span>
                      <span className="supporting-point-text">{point}</span>
                    </m.li>
                  ))}
                </ul>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Source Metadata - Collapsible */}
      <div className="mt-5 pt-5 border-t border-slate-200/50 dark:border-slate-700/50">
        <button
          onClick={() => setShowFullSource(!showFullSource)}
          className="collapsible-trigger mb-3"
          aria-expanded={showFullSource}
        >
          <span className="collapsible-icon">
            <m.span
              animate={{ rotate: showFullSource ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              ▼
            </m.span>
          </span>
          <span className="collapsible-title">Source Details</span>
        </button>

        {/* Compact source preview (always visible) */}
        {!showFullSource && (
          <div className="source-preview">
            <SourceCredibilityBadge
              source={argument.sourceMetadata}
              score={argument.sourceCredibility}
              compact={true}
            />
            <p className="source-preview-text">
              {isUnverifiedSource(argument.sourceMetadata) ? (
                'Source not verified'
              ) : (
                <>
                  {argument.sourceMetadata.authors?.slice(0, 2).join(', ')}
                  {argument.sourceMetadata.authors &&
                    argument.sourceMetadata.authors.length > 2 &&
                    ' et al.'}
                  {' • '}
                  {argument.sourceMetadata.institution}
                  {argument.sourceMetadata.yearPublished &&
                    ` • ${argument.sourceMetadata.yearPublished}`}
                </>
              )}
            </p>
          </div>
        )}

        {/* Full source details */}
        <AnimatePresence>
          {showFullSource && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <SourceCredibilityBadge
                source={argument.sourceMetadata}
                score={argument.sourceCredibility}
                compact={false}
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tags */}
      {argument.tags && argument.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {argument.tags.slice(0, 4).map((tag, idx) => (
            <m.span
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 + 0.3 }}
              className="argument-tag"
            >
              {tag}
            </m.span>
          ))}
        </div>
      )}

      {/* Limitations - Collapsible Warning Section */}
      {argument.limitations && (
        <div className="mt-5 pt-5 border-t border-amber-200/50 dark:border-amber-700/30">
          <button
            onClick={() => setShowLimitations(!showLimitations)}
            className="collapsible-trigger-warning"
            aria-expanded={showLimitations}
          >
            <span className="warning-icon">⚠️</span>
            <span className="collapsible-title">Limitations & Context</span>
            <span className="collapsible-icon">
              <m.span
                animate={{ rotate: showLimitations ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                ▼
              </m.span>
            </span>
          </button>

          <AnimatePresence>
            {showLimitations && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="limitations-content"
              >
                {argument.limitations}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <style jsx>{`
        .argument-card-enhanced {
          @apply relative p-6 rounded-2xl;
          @apply transition-all duration-500;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 245, 255, 0.7));
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          @apply border border-violet-200/40 dark:border-violet-700/30;
          box-shadow:
            0 2px 8px rgba(139, 92, 246, 0.08),
            0 12px 32px rgba(139, 92, 246, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
        }

        .dark .argument-card-enhanced {
          background: linear-gradient(135deg, rgba(15, 33, 55, 0.95), rgba(31, 27, 61, 0.9));
          box-shadow:
            0 2px 8px rgba(139, 92, 246, 0.15),
            0 12px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(139, 92, 246, 0.1);
        }

        .argument-card-enhanced:hover {
          @apply -translate-y-1 scale-[1.01];
          box-shadow:
            0 4px 16px rgba(139, 92, 246, 0.15),
            0 24px 64px rgba(139, 92, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          @apply border-violet-300/60 dark:border-violet-600/50;
        }

        .argument-facet-border {
          @apply absolute inset-0 rounded-2xl;
          @apply opacity-0 group-hover:opacity-100;
          @apply transition-opacity duration-500;
          @apply pointer-events-none;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.3) 0%,
            rgba(13, 154, 155, 0.2) 50%,
            rgba(124, 58, 237, 0.3) 100%
          );
          filter: blur(16px);
          z-index: -1;
        }

        .position-badge {
          @apply flex items-center gap-2 px-3 py-1.5 rounded-xl;
          @apply text-xs font-bold uppercase tracking-wide;
          @apply border;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .position-badge-counterargument {
          @apply bg-gradient-to-br from-violet-100 to-purple-100;
          @apply dark:from-violet-900/50 dark:to-purple-800/40;
          @apply border-violet-400/60 dark:border-violet-500/40;
          @apply text-violet-700 dark:text-violet-300;
        }

        .position-badge-supporting {
          @apply bg-gradient-to-br from-teal-100 to-cyan-100;
          @apply dark:from-teal-900/50 dark:to-cyan-800/40;
          @apply border-teal-400/60 dark:border-teal-500/40;
          @apply text-teal-700 dark:text-teal-300;
        }

        .position-icon {
          @apply text-base;
        }

        .position-text {
          @apply text-[10px];
        }

        .argument-claim {
          @apply text-xl font-bold;
          @apply text-slate-800 dark:text-slate-100;
          @apply leading-tight;
          @apply transition-colors duration-200;
        }

        .argument-evidence {
          @apply text-base leading-relaxed;
          @apply text-slate-700 dark:text-slate-300;
        }

        .quality-metrics-section {
          @apply space-y-3 p-4 rounded-xl;
          @apply bg-slate-50/50 dark:bg-slate-900/30;
          @apply border border-slate-200/50 dark:border-slate-700/30;
        }

        .collapsible-trigger,
        .collapsible-trigger-warning {
          @apply flex items-center gap-2 w-full;
          @apply text-sm font-semibold;
          @apply text-slate-700 dark:text-slate-300;
          @apply hover:text-violet-600 dark:hover:text-violet-400;
          @apply transition-colors duration-200;
          @apply cursor-pointer;
        }

        .collapsible-trigger-warning {
          @apply text-amber-700 dark:text-amber-400;
          @apply hover:text-amber-800 dark:hover:text-amber-300;
        }

        .collapsible-icon {
          @apply text-slate-400 dark:text-slate-600;
          @apply ml-auto;
        }

        .collapsible-title {
          @apply flex-grow;
        }

        .warning-icon {
          @apply text-base;
        }

        .supporting-points-list {
          @apply mt-3 space-y-2;
        }

        .supporting-point-item {
          @apply flex items-start gap-2;
          @apply text-sm text-slate-700 dark:text-slate-300;
          @apply leading-relaxed;
        }

        .supporting-point-bullet {
          @apply text-violet-500 dark:text-violet-400;
          @apply flex-shrink-0 mt-0.5;
        }

        .supporting-point-text {
          @apply flex-grow;
        }

        .source-preview {
          @apply space-y-2;
        }

        .source-preview-text {
          @apply text-xs text-slate-700 dark:text-slate-300;
          @apply leading-relaxed;
        }

        .argument-tag {
          @apply inline-flex items-center;
          @apply px-2.5 py-1 rounded-lg;
          @apply text-xs font-medium;
          @apply bg-slate-100 dark:bg-slate-800/50;
          @apply text-slate-700 dark:text-slate-300;
          @apply border border-slate-200/50 dark:border-slate-700/50;
          @apply transition-all duration-200;
          @apply hover:bg-violet-100 dark:hover:bg-violet-900/30;
          @apply hover:text-violet-700 dark:hover:text-violet-300;
          @apply hover:border-violet-300 dark:hover:border-violet-700;
        }

        .limitations-content {
          @apply mt-3 p-4 rounded-xl;
          @apply text-sm text-amber-800 dark:text-amber-200;
          @apply bg-amber-50/80 dark:bg-amber-950/30;
          @apply border-l-4 border-amber-500 dark:border-amber-600;
          @apply leading-relaxed;
          @apply overflow-hidden;
        }
      `}</style>
    </m.div>
  );
}
