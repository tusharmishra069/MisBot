'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Coins, TrendingUp, Pickaxe, User, Rocket, Crown, Wallet } from 'lucide-react';

type Chain = 'ETH' | 'XRP' | 'TON';

export default function HomeContent() {
    const { user, webApp, initData } = useTelegram();
    const [points, setPoints] = useState(0);
    const [energy, setEnergy] = useState(1000);
    const [chain, setChain] = useState<Chain>('ETH');
    const [xrpAddress, setXrpAddress] = useState('');
    const [activeTab, setActiveTab] = useState('mine');
    const [showWalletModal, setShowWalletModal] = useState(false);

    const handleLinkWallet = async (chainType: Chain, address: string) => {
        if (!address) return alert('Please enter an address');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/connect-wallet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-init-data': initData
                },
                body: JSON.stringify({ chain: chainType, address })
            });

            if (res.ok) {
                alert(`${chainType} Wallet Linked!`);
                setXrpAddress(''); // Clear input
            } else {
                alert('Failed to link wallet');
            }
        } catch (e) {
            console.error(e);
            alert('Error linking wallet');
        }
    };

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
        <main className="flex min-h-screen flex-col bg-black text-white font-sans overflow-hidden">
            {/* Top Bar */}
            <div className="flex justify-between items-center p-4 pt-6">
                <div>
                    <h1 className="text-xl font-black tracking-tighter">MISBOT</h1>
                    <p className="text-xs text-gray-500 font-medium tracking-wide">WEB3 MINING SIMULATOR</p>
                </div>
                <button
                    onClick={() => setShowWalletModal(true)}
                    className="w-10 h-10 bg-[#1c1c1e] rounded-xl flex items-center justify-center text-orange-500 hover:bg-[#2c2c2e] transition"
                >
                    <User size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-start pt-8 pb-24 relative z-10">

                {/* Balance Display */}
                <div className="flex flex-col items-center mb-8">
                    <span className="text-xs text-gray-500 font-bold tracking-widest mb-2">TOTAL COINS</span>
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-purple-500 drop-shadow-lg">
                        {points.toLocaleString()}
                    </h2>
                    <span className="text-sm text-gray-400 mt-2 font-medium">+5.0/sec</span>
                </div>

                {/* Tap Button */}
                <div className="relative mb-8">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full blur-[60px] opacity-40"></div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTap}
                        className="relative w-64 h-64 rounded-full bg-gradient-to-b from-orange-400 to-purple-600 p-1 shadow-2xl"
                    >
                        <div className="w-full h-full rounded-full bg-gradient-to-b from-[#FF8F3F] to-[#8A3FFF] border-4 border-[#ffffff20] flex items-center justify-center shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition duration-300"></div>
                            <img src="/spade.jpeg" alt="Tap" className="w-32 h-32 object-contain drop-shadow-md brightness-200 contrast-125" />
                        </div>
                    </motion.button>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <span className="text-orange-500 font-bold text-lg mb-1 drop-shadow-sm">+1 per tap</span>
                    <span className="text-gray-500 text-xs font-medium">Tap faster • Upgrade power</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 w-full px-6">
                    <div className="bg-[#1c1c1e] rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                        <Zap size={20} className="text-orange-500 mb-1" />
                        <span className="text-white font-bold text-sm tracking-wide">{energy}</span>
                        <span className="text-gray-500 text-[10px] font-bold mt-1">ENERGY</span>
                    </div>
                    <div className="bg-[#1c1c1e] rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                        <Coins size={20} className="text-yellow-500 mb-1" />
                        <span className="text-white font-bold text-sm tracking-wide">5.0</span>
                        <span className="text-gray-500 text-[10px] font-bold mt-1">PROFIT/SEC</span>
                    </div>
                    <div className="bg-[#1c1c1e] rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                        <TrendingUp size={20} className="text-green-500 mb-1" />
                        <span className="text-white font-bold text-sm tracking-wide">Lvl 1</span>
                        <span className="text-gray-500 text-[10px] font-bold mt-1">LEVEL</span>
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 pb-6 pt-2 px-6 flex justify-between z-50">
                <NavButton icon={Zap} label="Mine" active={activeTab === 'mine'} onClick={() => setActiveTab('mine')} />
                <NavButton icon={Coins} label="Earn" active={activeTab === 'earn'} onClick={() => setActiveTab('earn')} />
                <NavButton icon={Rocket} label="Boost" active={activeTab === 'boost'} onClick={() => setActiveTab('boost')} />
                <NavButton icon={Crown} label="League" active={activeTab === 'league'} onClick={() => setActiveTab('league')} />
            </div>

            {/* Wallet Modal */}
            <AnimatePresence>
                {showWalletModal && (
                    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWalletModal(false)}></div>
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-[#1c1c1e] w-full max-w-sm rounded-t-3xl p-6 relative flex flex-col gap-4 border-t border-white/10"
                        >
                            <div className="w-12 h-1 bg-gray-600 rounded-full self-center mb-4"></div>
                            <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>

                            <div className="flex bg-[#2c2c2e] p-1 rounded-xl mb-4">
                                {['ETH', 'TON', 'XRP'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setChain(c as Chain)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${chain === c ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>

                            <div className="min-h-[150px] flex flex-col items-center justify-center">
                                {chain === 'TON' && <TonConnectButton />}
                                {chain === 'ETH' && <EthWalletButton />}
                                {chain === 'XRP' && (
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            placeholder="Enter XRP Address"
                                            className="bg-black/50 border border-white/10 text-white p-3 rounded-xl w-full mb-3 focus:outline-none focus:border-orange-500 transition"
                                            value={xrpAddress}
                                            onChange={(e) => setXrpAddress(e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleLinkWallet('XRP', xrpAddress)}
                                            className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition"
                                        >
                                            Link XRP Wallet
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-1 min-w-[60px]">
            <Icon size={24} className={`transition duration-200 ${active ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500'}`} />
            <span className={`text-[10px] font-bold tracking-wide transition duration-200 ${active ? 'text-white' : 'text-gray-600'}`}>
                {label}
            </span>
        </button>
    );
}

function EthWalletButton() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    if (isConnected) {
        return (
            <button onClick={() => disconnect()} className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl font-bold border border-red-500/20">
                {address?.slice(0, 6)}...{address?.slice(-4)} (Disconnect)
            </button>
        )
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            {connectors.map((connector) => (
                <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between group transition"
                >
                    Connect {connector.name}
                    <Wallet size={16} className="text-gray-500 group-hover:text-white transition" />
                </button>
            ))}
        </div>
    )
}
