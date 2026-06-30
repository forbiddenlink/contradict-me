/**
 * Share Modal
 * Share conversations via native share API, copy link, or social media
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, ExternalLink, Download, Check, Share2 } from 'lucide-react';
import { Button } from './button';
import { toast } from 'react-hot-toast';
import { useConversationExport } from '@/lib/hooks/useConversations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationTitle: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  conversationId,
  conversationTitle,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { exportAsJSON, exportAsMarkdown, copyAsText } = useConversationExport();

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Store the element that triggered the modal
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus first focusable element on open, restore focus on close
  useEffect(() => {
    if (isOpen) {
      // Focus the close button as the first focusable element
      closeButtonRef.current?.focus();
    } else if (triggerRef.current) {
      // Return focus to trigger element on close
      triggerRef.current.focus();
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap - cycle through focusable elements
  const handleFocusTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab: if on first element, go to last
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: if on last element, go to first
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen, handleFocusTrap]);

  // Check if native share is supported
  const isShareSupported =
    typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'share' in navigator;

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/chat?conversation=${conversationId}`;
  const twitterText = `Check out this debate on ContradictMe: "${conversationTitle}"`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (!isShareSupported) {
      toast.error('Sharing not supported on this device');
      return;
    }

    try {
      await navigator.share({
        title: conversationTitle,
        text: `Check out this debate on ContradictMe: "${conversationTitle}"`,
        url: shareUrl,
      });
      toast.success('Shared successfully!');
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('Failed to share');
      }
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      twitterText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleCopyText = async () => {
    try {
      await copyAsText(conversationId);
      toast.success('Conversation copied as text!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleExportMarkdown = async () => {
    try {
      await exportAsMarkdown(conversationId);
      toast.success('Exported as Markdown!');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleExportJSON = async () => {
    try {
      await exportAsJSON(conversationId);
      toast.success('Exported as JSON!');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-modal-title"
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                <h2
                  id="share-modal-title"
                  className="text-xl font-semibold text-slate-900 dark:text-slate-100"
                >
                  Share Conversation
                </h2>
                <Button
                  ref={closeButtonRef}
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Title */}
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Conversation:</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {conversationTitle}
                  </p>
                </div>

                {/* Share Options */}
                <div className="space-y-3">
                  {/* Native Share (mobile) */}
                  {isShareSupported && (
                    <Button
                      onClick={handleNativeShare}
                      className="w-full justify-start gap-3"
                      variant="outline"
                    >
                      <Share2 className="h-5 w-5" />
                      Share via...
                    </Button>
                  )}

                  {/* Copy Link */}
                  <Button
                    onClick={handleCopyLink}
                    className="w-full justify-start gap-3"
                    variant="outline"
                  >
                    {copied ? (
                      <>
                        <Check className="h-5 w-5 text-green-600" />
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-5 w-5" />
                        Copy Link
                      </>
                    )}
                  </Button>

                  {/* Twitter */}
                  <Button
                    onClick={handleTwitterShare}
                    className="w-full justify-start gap-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Share on Twitter/X
                  </Button>

                  {/* Divider */}
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
                        Export
                      </span>
                    </div>
                  </div>

                  {/* Copy as Text */}
                  <Button
                    onClick={handleCopyText}
                    className="w-full justify-start gap-3"
                    variant="outline"
                  >
                    <LinkIcon className="h-5 w-5" />
                    Copy as Text
                  </Button>

                  {/* Export Markdown */}
                  <Button
                    onClick={handleExportMarkdown}
                    className="w-full justify-start gap-3"
                    variant="outline"
                  >
                    <Download className="h-5 w-5" />
                    Download as Markdown
                  </Button>

                  {/* Export JSON */}
                  <Button
                    onClick={handleExportJSON}
                    className="w-full justify-start gap-3"
                    variant="outline"
                  >
                    <Download className="h-5 w-5" />
                    Download as JSON
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0">
                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Share your intellectual journey with others
                </p>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
