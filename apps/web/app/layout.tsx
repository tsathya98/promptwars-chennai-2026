import './global.css';

export const metadata = {
  title: 'IBUKI Circle — Recovery & Prevention Platform',
  description: 'Zero-typing crisis intervention and caregiver support for individuals navigating substance use disorders.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
