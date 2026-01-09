'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

// 2. TonConnect Manifest (Replace with real URL in production)
// 2. TonConnect Manifest
const manifestUrl = 'https://mis-bot.vercel.app/tonconnect-manifest.json';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
}
