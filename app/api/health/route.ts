import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  try {
    const memory = process.memoryUsage();
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.round(process.uptime()),
        environment: process.env.NODE_ENV,
        memory: {
          heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
          heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
        },
        responseTimeMs: Date.now() - startTime,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      }
    );
  } catch (e) {
    return NextResponse.json(
      { status: 'unhealthy', error: e instanceof Error ? e.message : 'unknown' },
      { status: 500 }
    );
  }
}
