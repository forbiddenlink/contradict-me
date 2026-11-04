/**
 * Analytics Dashboard
 * Personal insights, conversation statistics, and engagement metrics
 */

'use client';

import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import {
  MessageCircle,
  TrendingUp,
  Calendar,
  Tag,
  Target,
  Award,
  Sparkles,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useAnalytics, useConversations } from '@/lib/hooks/useConversations';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
  color: string;
  delay?: number;
}

function StatCard({ icon, label, value, description, color, delay = 0 }: StatCardProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="relative p-6 bg-gradient-to-br from-white/90 to-white/70 dark:from-slate-800/90 dark:to-slate-900/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} shadow-sm`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
      {description && <p className="text-xs text-slate-500 dark:text-slate-500">{description}</p>}
    </m.div>
  );
}

interface TagCloudItem {
  tag: string;
  count: number;
}

function TagCloud({ tags }: { tags: TagCloudItem[] }) {
  if (tags.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-600 dark:text-slate-400">
        <p className="text-sm">No topics discussed yet. Start a conversation!</p>
      </div>
    );
  }

  const maxCount = Math.max(...tags.map((t) => t.count));

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((item, index) => {
        const size = Math.max(0.8, Math.min(1.5, item.count / maxCount));
        return (
          <m.span
            key={item.tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="px-3 py-1.5 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 rounded-lg text-violet-700 dark:text-violet-300 font-medium"
            style={{ fontSize: `${size}rem` }}
          >
            {item.tag}
            <span className="ml-1.5 text-xs opacity-60">×{item.count}</span>
          </m.span>
        );
      })}
    </div>
  );
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative p-4 rounded-xl border ${
        achievement.unlocked
          ? 'bg-slate-50 dark:bg-slate-900 border-amber-300 dark:border-amber-700/50'
          : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${
            achievement.unlocked
              ? 'bg-amber-200 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}
        >
          {achievement.icon}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
            {achievement.title}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{achievement.description}</p>
          {achievement.progress !== undefined && achievement.target && !achievement.unlocked && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Progress</span>
                <span>
                  {achievement.progress}/{achievement.target}
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <m.div
                  className="h-full bg-slate-950 dark:bg-slate-700"
                  initial={{ width: 0 }}
                  animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
}

export default function AnalyticsDashboard() {
  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { summary, isLoading: analyticsLoading } = useAnalytics(30);
  const [tagCounts, setTagCounts] = useState<TagCloudItem[]>([]);

  useEffect(() => {
    if (conversations.length > 0) {
      // Count tag occurrences
      const counts = new Map<string, number>();
      conversations.forEach((conv) => {
        conv.tags.forEach((tag) => {
          counts.set(tag, (counts.get(tag) || 0) + 1);
        });
      });

      // Sort by count and convert to array
      const sorted = Array.from(counts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 tags

      setTagCounts(sorted);
    }
  }, [conversations]);

  // Calculate achievements
  const achievements: Achievement[] = [
    {
      id: 'first-convo',
      title: 'First Steps',
      description: 'Started your first conversation',
      icon: <MessageCircle className="w-4 h-4" />,
      unlocked: conversations.length >= 1,
    },
    {
      id: 'ten-convos',
      title: 'Deep Thinker',
      description: 'Completed 10 conversations',
      icon: <Target className="w-4 h-4" />,
      unlocked: conversations.length >= 10,
      progress: Math.min(conversations.length, 10),
      target: 10,
    },
    {
      id: 'fifty-args',
      title: 'Argument Explorer',
      description: 'Viewed 50 different arguments',
      icon: <TrendingUp className="w-4 h-4" />,
      unlocked: (summary?.totalArguments || 0) >= 50,
      progress: Math.min(summary?.totalArguments || 0, 50),
      target: 50,
    },
    {
      id: 'five-topics',
      title: 'Renaissance Mind',
      description: 'Explored 5 different topics',
      icon: <Tag className="w-4 h-4" />,
      unlocked: tagCounts.length >= 5,
      progress: Math.min(tagCounts.length, 5),
      target: 5,
    },
    {
      id: 'streak-7',
      title: 'Challenge Streak',
      description: 'Used ContradictMe for 7 days',
      icon: <Award className="w-4 h-4" />,
      unlocked: false, // TODO: Implement date tracking
      progress: 1,
      target: 7,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (conversationsLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-violet-500" />
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Your Insights</h1>
          </div>
          <Link
            href="/chat"
            className="px-4 py-2 bg-slate-950 dark:bg-slate-700 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            Back to Chat
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<MessageCircle className="w-5 h-5 text-violet-700 dark:text-violet-400" />}
              label="Total Conversations"
              value={conversations.length}
              description="All-time discussions"
              color="bg-violet-100 dark:bg-violet-950/30"
              delay={0}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-teal-700 dark:text-teal-400" />}
              label="Arguments Viewed"
              value={summary?.totalArguments || 0}
              description="Counter-evidence explored"
              color="bg-teal-100 dark:bg-teal-950/30"
              delay={0.1}
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-amber-700 dark:text-amber-400" />}
              label="Avg. Duration"
              value={`${Math.round((summary?.averageDuration || 0) / 60)}m`}
              description="Per conversation"
              color="bg-amber-100 dark:bg-amber-950/30"
              delay={0.2}
            />
            <StatCard
              icon={<Award className="w-5 h-5 text-orange-700 dark:text-orange-400" />}
              label="Achievements"
              value={`${unlockedCount}/${achievements.length}`}
              description="Milestones reached"
              color="bg-orange-100 dark:bg-orange-950/30"
              delay={0.3}
            />
          </div>
        </section>

        {/* Topics Tag Cloud */}
        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Topics Explored</h2>
          </div>
          <div className="p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl">
            <TagCloud tags={tagCounts} />
          </div>
        </m.section>

        {/* Achievements */}
        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Achievements ({unlockedCount}/{achievements.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </m.section>

        {/* Empty State */}
        {conversations.length === 0 && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="inline-block p-6 bg-violet-100 dark:bg-violet-950/30 rounded-full mb-6">
              <Calendar className="w-12 h-12 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Start Your Journey
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Have your first conversation to unlock insights, track your progress, and earn
              achievements!
            </p>
            <Link
              href="/chat"
              className="inline-block px-6 py-3 bg-slate-950 dark:bg-slate-700 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              Start Chatting →
            </Link>
          </m.div>
        )}
      </main>
    </div>
  );
}
