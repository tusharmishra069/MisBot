'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode } from 'react';

// 1. Wagmi Config (Ethereum)
const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

// 2. TonConnect Manifest (Replace with real URL in production)
const manifestUrl = process.env.NEXT_PUBLIC_TON_MANIFEST_URL || 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </TonConnectUIProvider>
  );
}
