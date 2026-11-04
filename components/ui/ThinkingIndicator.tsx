'use client';

import { m } from 'framer-motion';

interface ThinkingIndicatorProps {
  phase: number;
  message: string;
  totalPhases?: number;
}

export default function ThinkingIndicator({
  phase,
  message,
  totalPhases = 4,
}: ThinkingIndicatorProps) {
  const progress = ((phase + 1) / totalPhases) * 100;
  const circumference = 2 * Math.PI * 14; // radius = 14
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="thinking-indicator-wrapper"
    >
      {/* Morphing Blob - Abstract Thinking Visualization */}
      <div className="thinking-blob-container">
        <div className="thinking-blob" />
      </div>

      {/* Progress Ring */}
      <div className="progress-ring-container">
        <svg className="progress-ring-svg" viewBox="0 0 32 32">
          {/* Background circle */}
          <circle cx="16" cy="16" r="14" className="progress-ring-bg" strokeWidth="2" fill="none" />
          {/* Progress circle */}
          <m.circle
            cx="16"
            cy="16"
            r="14"
            className="progress-ring-fill"
            strokeWidth="2"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>

        {/* Phase number */}
        <div className="progress-ring-label">
          {phase + 1}/{totalPhases}
        </div>
      </div>

      {/* Message */}
      <div className="thinking-message-container">
        <m.p
          key={message}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="thinking-message"
        >
          {message}
        </m.p>

        {/* Animated dots */}
        <div className="thinking-dots">
          <m.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
            className="thinking-dot"
          >
            ●
          </m.span>
          <m.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
            className="thinking-dot"
          >
            ●
          </m.span>
          <m.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
            className="thinking-dot"
          >
            ●
          </m.span>
        </div>
      </div>

      <style jsx>{`
        .thinking-indicator-wrapper {
          @apply flex items-center gap-4 p-4 rounded-xl;
          @apply bg-gradient-to-br from-violet-50/80 to-purple-50/60;
          @apply dark:from-violet-950/40 dark:to-purple-900/30;
          @apply border border-violet-200/50 dark:border-violet-700/30;
          @apply backdrop-blur-sm;
        }

        .thinking-blob-container {
          @apply relative w-12 h-12 flex-shrink-0;
        }

        .thinking-blob {
          @apply absolute inset-0;
          background: linear-gradient(135deg, #ff5a2d 0%, #a3a3a3 50%, #e8410f 100%);
          background-size: 200% 200%;
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          animation:
            blob-morph 4s ease-in-out infinite,
            blob-gradient 3s ease-in-out infinite;
          box-shadow:
            0 4px 16px rgba(139, 92, 246, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        @keyframes blob-morph {
          0%,
          100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: rotate(90deg) scale(1.05);
          }
          50% {
            border-radius: 50% 60% 30% 40% / 40% 50% 70% 50%;
            transform: rotate(180deg) scale(1);
          }
          75% {
            border-radius: 40% 30% 60% 50% / 60% 40% 50% 70%;
            transform: rotate(270deg) scale(1.05);
          }
        }

        @keyframes blob-gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .progress-ring-container {
          @apply relative w-8 h-8 flex-shrink-0;
        }

        .progress-ring-svg {
          @apply w-full h-full;
          transform: rotate(-90deg);
        }

        .progress-ring-bg {
          @apply stroke-slate-200 dark:stroke-slate-700;
        }

        .progress-ring-fill {
          @apply stroke-violet-500 dark:stroke-violet-400;
        }

        .progress-ring-label {
          @apply absolute inset-0;
          @apply flex items-center justify-center;
          @apply text-[10px] font-bold;
          @apply text-violet-700 dark:text-violet-300;
          @apply tabular-nums;
        }

        .thinking-message-container {
          @apply flex-grow flex items-center gap-2;
        }

        .thinking-message {
          @apply text-sm font-medium;
          @apply text-slate-700 dark:text-slate-300;
        }

        .thinking-dots {
          @apply flex items-center gap-0.5;
        }

        .thinking-dot {
          @apply text-violet-500 dark:text-violet-400;
          @apply text-xs;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .thinking-blob {
            animation: none !important;
            border-radius: 50% !important;
          }

          .thinking-dot {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </m.div>
  );
}
