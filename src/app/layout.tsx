import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Blood Donor Finder & Blood Type Recognition Platform',
  description:
    'A centralized digital ecosystem connecting voluntary blood donors, patients, and healthcare networks with AI-powered compatibility and emergency SOS dispatch.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-surface-light-secondary dark:bg-surface-dark text-slate-900 dark:text-slate-100 antialiased selection:bg-red-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
