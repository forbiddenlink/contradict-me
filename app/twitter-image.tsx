import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Static: rendered once at build time and served from the CDN. The edge runtime made
// every request run ImageResponse live, so one slow render could hang until timeout.
export const dynamic = 'force-static';
export const revalidate = false;

export const alt = 'ContradictMe - Challenge your beliefs with AI';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const syne = await readFile(path.join(process.cwd(), 'assets', 'Syne-ExtraBold.ttf'));

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Syne',
        position: 'relative',
      }}
    >
      {/* Claim half */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '300px',
          padding: '0 80px',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ fontSize: '22px', color: '#4a4a4a', letterSpacing: '0.12em' }}>YOU SAY</div>
        <div
          style={{
            fontSize: '64px',
            fontWeight: 800,
            color: '#0b0b0c',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginTop: '12px',
          }}
        >
          An AI that disagrees with you
        </div>
      </div>

      {/* Disagreement seam */}
      <div style={{ height: '10px', width: '100%', backgroundColor: '#ff4a1c' }} />

      {/* Counter half */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          padding: '0 80px',
          backgroundColor: '#0b0b0c',
        }}
      >
        <div style={{ fontSize: '22px', color: '#ff4a1c', letterSpacing: '0.12em' }}>COUNTER</div>
        <div
          style={{
            fontSize: '40px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginTop: '12px',
            maxWidth: '980px',
          }}
        >
          Challenge your beliefs with research-backed counterarguments
        </div>
        <div style={{ fontSize: '24px', color: '#a3a3a3', marginTop: '20px' }}>ContradictMe</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: 'Syne', data: syne, weight: 800, style: 'normal' }],
    }
  );
}
