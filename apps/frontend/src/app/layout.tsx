import type { Metadata } from 'next';
import '../styles/globals.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'VedaAI – Assessment Creator',
  description: 'Generate exam-ready question papers with AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
