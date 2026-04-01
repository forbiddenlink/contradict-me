import { Langfuse } from 'langfuse';

// Singleton Langfuse client
let langfuseInstance: Langfuse | null = null;

export function getLangfuse(): Langfuse | null {
  if (typeof window !== 'undefined') {
    // Don't initialize on client side
    return null;
  }

  if (langfuseInstance) {
    return langfuseInstance;
  }

  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const baseUrl = process.env.LANGFUSE_BASE_URL;

  if (!secretKey || !publicKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Langfuse: Missing LANGFUSE_SECRET_KEY or LANGFUSE_PUBLIC_KEY. Tracing disabled.'
      );
    }
    return null;
  }

  langfuseInstance = new Langfuse({
    secretKey,
    publicKey,
    baseUrl: baseUrl || 'https://cloud.langfuse.com',
    flushAt: 1, // Flush immediately for serverless
    flushInterval: 0,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
  });

  return langfuseInstance;
}

// Flush pending events (call before response ends)
export async function flushLangfuse(): Promise<void> {
  const langfuse = getLangfuse();
  if (langfuse) {
    await langfuse.flushAsync();
  }
}

// Shutdown Langfuse (for cleanup)
export async function shutdownLangfuse(): Promise<void> {
  if (langfuseInstance) {
    await langfuseInstance.shutdownAsync();
    langfuseInstance = null;
  }
}

export async function traceGeneration<T>({
  name,
  model,
  input,
  fn,
  metadata,
  userId,
  sessionId,
  tags,
}: {
  name: string;
  model: string;
  input: unknown;
  fn: () => Promise<T>;
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  tags?: string[];
}): Promise<T> {
  const lf = getLangfuse();
  if (!lf) return fn();

  const trace = lf.trace({ name, userId, sessionId, tags });
  const generation = trace.generation({ name, model, input, metadata });

  try {
    const result = await fn();
    generation.end({ output: result });
    await lf.flushAsync();
    return result;
  } catch (error) {
    generation.end({ output: null, level: 'ERROR', statusMessage: String(error) });
    await lf.flushAsync();
    throw error;
  }
}
