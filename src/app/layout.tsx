import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'BloodDonor Platform — Emergency Blood Matching & Donor Registry',
    template: '%s | BloodDonor Platform',
  },
  description:
    'A centralized digital ecosystem connecting voluntary blood donors, patients, and healthcare networks with real-time transfusion compatibility, GPS discovery, and emergency SOS dispatch.',
  keywords: ['blood donor', 'find blood', 'emergency blood SOS', 'blood compatibility', 'blood banks india'],
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
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
