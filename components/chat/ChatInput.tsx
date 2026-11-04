'use client';

import { useState, useRef, useEffect } from 'react';
import { m } from 'framer-motion';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  error?: string | null;
}

const MAX_MESSAGE_LENGTH = 2000;

type ButtonState = 'idle' | 'sending' | 'success';

export default function ChatInput({ onSend, isLoading, error }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  // Update button state based on loading and error
  useEffect(() => {
    if (isLoading) {
      setButtonState('sending');
    } else if (error) {
      setButtonState('idle');
    }
  }, [isLoading, error]);

  // Handle success state separately to avoid timer being cleared
  useEffect(() => {
    if (buttonState === 'success') {
      const timer = setTimeout(() => setButtonState('idle'), 1500);
      return () => clearTimeout(timer);
    }
  }, [buttonState]);

  // Transition from sending to success when loading completes
  useEffect(() => {
    if (!isLoading && buttonState === 'sending' && !error) {
      setButtonState('success');
    }
  }, [isLoading, buttonState, error]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      setButtonState('sending');
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter to send (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Ctrl/Cmd + Enter to send (alternative)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
    // Escape to clear input
    if (e.key === 'Escape') {
      setInput('');
      inputRef.current?.blur();
    }
  };

  // Global keyboard shortcut: / to focus input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if already typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      // / to focus chat input
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="flex gap-2">
      <label htmlFor="chat-message-input" className="sr-only">
        Type your belief or message
      </label>
      <input
        ref={inputRef}
        id="chat-message-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
        onKeyDown={handleKeyDown}
        placeholder="Tell me something you believe strongly..."
        disabled={isLoading}
        autoFocus
        maxLength={MAX_MESSAGE_LENGTH}
        className="flex-1 px-5 sm:px-6 py-4 sm:py-5 rounded-2xl border-2 border-gray-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/50 outline-none transition-all placeholder:text-slate-500 dark:placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-base sm:text-lg"
        aria-label="Chat message input. Press Enter to send, Escape to clear, / to focus"
        aria-describedby={isLoading ? 'loading-status' : 'keyboard-shortcuts'}
      />
      <m.button
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        animate={{
          scale: buttonState === 'success' ? [1, 1.05, 1] : 1,
          backgroundColor:
            buttonState === 'success'
              ? '#10B981'
              : buttonState === 'sending'
                ? '#1F1F1F'
                : undefined,
        }}
        transition={{
          scale: { duration: 0.4, times: [0, 0.5, 1] },
          backgroundColor: { duration: 0.3 },
        }}
        className="relative overflow-hidden px-6 sm:px-8 py-4 sm:py-5 bg-slate-950 dark:bg-slate-700 text-white rounded-2xl font-semibold text-sm sm:text-base transition-all hover:shadow-lg hover:shadow-teal-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        aria-label={
          buttonState === 'success'
            ? 'Message sent!'
            : isLoading
              ? 'Sending message...'
              : 'Challenge Me'
        }
      >
        {buttonState === 'sending' && (
          <m.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="absolute inset-0 bg-teal-700/30"
          />
        )}
        <span className="relative z-10">
          {buttonState === 'success' ? '✓ Sent' : 'Challenge Me'}
        </span>
      </m.button>
      {isLoading && (
        <span id="loading-status" className="sr-only" role="status" aria-live="polite">
          Sending message, please wait...
        </span>
      )}
      <span id="keyboard-shortcuts" className="sr-only">
        Press Enter to send message, Escape to clear input, or forward slash to focus from anywhere
      </span>
    </div>
  );
}
