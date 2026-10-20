import { ImageResponse } from 'next/og';

// Static: rendered once at build time and served from the CDN. The edge runtime made
// every request run ImageResponse live, so one slow render could hang until timeout.
export const dynamic = 'force-static';
export const revalidate = false;

export const alt = 'ContradictMe - An AI that disagrees with you';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        position: 'relative',
      }}
    >
      {/* Gradient accent at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '8px',
          background: 'linear-gradient(90deg, #0d9488 0%, #06b6d4 100%)',
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 100px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '80px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '32px',
            maxWidth: '1000px',
          }}
        >
          An AI that disagrees with you
        </h1>

        <p
          style={{
            fontSize: '36px',
            color: '#cbd5e1',
            lineHeight: 1.5,
            maxWidth: '800px',
            marginBottom: '48px',
          }}
        >
          Challenge your beliefs with research-backed counterarguments
        </p>

        {/* Badge/CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '20px 40px',
            background: 'linear-gradient(90deg, #0d9488 0%, #06b6d4 100%)',
            borderRadius: '16px',
            fontSize: '28px',
            fontWeight: 600,
            color: '#ffffff',
            boxShadow: '0 20px 40px rgba(13, 148, 136, 0.3)',
          }}
        >
          Start Challenging →
        </div>
      </div>

      {/* Bottom branding */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '24px',
          color: '#64748b',
        }}
      >
        ContradictMe
      </div>
    </div>,
    {
      ...size,
    }
  );
}
