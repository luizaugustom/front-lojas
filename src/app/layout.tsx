import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import '@/lib/api-config'; // Aplicar correções da API automaticamente

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MontShop',
  description: 'Sistema de gerenciamento de lojas completo',
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { rel: 'icon', url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
    { rel: 'icon', url: '/logo.png', sizes: '96x96', type: 'image/png' },
    { rel: 'icon', url: '/logo.png', sizes: '128x128', type: 'image/png' },
    { rel: 'icon', url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    { rel: 'icon', url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
