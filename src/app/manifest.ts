import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MoneyTrack Finance App',
    short_name: 'MoneyTrack',
    description: 'Master your personal finances intuitively',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#5b4fe0',
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
