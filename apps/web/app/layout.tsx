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
      <body>
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-[var(--teal)] px-4 py-2 font-bold text-[#071521] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
