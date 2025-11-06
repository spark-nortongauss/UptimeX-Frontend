import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "@/components/ui/sonner";
import ClientLayout from "@/components/ClientLayout";
import ThemeProvider from "@/components/ThemeProvider";
import IntlProvider from "@/components/IntlProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ObservOne - Monitor Your Services",
  description: "Professional uptime monitoring for your web services",
  icons: {
    icon: "/assets/favicon.ico?v=1",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/favicon.ico?v=1" sizes="any" />
        <link rel="shortcut icon" href="/assets/favicon.ico?v=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('ui-store');
                  if (stored) {
                    const parsed = JSON.parse(stored);
                    // Zustand persist stores as { state: {...}, version: 0 }
                    const theme = parsed?.state?.theme || parsed?.theme;
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else if (theme === 'light') {
                      document.documentElement.classList.remove('dark');
                    }
                  } else {
                    // Check system preference if no stored theme
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {
                  // Ignore errors
                }
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <IntlProvider>
          <ThemeProvider>
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </IntlProvider>
        <Toaster />
      </body>
    </html>
  );
}
