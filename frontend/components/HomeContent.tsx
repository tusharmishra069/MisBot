'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { motion } from 'framer-motion';

type Chain = 'ETH' | 'XRP' | 'TON';

export default function HomeContent() {
    const { user, webApp, initData } = useTelegram();
    const [points, setPoints] = useState(0);
    const [energy, setEnergy] = useState(1000);
    const [chain, setChain] = useState<Chain>('ETH');

    // Sync User with Backend
    useEffect(() => {
        if (initData) {
            const syncUser = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
                        method: 'GET',
                        headers: {
                            'x-telegram-init-data': initData
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setPoints(Number(data.points));
                        setEnergy(data.energy);
                        console.log('User synced:', data);
                    }
                } catch (error) {
                    console.error('Failed to sync user:', error);
                }
            };

            syncUser();
        }
    }, [initData]);

    const handleTap = async () => {
        if (energy > 0) {
            setPoints((prev) => prev + 1);
            setEnergy((prev) => prev - 1);

            if (webApp) {
                webApp.HapticFeedback.impactOccurred('medium');
            }

            // Send tap to backend
            try {
                await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tap`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-telegram-init-data': initData
                    },
                    body: JSON.stringify({ count: 1 })
                });
            } catch (error) {
                console.error('Tap sync failed:', error);
            }
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-black text-white p-4">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-semibold">{user?.username || 'User'}</span>
                </div>

                <select
                    value={chain}
                    onChange={(e) => setChain(e.target.value as Chain)}
                    className="bg-gray-800 rounded px-2 py-1 text-sm border border-gray-700"
                >
                    <option value="ETH">Ethereum (Sepolia)</option>
                    <option value="TON">TON (Testnet)</option>
                    <option value="XRP">XRP (Testnet)</option>
                </select>
            </div>

            {/* Wallet Connect Section */}
            <div className="mb-8 w-full">
                {chain === 'TON' && (
                    <div className="flex justify-center"><TonConnectButton /></div>
                )}
                {chain === 'ETH' && (
                    <EthWalletButton />
                )}
                {chain === 'XRP' && (
                    <div className="text-center text-gray-400 text-sm">
                        <input type="text" placeholder="Enter XRP Address" className="bg-gray-800 p-2 rounded w-full mb-2" />
                        <button className="bg-blue-600 px-4 py-2 rounded">Link XRP Wallet</button>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="text-4xl font-bold mb-2">{points.toLocaleString()} Coins</div>
            <div className="text-sm text-gray-400 mb-12">Energy: {energy}/1000</div>

            {/* Tap Button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleTap}
                className="w-64 h-64 rounded-full bg-gradient-to-b from-blue-600 to-blue-900 shadow-[0_0_50px_rgba(37,99,235,0.5)] flex items-center justify-center border-4 border-blue-400"
            >
                <span className="text-2xl font-bold">TAP</span>
            </motion.button>
        </main>
    );
}

function EthWalletButton() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    if (isConnected) {
        return (
            <button onClick={() => disconnect()} className="w-full bg-red-900/50 text-red-200 py-2 rounded">
                {address?.slice(0, 6)}...{address?.slice(-4)} (Disconnect)
            </button>
        )
    }

    return (
        <div className="flex gap-2 justify-center">
            {connectors.map((connector) => (
                <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
                >
                    Connect {connector.name}
                </button>
            ))}
        </div>
    )
}
