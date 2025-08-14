import './globals.css'

export const metadata = {
  title: 'Udyam Registration Portal - MSME Registration',
  description: 'Official Udyam Registration Portal for Micro, Small and Medium Enterprises (MSME) Registration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
