import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #5b4fe0, #a855f7)',
          borderRadius: '22%',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: '60%', height: '60%' }}
        >
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5-1.524" />
          <path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
          <path d="M18 12h-2a2 2 0 0 0 0 4h2" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
