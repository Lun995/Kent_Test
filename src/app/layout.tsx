"use client";
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { GlobalContextProvider } from '../context/GlobalContext';
import { mantineTheme } from '../lib/mantine-theme';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { usePWA } from '../hooks/usePWA';

function PWAWrapper({ children }: { children: React.ReactNode }) {
  usePWA(); // 註冊 PWA 功能
  
  return (
    <>
      {children}
      <PWAInstallPrompt />
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#228be6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KDS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#228be6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icon-32x32.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icon-16x16.svg" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#228be6" />
      </head>
      <body>
        <MantineProvider theme={mantineTheme}>
          <GlobalContextProvider>
            <PWAWrapper>
              {children}
            </PWAWrapper>
          </GlobalContextProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
