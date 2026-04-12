import { PostHog } from 'posthog-node';

// Singleton PostHog server client
let posthogInstance: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  if (typeof window !== 'undefined') {
    // Don't initialize on client side
    return null;
  }

  if (posthogInstance) {
    return posthogInstance;
  }

  const apiKey = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog: Missing API key. Server-side tracking disabled.');
    }
    return null;
  }

  posthogInstance = new PostHog(apiKey, {
    host: host || 'https://us.i.posthog.com',
    flushAt: 1, // Flush immediately for serverless
    flushInterval: 0,
  });

  return posthogInstance;
}

// Flush pending events (call before response ends)
export async function flushPostHog(): Promise<void> {
  const posthog = getPostHogServer();
  if (posthog) {
    await posthog.flush();
  }
}

// Shutdown PostHog (for cleanup)
export async function shutdownPostHog(): Promise<void> {
  if (posthogInstance) {
    await posthogInstance.shutdown();
    posthogInstance = null;
  }
}

// Track an event with automatic flushing for serverless
export async function trackServerEvent({
  distinctId,
  event,
  properties,
}: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}): Promise<void> {
  const posthog = getPostHogServer();
  if (!posthog) return;

  posthog.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      $lib: 'posthog-node',
      environment: process.env.NODE_ENV,
    },
  });

  // Flush immediately for serverless environments
  await posthog.flush();
}
