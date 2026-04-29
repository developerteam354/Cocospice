import type { Metadata } from 'next';
import ReduxProvider from '@/store/ReduxProvider';
import AuthInitializer from '@/store/AuthInitializer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Cocospice Admin Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthInitializer />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
