import { LangfuseSpanProcessor } from '@langfuse/otel';
import {
  LangfuseOtelSpanAttributes,
  type LangfuseSpan,
  setLangfuseTracerProvider,
  startObservation,
} from '@langfuse/tracing';
import { context, ROOT_CONTEXT } from '@opentelemetry/api';
import { AlwaysOnSampler, NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

// Langfuse (SDK v6, OpenTelemetry-based).
//
// Uses an isolated tracer provider so Langfuse never touches the global OTEL
// provider that Sentry registers, and Next.js framework spans never reach Langfuse.

let langfuseProcessor: LangfuseSpanProcessor | null = null;
let langfuseProvider: NodeTracerProvider | null = null;

export function getLangfuse(): LangfuseSpanProcessor | null {
  if (typeof window !== 'undefined') {
    // Don't initialize on client side
    return null;
  }

  if (langfuseProcessor) {
    return langfuseProcessor;
  }

  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const baseUrl = process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_HOST;

  if (!secretKey || !publicKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Langfuse: Missing LANGFUSE_SECRET_KEY or LANGFUSE_PUBLIC_KEY. Tracing disabled.'
      );
    }
    return null;
  }

  langfuseProcessor = new LangfuseSpanProcessor({
    secretKey,
    publicKey,
    baseUrl: baseUrl || 'https://cloud.langfuse.com',
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    // Serverless: export each span as it ends instead of batching.
    exportMode: 'immediate',
  });
  langfuseProvider = new NodeTracerProvider({
    // Record every call; the default parent-based sampler would inherit
    // Sentry's tracesSampleRate and drop most generations.
    sampler: new AlwaysOnSampler(),
    spanProcessors: [langfuseProcessor],
  });
  setLangfuseTracerProvider(langfuseProvider);

  return langfuseProcessor;
}

/**
 * Start a root observation, which Langfuse shows as one trace. Returns undefined
 * when Langfuse is not configured. The caller must end() it, then flushLangfuse().
 *
 * Starts from ROOT_CONTEXT so Sentry's request span is never the parent. Trace-level
 * fields are set on the span directly: propagateAttributes() needs an active OTEL
 * context manager, which this isolated provider does not guarantee.
 */
export function startTrace({
  name,
  userId,
  sessionId,
  tags,
  metadata,
  input,
}: {
  name: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  input?: unknown;
}): LangfuseSpan | undefined {
  if (!getLangfuse()) return undefined;

  const span = context.with(ROOT_CONTEXT, () =>
    startObservation(name, { metadata, input }, { asType: 'span' })
  );
  const traceAttributes: Record<string, string | string[]> = {
    [LangfuseOtelSpanAttributes.TRACE_NAME]: name,
  };
  if (userId) traceAttributes[LangfuseOtelSpanAttributes.TRACE_USER_ID] = userId;
  if (sessionId) traceAttributes[LangfuseOtelSpanAttributes.TRACE_SESSION_ID] = sessionId;
  if (tags?.length) traceAttributes[LangfuseOtelSpanAttributes.TRACE_TAGS] = tags;
  span.otelSpan.setAttributes(traceAttributes);
  return span;
}

// Flush pending events (call before response ends)
export async function flushLangfuse(): Promise<void> {
  if (langfuseProcessor) {
    await langfuseProcessor.forceFlush();
  }
}

// Shutdown Langfuse (for cleanup)
export async function shutdownLangfuse(): Promise<void> {
  if (langfuseProvider) {
    await langfuseProvider.shutdown();
    langfuseProvider = null;
    langfuseProcessor = null;
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
  const trace = startTrace({ name, userId, sessionId, tags });
  if (!trace) return fn();

  const generation = trace.startObservation(
    name,
    { model, input, metadata },
    { asType: 'generation' }
  );

  try {
    const result = await fn();
    generation.update({ output: result }).end();
    trace.end();
    await flushLangfuse();
    return result;
  } catch (error) {
    generation.update({ output: null, level: 'ERROR', statusMessage: String(error) }).end();
    trace.end();
    await flushLangfuse();
    throw error;
  }
}
