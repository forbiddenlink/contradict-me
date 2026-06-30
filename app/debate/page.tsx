'use client';

import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Heart,
  Send,
  Share2,
  Download,
  ThumbsUp,
  MessageCircle,
  Trophy,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Module-level wrapper for the impure clock. Keeping this outside the
// component keeps react-hooks/purity from flagging these event-handler-only
// calls (they run after awaited fetches, never during render).
const now = () => Date.now();

interface DebateMessage {
  id: string;
  speaker: 'logical' | 'emotional' | 'user';
  content: string;
  timestamp: number;
  round: number;
}

interface DebateState {
  topic: string;
  messages: DebateMessage[];
  currentRound: number;
  maxRounds: number;
  isActive: boolean;
  winner?: 'logical' | 'emotional' | 'tie';
  userVote?: 'logical' | 'emotional';
}

export default function DebatePage() {
  const [debateState, setDebateState] = useState<DebateState>({
    topic: '',
    messages: [],
    currentRound: 0,
    maxRounds: 5,
    isActive: false,
  });
  const [topicInput, setTopicInput] = useState('');
  const [userInterjection, setUserInterjection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [debateState.messages]);

  const startDebate = async () => {
    if (!topicInput.trim()) {
      toast.error('Please enter a debate topic');
      return;
    }

    setDebateState({
      topic: topicInput,
      messages: [],
      currentRound: 1,
      maxRounds: 5,
      isActive: true,
    });

    toast.success('Debate started! Watch the AI agents argue...');

    // Start with logical AI's opening argument
    await generateDebateRound(topicInput, [], 1, 'logical');
  };

  const generateDebateRound = async (
    topic: string,
    previousMessages: DebateMessage[],
    round: number,
    nextSpeaker: 'logical' | 'emotional'
  ) => {
    setIsGenerating(true);

    try {
      // Build context from previous messages
      const context = previousMessages
        .map((m) => `${m.speaker === 'logical' ? 'Logical Larry' : 'Emotional Emma'}: ${m.content}`)
        .join('\n\n');

      const systemPrompt =
        nextSpeaker === 'logical'
          ? `You are "Logical Larry" - a rational, evidence-based debater who values logic, data, and scientific reasoning. You make structured arguments with clear premises and conclusions. Be concise (2-3 paragraphs max).`
          : `You are "Emotional Emma" - a passionate, empathetic debater who values human stories, emotions, and moral intuitions. You connect with people's hearts and speak to values. Be concise (2-3 paragraphs max).`;

      const userPrompt =
        round === 1 && nextSpeaker === 'logical'
          ? `Make an opening argument about: ${topic}\n\nBe compelling but concise.`
          : `Continue the debate about: ${topic}\n\nPrevious arguments:\n${context}\n\nRespond to your opponent's points and strengthen your position.`;

      // Combine system prompt and user prompt into a single message
      // since the API expects { message: string } format
      const combinedMessage = `${systemPrompt}\n\n${userPrompt}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: combinedMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                // API returns {text: "..."} format
                if (data.text) {
                  fullResponse += data.text;
                } else if (data.content) {
                  fullResponse += data.content;
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      const newMessage: DebateMessage = {
        id: `${nextSpeaker}-${round}-${now()}`,
        speaker: nextSpeaker,
        content: fullResponse,
        timestamp: now(),
        round,
      };

      setDebateState((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      // After logical speaks, emotional responds (same round)
      // After emotional speaks, move to next round
      if (nextSpeaker === 'logical' && round <= 5) {
        setTimeout(() => {
          generateDebateRound(topic, [...previousMessages, newMessage], round, 'emotional');
        }, 1000);
      } else if (nextSpeaker === 'emotional' && round < 5) {
        setTimeout(() => {
          generateDebateRound(topic, [...previousMessages, newMessage], round + 1, 'logical');
        }, 1000);
      } else {
        // Debate complete
        setDebateState((prev) => ({
          ...prev,
          currentRound: round,
          isActive: false,
        }));
        toast.success('Debate complete! Cast your vote below.');
      }
    } catch (error) {
      console.error('Debate generation error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate debate response';
      toast.error(errorMessage);
      // Reset debate state on error so user can try again
      setDebateState((prev) => ({
        ...prev,
        isActive: false,
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInterjection = async () => {
    if (!userInterjection.trim() || !debateState.isActive) return;

    const interjectionMessage: DebateMessage = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: userInterjection,
      timestamp: Date.now(),
      round: debateState.currentRound,
    };

    setDebateState((prev) => ({
      ...prev,
      messages: [...prev.messages, interjectionMessage],
    }));

    setUserInterjection('');
    toast.success('Interjection added! AIs will consider it.');

    // Continue debate with user's input in context
    const nextSpeaker =
      debateState.messages[debateState.messages.length - 1]?.speaker === 'logical'
        ? 'emotional'
        : 'logical';

    await generateDebateRound(
      debateState.topic,
      [...debateState.messages, interjectionMessage],
      debateState.currentRound,
      nextSpeaker
    );
  };

  const castVote = (vote: 'logical' | 'emotional') => {
    setDebateState((prev) => ({
      ...prev,
      userVote: vote,
      winner: vote,
    }));

    const name = vote === 'logical' ? 'Logical Larry' : 'Emotional Emma';
    toast.success(`You voted for ${name}!`);
  };

  const shareDebate = async () => {
    const transcript = debateState.messages
      .map((m) => {
        const name =
          m.speaker === 'logical'
            ? 'Logical Larry'
            : m.speaker === 'emotional'
              ? 'Emotional Emma'
              : 'You';
        return `${name} (Round ${m.round}):\n${m.content}`;
      })
      .join('\n\n---\n\n');

    const shareText = `AI Debate: ${debateState.topic}\n\n${transcript}\n\nWinner: ${debateState.winner === 'logical' ? 'Logical Larry' : 'Emotional Emma'}\n\nDebate at ContradictMe`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `AI Debate: ${debateState.topic}`,
          text: shareText,
        });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Debate copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const downloadTranscript = () => {
    const transcript = debateState.messages
      .map((m) => {
        const name =
          m.speaker === 'logical'
            ? 'Logical Larry'
            : m.speaker === 'emotional'
              ? 'Emotional Emma'
              : 'User';
        return `${name} (Round ${m.round}):\n${m.content}`;
      })
      .join('\n\n---\n\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate-${debateState.topic.slice(0, 30)}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Transcript downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-3-3m0 0l-3 3m3-3v6"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-teal-600">
                  AI Debate Arena
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Watch two AIs debate any topic
                </p>
              </div>
            </div>
            {debateState.messages.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={shareDebate}
                  className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                  title="Share debate"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={downloadTranscript}
                  className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
                  title="Download transcript"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topic Input */}
        {!debateState.isActive && debateState.messages.length === 0 && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                What should the AIs debate?
              </h2>
              <textarea
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="E.g., Should universal basic income be implemented globally?"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                rows={3}
              />
              <button
                onClick={startDebate}
                disabled={!topicInput.trim()}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-teal-600 text-white font-semibold hover:from-violet-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Start Debate
              </button>
            </div>

            {/* Example Topics */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Or try these topics:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Is AI consciousness possible?',
                  'Should we colonize Mars?',
                  'Universal healthcare vs private?',
                  'Remote work vs office culture',
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setTopicInput(topic)}
                    className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </m.div>
        )}

        {/* Debate Arena */}
        {(debateState.isActive || debateState.messages.length > 0) && (
          <>
            {/* Topic Banner */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {debateState.topic}
              </h2>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Round {debateState.currentRound}/{debateState.maxRounds}
                </span>
                {!debateState.isActive && debateState.messages.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                    Complete
                  </span>
                )}
              </div>
            </div>

            {/* Debaters Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Logical Larry Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Logical Larry</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Evidence & Reason</p>
                  </div>
                </div>
                <AnimatePresence>
                  {debateState.messages
                    .filter((m) => m.speaker === 'logical')
                    .map((message, idx) => (
                      <m.div
                        key={message.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center gap-2 mb-2 text-xs text-blue-600 dark:text-blue-400">
                          <span className="font-medium">Round {message.round}</span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </m.div>
                    ))}
                </AnimatePresence>
              </div>

              {/* Emotional Emma Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-pink-100 dark:bg-pink-900/30">
                    <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Emotional Emma</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Values & Empathy</p>
                  </div>
                </div>
                <AnimatePresence>
                  {debateState.messages
                    .filter((m) => m.speaker === 'emotional')
                    .map((message, idx) => (
                      <m.div
                        key={message.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 border border-pink-200 dark:border-pink-800"
                      >
                        <div className="flex items-center gap-2 mb-2 text-xs text-pink-600 dark:text-pink-400">
                          <span className="font-medium">Round {message.round}</span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </m.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>

            {/* User Interjections */}
            {debateState.messages.filter((m) => m.speaker === 'user').length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Your Interjections
                </h3>
                <div className="space-y-2">
                  {debateState.messages
                    .filter((m) => m.speaker === 'user')
                    .map((message) => (
                      <div
                        key={message.id}
                        className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3 border border-violet-200 dark:border-violet-800"
                      >
                        <p className="text-gray-800 dark:text-gray-200 text-sm">
                          {message.content}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Interjection Input (only when debate is active) */}
            {debateState.isActive && (
              <div className="mb-8">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interject with a question or point:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userInterjection}
                      onChange={(e) => setUserInterjection(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleInterjection()}
                      placeholder="E.g., What about environmental impact?"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      onClick={handleInterjection}
                      disabled={!userInterjection.trim() || isGenerating}
                      className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Send interjection"
                      title="Send interjection"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Voting Section (only when debate is complete) */}
            {!debateState.isActive && debateState.messages.length > 0 && (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-violet-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Who won the debate?
                  </h3>
                </div>

                {!debateState.userVote ? (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => castVote('logical')}
                      className="flex items-center gap-3 px-8 py-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all shadow-lg hover:shadow-xl border-2 border-transparent hover:border-blue-500"
                    >
                      <Brain className="w-6 h-6" />
                      <span className="font-semibold">Logical Larry</span>
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => castVote('emotional')}
                      className="flex items-center gap-3 px-8 py-4 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-all shadow-lg hover:shadow-xl border-2 border-transparent hover:border-pink-500"
                    >
                      <Heart className="w-6 h-6" />
                      <span className="font-semibold">Emotional Emma</span>
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      You voted for{' '}
                      <span className="font-bold">
                        {debateState.userVote === 'logical' ? 'Logical Larry' : 'Emotional Emma'}
                      </span>
                      !
                    </p>
                    <button
                      onClick={() => setDebateState((prev) => ({ ...prev, userVote: undefined }))}
                      className="mt-4 text-sm text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Change vote
                    </button>
                  </div>
                )}
              </m.div>
            )}

            {/* Loading Indicator */}
            {isGenerating && (
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-600 border-t-transparent" />
                <span className="text-gray-600 dark:text-gray-400">AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
