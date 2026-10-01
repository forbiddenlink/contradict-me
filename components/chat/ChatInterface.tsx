'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Message } from '@/lib/types';
import { trimHistory } from '@/lib/chat-history';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import FollowUpSuggestions from './FollowUpSuggestions';
import EnhancedThinkingIndicator from '../ui/EnhancedThinkingIndicator';
import { ConversationHistorySidebar } from '../ui/ConversationHistorySidebar';
import ThemeToggle from '../ThemeToggle';

// Dynamic import for ShareModal - only load when needed (client-only)
const ShareModal = dynamic(() => import('../ui/ShareModal'), {
  ssr: false,
  loading: () => null,
});
import { Menu, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveConversation, loadConversation, clearConversation } from '@/lib/storage';
import {
  useConversationOperations,
  useConversationTracking,
  useConversation,
} from '@/lib/hooks/useConversations';
import { db } from '@/lib/db';

// Generate unique IDs using crypto
const generateId = () => crypto.randomUUID();

// Multi-phase loading states for better UX
const LOADING_PHASES = [
  { message: 'Understanding your belief...', duration: 1500 },
  { message: 'Researching counterevidence...', duration: 3000 },
  { message: 'Formulating counterarguments...', duration: 2500 },
  { message: 'Synthesizing response...', duration: 2000 },
] as const;

// Varied error messages for less robotic feel
const ERROR_MESSAGES = [
  "I'm having trouble thinking right now. Let me try again...",
  'My counterargument engine hit a snag. One more attempt?',
  'Connection hiccup. Want me to retry that analysis?',
  "Something went wrong on my end. I'll give it another shot.",
] as const;

// Expanded suggested prompts with icons and categories for better engagement
const SUGGESTED_PROMPTS = [
  // Popular debates
  {
    label: 'Nuclear energy',
    prompt: 'Nuclear energy is too dangerous',
    icon: '⚡',
    category: 'Energy',
  },
  { label: 'College ROI', prompt: 'College is always worth it', icon: '🎓', category: 'Education' },
  { label: 'AI & Jobs', prompt: 'AI will cause mass unemployment', icon: '🤖', category: 'Tech' },
  {
    label: 'Plant-based diet',
    prompt: 'You need meat to be healthy',
    icon: '🥗',
    category: 'Health',
  },
  // Economic/Policy
  {
    label: 'Remote work',
    prompt: 'Remote work hurts productivity',
    icon: '💻',
    category: 'Work',
  },
  {
    label: 'Minimum wage',
    prompt: 'Raising minimum wage kills jobs',
    icon: '💵',
    category: 'Economics',
  },
  {
    label: 'UBI',
    prompt: 'Universal basic income would make people lazy',
    icon: '💰',
    category: 'Policy',
  },
  {
    label: 'Crypto',
    prompt: 'Cryptocurrency is just a scam',
    icon: '₿',
    category: 'Finance',
  },
  // Social/Health
  {
    label: 'Social media',
    prompt: 'Social media is destroying mental health',
    icon: '📱',
    category: 'Society',
  },
  {
    label: 'Gun control',
    prompt: 'Stricter gun laws reduce violence',
    icon: '🔫',
    category: 'Policy',
  },
  {
    label: 'Immigration',
    prompt: 'Immigration hurts the economy',
    icon: '🌍',
    category: 'Society',
  },
  {
    label: 'Drug policy',
    prompt: 'Drug legalization increases addiction',
    icon: '💊',
    category: 'Policy',
  },
  // Technology/Environment
  {
    label: 'Electric vehicles',
    prompt: "Electric vehicles aren't actually better for the environment",
    icon: '🚗',
    category: 'Environment',
  },
  {
    label: 'Space funding',
    prompt: 'Space exploration is a waste of money',
    icon: '🚀',
    category: 'Science',
  },
  {
    label: 'Climate action',
    prompt: 'Climate change action hurts the economy',
    icon: '🌡️',
    category: 'Environment',
  },
  {
    label: 'Lab-grown meat',
    prompt: 'Lab-grown meat is unnatural and unsafe',
    icon: '🧬',
    category: 'Science',
  },
  // Education/Work
  {
    label: '4-day workweek',
    prompt: "A 4-day workweek wouldn't work",
    icon: '📅',
    category: 'Work',
  },
  {
    label: 'School choice',
    prompt: 'School vouchers hurt public education',
    icon: '🏫',
    category: 'Education',
  },
  {
    label: 'Standardized tests',
    prompt: 'Standardized testing is harmful',
    icon: '📝',
    category: 'Education',
  },
  {
    label: 'Gig economy',
    prompt: 'The gig economy exploits workers',
    icon: '🚚',
    category: 'Work',
  },
  // Healthcare/Housing
  {
    label: 'Healthcare',
    prompt: 'Universal healthcare would be worse',
    icon: '🏥',
    category: 'Health',
  },
  {
    label: 'Housing',
    prompt: 'Zoning laws protect neighborhoods',
    icon: '🏘️',
    category: 'Housing',
  },
  {
    label: 'Abortion',
    prompt: 'Abortion restrictions protect life',
    icon: '👶',
    category: 'Policy',
  },
  {
    label: 'Social regulation',
    prompt: 'Social media needs government regulation',
    icon: '⚖️',
    category: 'Policy',
  },
] as const;

// Animation variants for Framer Motion
// Enter: larger movement (y: 20), with blur for polish
// Exit: subtler movement (y: -10), consistent vertical direction
const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, scale: 0.99, filter: 'blur(4px)' },
};

const promptVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.02, y: -2 },
  tap: { scale: 0.98 },
};

interface ChatInterfaceProps {
  readonly initialMessage?: string | null;
}

export default function ChatInterface({ initialMessage }: Readonly<ChatInterfaceProps>) {
  // Sidebar and conversation state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Conversation hooks
  const { createConversation, addMessage: addMessageToDB } = useConversationOperations();
  const { conversation: currentConversation } = useConversation(currentConversationId || '');
  useConversationTracking(currentConversationId);

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = loadConversation();
      if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    } catch (error) {
      console.error('Failed to load conversation:', error);
      clearConversation();
    }
    return [
      {
        id: generateId(),
        role: 'assistant',
        content:
          "I'm ContradictMe — an AI designed to challenge your beliefs with the strongest possible counterarguments.\n\nTell me something you believe strongly. I'll present research-backed opposing perspectives, not to change your mind, but to help you understand the full picture.",
        timestamp: Date.now(),
      },
    ];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitial = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>(messages);
  const loadingPhaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const userMessages = useMemo(
    () => messages.filter((message) => message.role === 'user'),
    [messages]
  );
  const hasUserMessages = userMessages.length > 0;

  // Get last assistant message for follow-up suggestions
  const lastAssistantMessage = useMemo(() => {
    const assistantMessages = messages.filter((msg) => msg.role === 'assistant');
    return assistantMessages.at(-1);
  }, [messages]);

  // Check if we should show follow-up suggestions
  const shouldShowFollowUps = useMemo(() => {
    return (
      hasUserMessages &&
      !isLoading &&
      !isStreaming &&
      lastAssistantMessage &&
      lastAssistantMessage.content.length > 0 &&
      messages.at(-1)?.role === 'assistant'
    );
  }, [hasUserMessages, isLoading, isStreaming, lastAssistantMessage, messages]);

  // Progress through loading phases for better perceived performance
  useEffect(() => {
    if (isLoading) {
      setLoadingPhase(0);
      let currentPhase = 0;

      const advancePhase = () => {
        if (currentPhase < LOADING_PHASES.length - 1) {
          currentPhase++;
          setLoadingPhase(currentPhase);
          loadingPhaseTimerRef.current = setTimeout(
            advancePhase,
            LOADING_PHASES[currentPhase].duration
          );
        }
      };

      loadingPhaseTimerRef.current = setTimeout(advancePhase, LOADING_PHASES[0].duration);

      return () => {
        if (loadingPhaseTimerRef.current) {
          clearTimeout(loadingPhaseTimerRef.current);
        }
      };
    }
  }, [isLoading]);

  // Get a random error message for variety
  const getRandomErrorMessage = useCallback(() => {
    return ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-save to both localStorage (backward compat) and IndexedDB
  useEffect(() => {
    if (messages.length > 1) {
      // Save to localStorage for backward compatibility
      const timer = setTimeout(() => saveConversation(messages), 300);

      // Save to IndexedDB
      const saveToDb = async () => {
        try {
          // Helper to convert Message to ConversationMessage
          const convertMessage = (msg: Message) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            arguments: msg.arguments?.map((arg) => ({
              id: arg.objectID,
              mainClaim: arg.mainClaim,
              evidence: arg.evidence,
              sources: [
                {
                  title: arg.sourceMetadata.title,
                  url: arg.sourceMetadata.url || '',
                  credibility: arg.sourceCredibility,
                },
              ],
              qualityScore: arg.qualityScore,
              domain: arg.metadata.domain,
              createdAt: Date.now(),
            })),
          });

          // Create conversation on first user message
          if (!currentConversationId && messages.some((m) => m.role === 'user')) {
            const firstUserMessage = messages.find((m) => m.role === 'user');
            if (firstUserMessage) {
              const newConversation = await createConversation(
                firstUserMessage.content.slice(0, 100)
              );
              if (newConversation) {
                setCurrentConversationId(newConversation.id);
                // Save all messages to the new conversation
                for (const msg of messages) {
                  await addMessageToDB(newConversation.id, convertMessage(msg));
                }
              }
            }
          } else if (currentConversationId) {
            // Add the latest message to existing conversation
            const latestMessage = messages.at(-1);
            if (latestMessage) {
              await addMessageToDB(currentConversationId, convertMessage(latestMessage));
            }
          }
        } catch (error) {
          console.error('Failed to save to IndexedDB:', error);
        }
      };

      saveToDb();
      return () => clearTimeout(timer);
    }
  }, [messages, currentConversationId, createConversation, addMessageToDB]);

  // Celebration confetti on first successful response
  useEffect(() => {
    // Check if we have exactly 2 messages (welcome + first user) + first assistant response
    const userMsgs = messages.filter((m) => m.role === 'user');
    const assistantMsgs = messages.filter((m) => m.role === 'assistant');

    // First real AI response (after welcome message and first user message)
    if (
      userMsgs.length === 1 &&
      assistantMsgs.length === 2 &&
      !isLoading &&
      !isStreaming &&
      messages.at(-1)?.role === 'assistant'
    ) {
      // Check for reduced motion preference before triggering confetti
      const prefersReducedMotion = globalThis.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (prefersReducedMotion) {
        return; // Skip confetti for users who prefer reduced motion
      }

      // Trigger confetti celebration - dynamically import to reduce initial bundle
      const timer = setTimeout(async () => {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7C3AED', '#0D9A9B', '#4DD4CF', '#A78BFA'],
        });
      }, 500); // Small delay so confetti appears after message is visible

      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, isStreaming]);

  const handleSendMessage = useCallback(
    async (content: string, signal?: AbortSignal) => {
      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Prior turns, captured before this turn's messages are added
      const history = trimHistory(messagesRef.current);

      // Add user message
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      // Create placeholder assistant message for streaming
      const assistantMessageId = generateId();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      setStreamingMessageId(assistantMessageId);
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            conversationId: generateId(),
            history,
            stream: true,
          }),
          signal: signal || controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        // Check if response is streaming (SSE)
        const contentType = response.headers?.get?.('content-type') || '';

        if (contentType.includes('text/event-stream') && response.body) {
          // Handle streaming response
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let streamedContent = '';
          let hasStartedStreaming = false;
          let streamBuffer = '';

          const applyStreamChunk = (rawLine: string) => {
            if (!rawLine.startsWith('data:')) return;
            const data = rawLine.slice(5).trimStart();
            if (!data || data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data) as {
                text?: string;
                delta?: string;
                textDelta?: string;
              };
              const nextText = parsed.text || parsed.delta || parsed.textDelta;
              if (!nextText) return;

              // Start streaming mode on first content
              if (!hasStartedStreaming) {
                hasStartedStreaming = true;
                setIsStreaming(true);
                setIsLoading(false); // Hide loading phases once content arrives
              }

              streamedContent += nextText;
              // Update the message content incrementally
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId ? { ...msg, content: streamedContent } : msg
                )
              );
            } catch {
              // Skip unparseable data
            }
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            streamBuffer += decoder.decode(value, { stream: true });
            let lineBreakIndex = streamBuffer.indexOf('\n');

            while (lineBreakIndex >= 0) {
              const line = streamBuffer.slice(0, lineBreakIndex).replace(/\r$/, '');
              applyStreamChunk(line);
              streamBuffer = streamBuffer.slice(lineBreakIndex + 1);
              lineBreakIndex = streamBuffer.indexOf('\n');
            }
          }

          const finalText = decoder.decode();
          if (finalText) streamBuffer += finalText;
          if (streamBuffer.trim()) {
            applyStreamChunk(streamBuffer.replace(/\r$/, ''));
          }

          // Finalize the message
          setIsStreaming(false);
          setStreamingMessageId(null);
          if (!streamedContent) {
            streamedContent = 'No response received from the agent.';
          }
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: streamedContent } : msg
            )
          );
        } else {
          // Handle non-streaming JSON response (fallback)
          const data = await response.json();
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: data.message, arguments: data.arguments }
                : msg
            )
          );
        }
      } catch (err) {
        // Don't show error if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          // Remove the empty assistant message on abort
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
          setIsStreaming(false);
          setStreamingMessageId(null);
          return;
        }
        console.error('Error sending message:', err);
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
        setError(errorMessage);

        // Update the placeholder message with error content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: getRandomErrorMessage() } : msg
          )
        );
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingMessageId(null);
        abortControllerRef.current = null;
      }
    },
    [getRandomErrorMessage]
  );

  // Auto-send initial message from URL
  useEffect(() => {
    if (initialMessage && !hasProcessedInitial.current) {
      hasProcessedInitial.current = true;
      // Don't abort on cleanup - we want the request to complete even if the effect re-runs
      // The handleSendMessage already handles aborting previous in-flight requests
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, handleSendMessage]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Load conversation from sidebar
  const handleSelectConversation = async (conversationId: string) => {
    try {
      const conversation = await db.conversations.get(conversationId);
      if (conversation) {
        setCurrentConversationId(conversationId);

        // Convert ConversationMessage to Message
        const convertedMessages: Message[] = conversation.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          arguments: msg.arguments?.map((arg) => ({
            objectID: arg.id,
            position: '',
            opposingBeliefs: [],
            mainClaim: arg.mainClaim,
            evidence: arg.evidence,
            supportingPoints: [],
            limitations: '',
            sourceMetadata: {
              title: arg.sources[0]?.title || '',
              authors: [],
              institution: '',
              publicationType: '',
              yearPublished: new Date(arg.createdAt).getFullYear(),
              url: arg.sources[0]?.url || '',
            },
            qualityScore: arg.qualityScore,
            sourceCredibility: arg.sources[0]?.credibility || 0,
            evidenceStrength: arg.qualityScore,
            argumentCoherence: arg.qualityScore,
            metadata: {
              argumentType: 'empirical' as const,
              evidenceType: '',
              domain: arg.domain || '',
              subDomain: '',
              strength: 'moderate' as const,
              tags: [],
              createdAt: new Date(arg.createdAt).toISOString(),
              lastUpdated: new Date(arg.createdAt).toISOString(),
              reviewStatus: '',
            },
          })),
        }));

        setMessages(convertedMessages);
        setIsSidebarOpen(false);
        toast.success('Conversation loaded');
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  // Start new conversation
  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content:
          "I'm ContradictMe — an AI designed to challenge your beliefs with the strongest possible counterarguments.\n\nTell me something you believe strongly. I'll present research-backed opposing perspectives, not to change your mind, but to help you understand the full picture.",
        timestamp: Date.now(),
      },
    ]);
    setIsSidebarOpen(false);
    toast.success('New conversation started');
  };

  return (
    <>
      {/* Conversation History Sidebar */}
      <ConversationHistorySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      {/* Share Modal */}
      {currentConversationId && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          conversationId={currentConversationId}
          conversationTitle={currentConversation?.title || 'Conversation'}
        />
      )}

      <div className="flex flex-col h-screen">
        {/* Header with sidebar toggle, theme toggle, and share button */}
        <div className="border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle conversation history"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {currentConversationId && hasUserMessages && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Share conversation"
              >
                <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>
        </div>
        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-6 space-y-6 min-h-0"
          role="log"
          aria-live="polite"
          aria-label="Chat conversation"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <m.div
                key={message.id}
                variants={messageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  duration: 0.3,
                  delay: index === messages.length - 1 ? 0.1 : 0,
                  ease: [0.4, 0, 0.2, 1],
                }}
                layout
              >
                <ChatMessage
                  message={message}
                  isStreaming={isStreaming && message.id === streamingMessageId}
                />
              </m.div>
            ))}
          </AnimatePresence>
          {isLoading && !isStreaming && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EnhancedThinkingIndicator
                phase={loadingPhase}
                message={LOADING_PHASES[loadingPhase].message}
                totalPhases={LOADING_PHASES.length}
              />
            </m.div>
          )}

          {/* Error display */}
          {error && !isLoading && (
            <div className="flex justify-center animate-slide-up">
              <div
                className="bg-red-50/90 dark:bg-red-950/50 backdrop-blur-sm border border-red-200 dark:border-red-800/50 rounded-2xl px-5 py-4 shadow-sm max-w-md"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl flex-shrink-0" aria-hidden="true">
                    ⚠️
                  </span>
                  <div>
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-1">
                      Connection Error
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        const lastUserMessage = userMessages.at(-1);
                        if (lastUserMessage) handleSendMessage(lastUserMessage.content);
                      }}
                      className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                      aria-label="Retry sending last message"
                    >
                      Retry →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up suggestions */}
          {shouldShowFollowUps && lastAssistantMessage && (
            <div className="flex justify-start px-4">
              <FollowUpSuggestions
                conversationContext={messages
                  .slice(-4)
                  .map((m) => m.content)
                  .join(' ')}
                lastAssistantMessage={lastAssistantMessage.content}
                onSelectQuestion={handleSendMessage}
                isVisible={shouldShowFollowUps}
              />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (only show if no user messages yet) */}
        {!hasUserMessages && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg" aria-hidden="true">
                💡
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                Popular beliefs to challenge
              </p>
            </div>
            <m.div
              className="flex flex-wrap gap-2 mb-4 max-h-[180px] overflow-y-auto pr-2 scrollbar-thin"
              role="group"
              aria-label="Suggested topics to challenge"
              initial="initial"
              animate="animate"
              variants={{
                animate: {
                  transition: {
                    staggerChildren: 0.03,
                  },
                },
              }}
            >
              {SUGGESTED_PROMPTS.map((item, index) => (
                <m.button
                  key={item.label}
                  onClick={() => handleSuggestedPrompt(item.prompt)}
                  className="group px-4 py-2.5 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-900/60 backdrop-blur-md border border-gray-200/60 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:from-violet-50 hover:to-white dark:hover:from-violet-950/30 dark:hover:to-slate-800 hover:border-violet-300 dark:hover:border-violet-500/50 hover:shadow-md hover:shadow-violet-200/50 dark:hover:shadow-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-all flex items-center gap-2"
                  aria-label={`${item.category}: ${item.label}`}
                  variants={promptVariants}
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <span
                    className="text-base transition-transform group-hover:scale-110"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </m.button>
              ))}
            </m.div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 relative z-10">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} error={error} />
        </div>
      </div>
    </>
  );
}
