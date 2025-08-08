"use client";
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { GlobalContextProvider } from '../context/GlobalContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <GlobalContextProvider>
            {children}
          </GlobalContextProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
