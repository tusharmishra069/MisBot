'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

//  TonConnect Manifest
//  TonConnect Manifest
const manifestUrl = process.env.NEXT_PUBLIC_TON_MANIFEST_URL || 'https://mis-bot.vercel.app/tonconnect-manifest.json';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
}
