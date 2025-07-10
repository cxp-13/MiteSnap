import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MiteSnap - AI-Powered Dust Mite Detection',
    short_name: 'MiteSnap',
    description: 'Track dust mites on your bedding with AI analysis and weather data. Get smart drying recommendations and community help.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    categories: ['health', 'lifestyle', 'productivity'],
    icons: [
      {
        src: '/favicon.png',
        sizes: '16x16',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/favicon.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    screenshots: [
      {
        src: '/logo.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'MiteSnap Dashboard - Wide View'
      },
      {
        src: '/logo.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'MiteSnap Mobile Interface'
      }
    ]
  }
}