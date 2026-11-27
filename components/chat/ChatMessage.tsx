'use client';

import dynamic from 'next/dynamic';
import { Message } from '@/lib/types';
import { SkeletonCard } from '../ui/SkeletonCard';

// Dynamic import for ArgumentCard - reduces initial bundle size
const ArgumentCardEnhanced = dynamic(() => import('../arguments/ArgumentCardEnhanced'), {
  loading: () => <SkeletonCard />,
  ssr: false, // Only needed client-side for animations
});

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

function parseAssistantMessage(content: string) {
  const lines = content.split('\n').filter((line) => line.trim());

  // Find the first argument marker (numbered point or separator)
  const firstArgIndex = lines.findIndex((line) => /^\*\*\d+\./.test(line) || line.trim() === '---');

  // Intro is everything before the first argument
  const introEnd = firstArgIndex > 0 ? firstArgIndex : Math.min(3, lines.length);

  return {
    intro: lines.slice(0, introEnd).join('\n'),
    rest: lines.slice(introEnd).join('\n'),
  };
}

// Render inline markdown (bold) within text
function renderInlineMarkdown(text: string): React.ReactNode {
  // Handle bold text wrapped in double asterisks
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const boldPattern = /\*\*(.+?)\*\*/g;
  let match;

  while ((match = boldPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add the bold text
    parts.push(
      <strong key={match.index} className="font-semibold text-slate-900 dark:text-slate-100">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const parsed = !isUser ? parseAssistantMessage(message.content) : null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-200 ${
            isUser
              ? 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white'
              : 'bg-gradient-to-br from-white/95 to-violet-50/50 dark:from-slate-800/95 dark:to-violet-950/30 backdrop-blur-sm border border-violet-100/50 dark:border-violet-900/30 text-slate-800 dark:text-slate-200'
          }`}
        >
          {isUser ? (
            <p className="text-white">{message.content}</p>
          ) : (
            <div className="space-y-4">
              {/* Streaming cursor for empty content */}
              {isStreaming && !message.content && (
                <span
                  className="inline-block w-2 h-5 bg-violet-500 animate-pulse rounded-sm"
                  aria-label="Receiving response"
                />
              )}
              {/* Intro text */}
              {parsed && parsed.intro && (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {parsed.intro.split('\n').map((line, i) => {
                    // Remove surrounding quotes and clean up
                    const cleanLine = line.replace(/^"(.*)"$/, '$1');
                    // Skip separator lines
                    if (cleanLine === '---') return null;
                    return (
                      <p
                        key={i}
                        className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2"
                      >
                        {renderInlineMarkdown(cleanLine)}
                      </p>
                    );
                  })}
                </div>
              )}

              {/* Main content - formatted */}
              {parsed && parsed.rest && (
                <div className="space-y-3">
                  {parsed.rest.split('---').map((section, idx) => {
                    if (!section.trim()) return null;

                    // Check if this section contains a numbered argument
                    const isArgument = section.match(/^\*\*\d+\./);

                    if (isArgument) {
                      return (
                        <div
                          key={idx}
                          className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700"
                        >
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            {section.split('\n').map((line, i) => {
                              if (!line.trim()) return null;

                              // Remove surrounding quotes if present
                              const cleanLine = line.replace(/^"(.*)"$/, '$1');

                              // Source citations (📚)
                              if (cleanLine.startsWith('📚')) {
                                return (
                                  <p
                                    key={i}
                                    className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg mt-3"
                                  >
                                    {cleanLine}
                                  </p>
                                );
                              }

                              // Nuance or warning section (⚠️ or starts with Nuance)
                              if (
                                cleanLine.includes('⚠️ Nuance:') ||
                                cleanLine.match(/^\*\*Nuance\*\*:/)
                              ) {
                                return (
                                  <p
                                    key={i}
                                    className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg mt-3 border-l-4 border-amber-400"
                                  >
                                    {renderInlineMarkdown(
                                      cleanLine.replace(/^\*\*Nuance\*\*:/, '⚠️ Nuance:')
                                    )}
                                  </p>
                                );
                              }

                              // Evidence strength
                              if (cleanLine.includes('Evidence Strength:')) {
                                return (
                                  <p
                                    key={i}
                                    className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-2"
                                  >
                                    {cleanLine}
                                  </p>
                                );
                              }

                              // Bullet points (lines starting with -)
                              if (cleanLine.startsWith('- ')) {
                                return (
                                  <p
                                    key={i}
                                    className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2 pl-4 border-l-2 border-slate-200 dark:border-slate-600"
                                  >
                                    {renderInlineMarkdown(cleanLine.slice(2))}
                                  </p>
                                );
                              }

                              // Regular lines - render with inline markdown
                              return (
                                <p
                                  key={i}
                                  className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2"
                                >
                                  {renderInlineMarkdown(cleanLine)}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    // Regular text section - also render with inline markdown
                    return (
                      <div key={idx} className="text-slate-700 dark:text-slate-300">
                        {section.split('\n').map((line, i) => {
                          if (!line.trim()) return null;
                          const cleanLine = line.replace(/^"(.*)"$/, '$1');
                          return (
                            <p key={i} className="mb-2">
                              {renderInlineMarkdown(cleanLine)}
                            </p>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Streaming cursor at end of content */}
              {isStreaming && message.content && (
                <span
                  className="inline-block w-2 h-4 bg-violet-500 animate-pulse rounded-sm ml-1"
                  aria-hidden="true"
                />
              )}
            </div>
          )}
        </div>

        {/* Arguments (if assistant message has them) */}
        {!isUser && message.arguments && message.arguments.length > 0 && (
          <div className="mt-4 space-y-4">
            {message.arguments.map((argument, index) => (
              <ArgumentCardEnhanced key={argument.objectID} argument={argument} index={index} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        {/* Server renders in UTC; the visitor's clock and timezone differ, so the text is
            expected to change on hydration (React #418 otherwise). */}
        <time
          dateTime={new Date(message.timestamp).toISOString()}
          suppressHydrationWarning
          className={`block text-xs text-gray-500 dark:text-slate-500 mt-2 ${isUser ? 'text-right' : 'text-left'}`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </div>
    </div>
  );
}
