"use client"

import { useState, useEffect, useRef } from "react"
import { Zap, Coins, Users, TrendingUp, Crown, Wallet, Loader2 } from "lucide-react"
import { toast } from "sonner"
import MinerCard from "@/components/miner-card"
import ClickableAvatar from "@/components/clickable-avatar"
import UpgradeCard from "@/components/upgrade-card"
import BottomNav from "@/components/bottom-nav"
import LeagueView from "@/components/league-view"
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'

import { useTelegram } from '@/hooks/useTelegram'

export default function Home() {
  const { user, initData } = useTelegram()

  // Dev Mode Check
  const isDev = process.env.NODE_ENV !== 'production';
  const authData = initData || (isDev ? 'dev_data' : '');

  const [coins, setCoins] = useState(0)
  const [clickPower, setClickPower] = useState(1)
  const [energy, setEnergy] = useState(1000) // Added Energy State
  const [perSecond, setPerSecond] = useState(5)
  const [activeTab, setActiveTab] = useState<"mine" | "earn" | "upgrades" | "league">("mine")
  const [clickAnimation, setClickAnimation] = useState(false)

  // Wallet States
  const [tonConnectUI] = useTonConnectUI()
  const tonWallet = useTonWallet()

  const [clicks, setClicks] = useState<{ id: number; x: number; y: number; value: number }[]>([])
  const unsavedTapsRef = useRef(0)

  // Debug state for wallet linking
  const [walletLinkStatus, setWalletLinkStatus] = useState<string>('Not attempted')
  const [walletLinkError, setWalletLinkError] = useState<string>('')

  // MISBOT Token states
  const [misbotBalance, setMisbotBalance] = useState(0)
  const [coinsToExchange, setCoinsToExchange] = useState(1000)
  const [misbotClaiming, setMisbotClaiming] = useState(false)

  // Load MISBOT balance
  useEffect(() => {
    if (tonWallet && authData) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/misbot-balance?tonAddress=${tonWallet.account.address}`, {
        headers: { 'x-telegram-init-data': authData }
      })
        .then(res => res.json())
        .then(data => setMisbotBalance(data.balance || 0))
        .catch(err => console.error('Failed to load MISBOT balance:', err));
    }
  }, [tonWallet, authData]);

  // Claim MISBOT tokens
  const claimMisbot = async () => {
    if (!tonWallet) {
      toast.error('Connect TON wallet first');
      return;
    }

    if (coins < coinsToExchange) {
      toast.error(`Need ${coinsToExchange} coins to exchange`);
      return;
    }

    setMisbotClaiming(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/claim-misbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': authData
        },
        body: JSON.stringify({
          tonAddress: tonWallet.account.address,
          coinsToExchange
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`🎉 ${data.misbotAmount} MISBOT minted!`);
        setCoins(c => c - coinsToExchange);
        setMisbotBalance(b => b + data.misbotAmount);
      } else {
        toast.error(data.error || 'Failed to claim MISBOT');
      }
    } catch (error: any) {
      toast.error('Network error: ' + error.message);
    } finally {
      setMisbotClaiming(false);
    }
  };

  // Sync User on Load
  useEffect(() => {
    if (isDev) {
      // Development mode - use mock data
      setCoins(1000);
      setEnergy(1000);
      return;
    }

    if (!authData) return;

    const loadUserData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
          headers: { 'x-telegram-init-data': authData }
        });

        if (res.ok) {
          const data = await res.json();

          if (data && typeof data.points !== 'undefined') {
            const pointsValue = Number(data.points) || 0;
            setCoins(pointsValue);
            setEnergy(Number(data.energy) || 1000);
          }
        }
      } catch (err) {
        // Silent fail in production
      }
    };

    loadUserData();
  }, [authData, isDev]);

  // Bind Wallet to Backend (optimized to prevent duplicate calls)
  const walletLinkAttemptedRef = useRef<string | null>(null);

  useEffect(() => {
    if (authData && tonWallet && tonWallet.account.address) {
      const currentAddress = tonWallet.account.address;

      // Skip if we already attempted to link this address
      if (walletLinkAttemptedRef.current === currentAddress) {
        return;
      }

      walletLinkAttemptedRef.current = currentAddress;
      setWalletLinkStatus('Linking...');

      if (isDev) {
        console.log('[Wallet] Linking:', currentAddress);
      }

      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/connect-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': authData
        },
        body: JSON.stringify({
          chain: 'TON',
          address: currentAddress
        })
      })
        .then(async res => {
          const data = await res.json();
          if (res.ok) {
            setWalletLinkStatus('✅ Linked!');
            setWalletLinkError('');
            toast.success("Wallet Connected!");
          } else {
            setWalletLinkStatus('❌ Failed');
            setWalletLinkError(data.error || 'Unknown error');
            walletLinkAttemptedRef.current = null; // Allow retry
            toast.error("Connection failed: " + (data.error || 'Unknown error'));
          }
        })
        .catch(err => {
          setWalletLinkStatus('❌ Network Error');
          setWalletLinkError(err.message);
          walletLinkAttemptedRef.current = null; // Allow retry
          console.error('[Wallet] Error:', err);
          toast.error("Network error: " + err.message);
        })
    } else {
      // Reset if wallet disconnected
      if (!tonWallet && walletLinkAttemptedRef.current) {
        walletLinkAttemptedRef.current = null;
        setWalletLinkStatus('');
      }
    }
  }, [authData, tonWallet?.account.address, isDev]);

  // Sync Taps every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const count = unsavedTapsRef.current
      if (count > 0 && authData) {
        // Reset ref immediately to avoid double counting if request is slow
        unsavedTapsRef.current = 0

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tap`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-telegram-init-data': authData
          },
          body: JSON.stringify({ count })
        })
          .then(res => {
            if (!res.ok) {
              // Restore taps if failed (simple retry logic)
              unsavedTapsRef.current += count
            }
          })
          .catch(() => {
            unsavedTapsRef.current += count
          })
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [authData])

  // Constants
  const RATE_LIMIT_WINDOW = 10000 // 10 seconds
  const RATE_LIMIT_MAX_TAPS = 200 // Max taps per window
  const COOLDOWN_DURATION = 30000 // 30 seconds (Penalty)

  // New Rate Limit State
  const [cooldownEndTime, setCooldownEndTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)

  // Window State
  const [tapsLeft, setTapsLeft] = useState(RATE_LIMIT_MAX_TAPS)
  const [windowTimer, setWindowTimer] = useState(0)

  // Timer Countdown Effect
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()

      // Cooldown Timer
      if (cooldownEndTime > 0) {
        setTimeLeft(Math.max(0, cooldownEndTime - now))
        if (now >= cooldownEndTime) setCooldownEndTime(0)
      } else {
        setTimeLeft(0)
      }

      // Window Timer
      const storedTaps = JSON.parse(localStorage.getItem('tapHistory') || '{"count": 0, "windowStart": 0}')
      const windowRemaining = Math.max(0, RATE_LIMIT_WINDOW - (now - storedTaps.windowStart))
      setWindowTimer(windowRemaining)

      if (now - storedTaps.windowStart > RATE_LIMIT_WINDOW) {
        setTapsLeft(RATE_LIMIT_MAX_TAPS)
      } else {
        setTapsLeft(Math.max(0, RATE_LIMIT_MAX_TAPS - storedTaps.count))
      }

    }, 100)
    return () => clearInterval(interval)
  }, [cooldownEndTime])


  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60)
    return `${seconds.toString().padStart(2, '0')}s`
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const now = Date.now()

    // 1. Check if Cooldown is Active
    if (now < cooldownEndTime) {
      toast.error("Cooldown Active! Please wait.", {
        description: "Mining is temporarily disabled.",
        duration: 2000
      })
      return
    }

    // 2. Load State
    let storedTaps = JSON.parse(localStorage.getItem('tapHistory') || '{"count": 0, "windowStart": 0}')
    let { count, windowStart } = storedTaps

    // 3. Check Window Expiry (Session Limit)
    if (now - windowStart > RATE_LIMIT_WINDOW) {
      if (count > 0) {
        const newCooldownEnd = now + COOLDOWN_DURATION
        setCooldownEndTime(newCooldownEnd)
        setTimeLeft(COOLDOWN_DURATION)
        localStorage.setItem('tapHistory', JSON.stringify({ count: 0, windowStart: 0 }))

        toast.warning("Mining Session Ended!", {
          description: "Cooldown started for 30s.",
          duration: 4000
        })
        return
      }
      windowStart = now
      count = 0
    }

    // 4. Check Burst Limit
    if (count >= RATE_LIMIT_MAX_TAPS) {
      const newCooldownEnd = now + COOLDOWN_DURATION
      setCooldownEndTime(newCooldownEnd)
      setTimeLeft(COOLDOWN_DURATION)
      localStorage.setItem('tapHistory', JSON.stringify({ count: 0, windowStart: 0 }))

      toast.warning("Rate Limit Reached!", {
        description: "Cooldown started for 30s.",
        duration: 4000
      })
      return
    }

    // 5. Valid Tap
    const newCount = count + 1
    localStorage.setItem('tapHistory', JSON.stringify({ count: newCount, windowStart }))

    // Immediate UI Update
    setTapsLeft(Math.max(0, RATE_LIMIT_MAX_TAPS - newCount))
    setWindowTimer(Math.max(0, RATE_LIMIT_WINDOW - (now - windowStart)))

    // Execute Tap
    setCoins((c) => c + clickPower)
    setClickAnimation(true)

    // Play Sound
    const audio = new Audio("/Fahhh - QuickSounds.com.mp3")
    audio.play()

    // Queue Tap for Sync
    unsavedTapsRef.current += 1

    // Get coordinates
    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }

    // Add click effect
    const id = Date.now()
    setClicks((prev) => [...prev, { id, x: clientX, y: clientY, value: clickPower }])

    // Cleanup click effect
    setTimeout(() => {
      setClicks((prev) => prev.filter((click) => click.id !== id))
    }, 1000)

    setTimeout(() => setClickAnimation(false), 100)
  }

  const handleWalletConnect = () => {
    if (tonWallet) {
      tonConnectUI.disconnect()
    } else {
      tonConnectUI.openModal()
    }
  }

  const getWalletButtonText = () => {
    if (tonWallet && tonWallet.account.address) return `${tonWallet.account.address.slice(0, 4)}...${tonWallet.account.address.slice(-4)}`
    return "Connect TON"
  }


  const renderContent = () => {
    switch (activeTab) {
      case "mine":
        return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 relative">
            {/* Floating Clicks */}
            {clicks.map((click) => (
              <div
                key={click.id}
                className="absolute text-4xl font-black text-white pointer-events-none animate-out fade-out slide-out-to-top-20 duration-1000 z-50"
                style={{
                  left: click.x,
                  top: click.y - 50, // Start slightly above the click
                }}
              >
                +{click.value}
              </div>
            ))}

            {/* Balance Display */}
            <div className="mb-12 text-center">
              <p className="text-sm text-muted-foreground mb-2">TOTAL COINS</p>
              <h1 className="text-5xl font-black bg-gradient-to-r from-accent via-purple-400 to-accent bg-clip-text text-transparent">
                {Math.floor(coins).toLocaleString()}
              </h1>


              {/* Rate Limit Stats */}
              {/* Rate Limit Stats */}
              {cooldownEndTime > 0 ? (
                <div className="mt-4 flex items-center justify-center gap-4 text-xs font-mono bg-red-500/20 text-red-400 py-1 px-3 rounded-full mx-auto w-fit border border-red-500/30 animate-pulse">
                  <span className="font-bold">
                    🚫 Cooldown: {formatTime(timeLeft)}
                  </span>
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-4 text-xs font-mono bg-secondary/30 py-1 px-3 rounded-full mx-auto w-fit border border-white/5">
                  <span className={tapsLeft === 0 ? "text-red-500 font-bold" : "text-green-400"}>
                    ⚡ {tapsLeft}/{RATE_LIMIT_MAX_TAPS}
                  </span>
                  <span className="text-muted-foreground border-l border-white/10 pl-4">
                    ⏳ {formatTime(windowTimer)}
                  </span>
                </div>
              )}
            </div>

            {/* Clickable Avatar */}
            <div className="mb-8">
              <ClickableAvatar onClick={handleClick} animate={clickAnimation} />
            </div>

            {/* Click Info */}
            <div className="text-center mb-8">
              <p className="text-sm font-semibold text-accent">+{clickPower.toLocaleString()} per tap</p>
              <p className="text-xs text-muted-foreground mt-1">Tap faster • Upgrade power</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <Zap className="w-4 h-4 mx-auto mb-1 text-accent" />
                <p className="text-xs font-semibold">{clickPower}x</p>
                <p className="text-xs text-muted-foreground">Power</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <Coins className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                <p className="text-xs font-semibold">{perSecond.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">/sec</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-400" />
                <p className="text-xs font-semibold">Lvl 1</p>
                <p className="text-xs text-muted-foreground">Rank</p>
              </div>
            </div>
          </div>
        )

      case "earn":
        return (
          <div className="px-4 py-6">
            <h2 className="text-2xl font-black mb-6">Earn MISBOT</h2>
            <div className="space-y-4">
              {/* MISBOT Token Exchange Card */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
                      🪙
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">MISBOT Token</h3>
                      <p className="text-xs text-muted-foreground">
                        Exchange coins for MISBOT tokens
                      </p>
                    </div>
                  </div>
                </div>

                {/* MISBOT Balance */}
                <div className="bg-black/20 rounded-lg p-3 mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Your MISBOT Balance</p>
                  <p className="text-2xl font-bold text-green-400">{misbotBalance.toFixed(2)} MIS</p>
                </div>

                {/* Exchange Input */}
                <div className="mb-3">
                  <label className="text-sm font-medium mb-2 block">Coins to Exchange</label>
                  <input
                    type="number"
                    value={coinsToExchange}
                    onChange={(e) => setCoinsToExchange(Number(e.target.value))}
                    min="1000"
                    step="1000"
                    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll receive: <span className="font-bold text-green-400">{(coinsToExchange / 1000).toFixed(1)} MISBOT</span>
                  </p>
                </div>

                {/* Claim Button */}
                <button
                  onClick={claimMisbot}
                  disabled={coins < coinsToExchange || misbotClaiming || !tonWallet}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${coins >= coinsToExchange && tonWallet && !misbotClaiming
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {misbotClaiming ? 'Minting...' : `Exchange for ${(coinsToExchange / 1000).toFixed(1)} MISBOT`}
                </button>

                {!tonWallet && (
                  <p className="text-xs text-center mt-2 text-yellow-400">
                    ⚠️ Connect TON wallet to claim
                  </p>
                )}

                {coins < coinsToExchange && tonWallet && (
                  <p className="text-xs text-center mt-2 text-yellow-400">
                    Need {coinsToExchange - coins} more coins
                  </p>
                )}
              </div>

              {/* Info Card */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-bold mb-2">💡 How it Works</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Mine coins by tapping in the game</li>
                  <li>• Exchange 1,000 coins for 1 MISBOT token</li>
                  <li>• MISBOT tokens are on TON testnet</li>
                  <li>• View your tokens in your TON wallet</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case "upgrades":
        return (
          <div className="px-4 py-6">
            <h2 className="text-2xl font-black mb-6">Power Upgrades</h2>
            <div className="space-y-4">
              <UpgradeCard
                name="Tap Boost"
                description="Increase tap power by 10%"
                cost={500}
                level={1}
                maxLevel={10}
              />
              <UpgradeCard name="Speed Demon" description="Tap 2x faster" cost={2000} level={0} maxLevel={5} />
              <UpgradeCard name="Lucky Streak" description="Random 2x multiplier" cost={5000} level={0} maxLevel={3} />
              <UpgradeCard name="Megamind" description="Passive income +100%" cost={10000} level={0} maxLevel={5} />
            </div>
          </div>
        )

      case "league":
        return <LeagueView initData={authData} />
    }
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black">MISBOT</h1>
              <p className="text-xs text-muted-foreground">Web3 Mining Simulator</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleWalletConnect}
                className="h-8 px-3 bg-secondary/50 hover:bg-secondary rounded-full flex items-center gap-2 text-xs font-medium transition-colors"
              >
                <Wallet className="w-4 h-4 text-accent" />
                <span className="text-xs">{getWalletButtonText()}</span>
              </button>

              <button
                onClick={() => window.location.href = '/profile'}
                className="h-8 w-8 bg-secondary/50 hover:bg-secondary rounded-full flex items-center justify-center transition-colors"
              >
                <Users className="w-4 h-4 text-accent" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}
