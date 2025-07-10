import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - MiteSnap',
  description: 'Manage your bedding health and dust mite tracking with MiteSnap dashboard.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}