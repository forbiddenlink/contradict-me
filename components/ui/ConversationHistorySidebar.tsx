/**
 * Conversation History Sidebar
 * Shows all saved conversations with search and grouping
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Bookmark,
  MoreVertical,
  Trash2,
  Edit2,
  Download,
  Copy,
  Sparkles,
} from 'lucide-react';
import {
  useConversations,
  useConversationSearch,
  useConversationOperations,
  useConversationExport,
} from '@/lib/hooks/useConversations';
import type { Conversation } from '@/lib/db';
import { toast } from 'react-hot-toast';
import { Button } from './button';

interface ConversationHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export function ConversationHistorySidebar({
  isOpen,
  onClose,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationHistorySidebarProps) {
  const [searchMode, setSearchMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Refs for focus management
  const sidebarRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const { conversations, grouped, isLoading } = useConversations();
  const { query, setQuery, results, isSearching } = useConversationSearch();
  const { deleteConversation, toggleBookmark, updateTitle } = useConversationOperations();
  const { exportAsJSON, exportAsMarkdown, copyAsText } = useConversationExport();

  const displayConversations = searchMode && query ? results : conversations;

  // Store the element that triggered the sidebar
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

  // Handle Escape key to close sidebar
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
    if (e.key !== 'Tab' || !sidebarRef.current) return;

    const focusableElements = sidebarRef.current.querySelectorAll<HTMLElement>(
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

  const handleDelete = async (conversationId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
      await deleteConversation(conversationId);
      toast.success('Conversation deleted');
      if (conversationId === currentConversationId) {
        onNewConversation();
      }
    } catch {
      toast.error('Failed to delete conversation');
    }
    setActiveMenu(null);
  };

  const handleToggleBookmark = async (conversationId: string) => {
    try {
      const newState = await toggleBookmark(conversationId);
      toast.success(newState ? 'Bookmarked' : 'Bookmark removed');
    } catch {
      toast.error('Failed to update bookmark');
    }
    setActiveMenu(null);
  };

  const handleRename = async (conversationId: string, oldTitle: string) => {
    const newTitle = prompt('New title:', oldTitle);
    if (!newTitle || newTitle === oldTitle) return;

    try {
      await updateTitle(conversationId, newTitle);
      toast.success('Title updated');
    } catch {
      toast.error('Failed to update title');
    }
    setActiveMenu(null);
  };

  const handleExport = async (conversationId: string, format: 'json' | 'markdown') => {
    try {
      if (format === 'json') {
        await exportAsJSON(conversationId);
        toast.success('Exported as JSON');
      } else {
        await exportAsMarkdown(conversationId);
        toast.success('Exported as Markdown');
      }
    } catch {
      toast.error('Export failed');
    }
    setActiveMenu(null);
  };

  const handleCopy = async (conversationId: string) => {
    try {
      await copyAsText(conversationId);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
    setActiveMenu(null);
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Sidebar */}
          <m.aside
            ref={sidebarRef}
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sidebar-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 id="sidebar-title" className="text-lg font-semibold">
                Conversations
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchMode(!searchMode);
                    if (searchMode) setQuery('');
                  }}
                  aria-label={searchMode ? 'Close search' : 'Search conversations'}
                >
                  {searchMode ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>
                <Button
                  ref={closeButtonRef}
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="md:hidden"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search Input */}
            {searchMode && (
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Conversation Button */}
            <div className="p-4 space-y-2">
              <Button onClick={onNewConversation} className="w-full" variant="default">
                New Conversation
              </Button>
              <Button
                onClick={() => {
                  window.location.href = '/debate';
                }}
                className="w-full bg-slate-950 dark:bg-slate-700 hover:bg-slate-700"
                variant="default"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Debate Arena
              </Button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : displayConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground px-4">
                  <p className="text-sm text-center">
                    {searchMode && query
                      ? 'No conversations found'
                      : 'No conversations yet. Start chatting!'}
                  </p>
                </div>
              ) : searchMode ? (
                <ConversationList
                  conversations={displayConversations}
                  currentId={currentConversationId}
                  onSelect={onSelectConversation}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  onDelete={handleDelete}
                  onBookmark={handleToggleBookmark}
                  onRename={handleRename}
                  onExport={handleExport}
                  onCopy={handleCopy}
                />
              ) : (
                <>
                  {grouped?.today && grouped.today.length > 0 && (
                    <ConversationGroup
                      title="Today"
                      conversations={grouped.today}
                      currentId={currentConversationId}
                      onSelect={onSelectConversation}
                      activeMenu={activeMenu}
                      setActiveMenu={setActiveMenu}
                      onDelete={handleDelete}
                      onBookmark={handleToggleBookmark}
                      onRename={handleRename}
                      onExport={handleExport}
                      onCopy={handleCopy}
                    />
                  )}
                  {grouped?.yesterday && grouped.yesterday.length > 0 && (
                    <ConversationGroup
                      title="Yesterday"
                      conversations={grouped.yesterday}
                      currentId={currentConversationId}
                      onSelect={onSelectConversation}
                      activeMenu={activeMenu}
                      setActiveMenu={setActiveMenu}
                      onDelete={handleDelete}
                      onBookmark={handleToggleBookmark}
                      onRename={handleRename}
                      onExport={handleExport}
                      onCopy={handleCopy}
                    />
                  )}
                  {grouped?.thisWeek && grouped.thisWeek.length > 0 && (
                    <ConversationGroup
                      title="This Week"
                      conversations={grouped.thisWeek}
                      currentId={currentConversationId}
                      onSelect={onSelectConversation}
                      activeMenu={activeMenu}
                      setActiveMenu={setActiveMenu}
                      onDelete={handleDelete}
                      onBookmark={handleToggleBookmark}
                      onRename={handleRename}
                      onExport={handleExport}
                      onCopy={handleCopy}
                    />
                  )}
                  {grouped?.thisMonth && grouped.thisMonth.length > 0 && (
                    <ConversationGroup
                      title="This Month"
                      conversations={grouped.thisMonth}
                      currentId={currentConversationId}
                      onSelect={onSelectConversation}
                      activeMenu={activeMenu}
                      setActiveMenu={setActiveMenu}
                      onDelete={handleDelete}
                      onBookmark={handleToggleBookmark}
                      onRename={handleRename}
                      onExport={handleExport}
                      onCopy={handleCopy}
                    />
                  )}
                  {grouped?.older && grouped.older.length > 0 && (
                    <ConversationGroup
                      title="Older"
                      conversations={grouped.older}
                      currentId={currentConversationId}
                      onSelect={onSelectConversation}
                      activeMenu={activeMenu}
                      setActiveMenu={setActiveMenu}
                      onDelete={handleDelete}
                      onBookmark={handleToggleBookmark}
                      onRename={handleRename}
                      onExport={handleExport}
                      onCopy={handleCopy}
                    />
                  )}
                </>
              )}
            </div>
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
}

interface ConversationGroupProps {
  title: string;
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  activeMenu: string | null;
  setActiveMenu: (id: string | null) => void;
  onDelete: (id: string, title: string) => void;
  onBookmark: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onExport: (id: string, format: 'json' | 'markdown') => void;
  onCopy: (id: string) => void;
}

function ConversationGroup({
  title,
  conversations,
  currentId,
  onSelect,
  activeMenu,
  setActiveMenu,
  onDelete,
  onBookmark,
  onRename,
  onExport,
  onCopy,
}: ConversationGroupProps) {
  return (
    <div className="mb-4">
      <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <ConversationList
        conversations={conversations}
        currentId={currentId}
        onSelect={onSelect}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onDelete={onDelete}
        onBookmark={onBookmark}
        onRename={onRename}
        onExport={onExport}
        onCopy={onCopy}
      />
    </div>
  );
}

interface ConversationListProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  activeMenu: string | null;
  setActiveMenu: (id: string | null) => void;
  onDelete: (id: string, title: string) => void;
  onBookmark: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onExport: (id: string, format: 'json' | 'markdown') => void;
  onCopy: (id: string) => void;
}

function ConversationList({
  conversations,
  currentId,
  onSelect,
  activeMenu,
  setActiveMenu,
  onDelete,
  onBookmark,
  onRename,
  onExport,
  onCopy,
}: ConversationListProps) {
  return (
    <div className="space-y-1 px-2">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === currentId}
          onSelect={onSelect}
          isMenuOpen={activeMenu === conv.id}
          onToggleMenu={(id) => setActiveMenu(activeMenu === id ? null : id)}
          onDelete={onDelete}
          onBookmark={onBookmark}
          onRename={onRename}
          onExport={onExport}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  isMenuOpen: boolean;
  onToggleMenu: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onBookmark: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onExport: (id: string, format: 'json' | 'markdown') => void;
  onCopy: (id: string) => void;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  isMenuOpen,
  onToggleMenu,
  onDelete,
  onBookmark,
  onRename,
  onExport,
  onCopy,
}: ConversationItemProps) {
  return (
    <div className="relative group">
      <button
        onClick={() => onSelect(conversation.id)}
        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
          isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
        }`}
      >
        <div className="flex items-start gap-2">
          {conversation.isBookmarked && (
            <Bookmark className="h-4 w-4 flex-shrink-0 mt-0.5 fill-current" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{conversation.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {conversation.messageCount} messages
              </span>
              {conversation.tags.length > 0 && (
                <span className="text-xs text-muted-foreground">· {conversation.tags[0]}</span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu(conversation.id);
            }}
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </button>

      {/* Context Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-2 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-10 py-1"
          >
            <button
              onClick={() => onRename(conversation.id, conversation.title)}
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Rename
            </button>
            <button
              onClick={() => onBookmark(conversation.id)}
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
            >
              <Bookmark className="h-4 w-4" />
              {conversation.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            </button>
            <button
              onClick={() => onCopy(conversation.id)}
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy as text
            </button>
            <button
              onClick={() => onExport(conversation.id, 'markdown')}
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export as Markdown
            </button>
            <button
              onClick={() => onExport(conversation.id, 'json')}
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export as JSON
            </button>
            <hr className="my-1 border-border" />
            <button
              onClick={() => onDelete(conversation.id, conversation.title)}
              className="w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
