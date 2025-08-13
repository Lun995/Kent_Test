"use client";
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { GlobalContextProvider } from '../context/GlobalContext';
import { mantineTheme } from '../lib/mantine-theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={mantineTheme}>
          <GlobalContextProvider>
            {children}
          </GlobalContextProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
