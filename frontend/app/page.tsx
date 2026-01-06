"use client"

import { useState, useEffect } from "react"
import { Zap, Coins, Users, TrendingUp, Crown, Wallet, Loader2 } from "lucide-react"
import MinerCard from "@/components/miner-card"
import ClickableAvatar from "@/components/clickable-avatar"
import UpgradeCard from "@/components/upgrade-card"
import BottomNav from "@/components/bottom-nav"
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'

export default function Home() {
  const [coins, setCoins] = useState(0)
  const [clickPower, setClickPower] = useState(1)
  const [perSecond, setPerSecond] = useState(5)
  const [activeTab, setActiveTab] = useState<"mine" | "earn" | "upgrades" | "league">("mine")
  const [clickAnimation, setClickAnimation] = useState(false)
  const [selectedChain, setSelectedChain] = useState<"XRP" | "ETH" | "TON">("XRP")

  // Rate Limiting Config
  const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
  const RATE_LIMIT_MAX_TAPS = 1000

  // Wallet States
  const { address: ethAddress, isConnected: isEthConnected } = useAccount()
  const { connect: connectEth } = useConnect()
  const { disconnect: disconnectEth } = useDisconnect()

  const [tonConnectUI] = useTonConnectUI()
  const tonWallet = useTonWallet()

  const [isXrpConnected, setIsXrpConnected] = useState(false) // Simulated XRP state

  const [clicks, setClicks] = useState<{ id: number; x: number; y: number; value: number }[]>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    // Rate Limit Check
    const now = Date.now()
    const storedTaps = JSON.parse(localStorage.getItem('tapHistory') || '{"count": 0, "windowStart": 0}')

    let { count, windowStart } = storedTaps

    if (now - windowStart > RATE_LIMIT_WINDOW) {
      // Reset window
      windowStart = now
      count = 0
    }

    if (count >= RATE_LIMIT_MAX_TAPS) {
      alert("Rate limit reached! You can only tap 1000 times per hour.")
      return
    }

    // Update Storage
    localStorage.setItem('tapHistory', JSON.stringify({ count: count + 1, windowStart }))

    // Execute Tap
    setCoins((c) => c + clickPower)
    setClickAnimation(true)

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
    switch (selectedChain) {
      case "ETH":
        if (isEthConnected) {
          disconnectEth()
        } else {
          connectEth({ connector: injected() })
        }
        break
      case "TON":
        if (tonWallet) {
          tonConnectUI.disconnect()
        } else {
          tonConnectUI.openModal()
        }
        break
      case "XRP":
        setIsXrpConnected(!isXrpConnected) // Simulated
        break
    }
  }

  const getWalletButtonText = () => {
    switch (selectedChain) {
      case "ETH":
        if (isEthConnected && ethAddress) return `${ethAddress.slice(0, 4)}...${ethAddress.slice(-4)}`
        return "Connect ETH"
      case "TON":
        if (tonWallet && tonWallet.account.address) return `${tonWallet.account.address.slice(0, 4)}...${tonWallet.account.address.slice(-4)}`
        return "Connect TON"
      case "XRP":
        if (isXrpConnected) return "rXRP...Wallet"
        return "Connect XRP"
    }
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
              <p className="text-xs text-muted-foreground mt-2">+{perSecond.toFixed(1)}/sec</p>
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
            <h2 className="text-2xl font-black mb-6">Earn More</h2>
            <div className="space-y-4">
              <MinerCard
                name="Solo Mining"
                icon="⛏️"
                description="Earn passive coins"
                income={5}
                cost={1000}
                owned={1}
              />
              <MinerCard
                name="Bot Network"
                icon="🤖"
                description="Automated earnings"
                income={25}
                cost={5000}
                owned={0}
              />
              <MinerCard
                name="Server Farm"
                icon="🖥️"
                description="Professional mining"
                income={100}
                cost={25000}
                owned={0}
              />
              <MinerCard
                name="AI Cluster"
                icon="🧠"
                description="Next-gen power"
                income={500}
                cost={100000}
                owned={0}
              />
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
        return (
          <div className="px-4 py-6">
            <h2 className="text-2xl font-black mb-6">League</h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-300/20 border border-yellow-400/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="font-black">Grandmaster</p>
                    <p className="text-xs text-muted-foreground">Top 1%</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">You need 50M coins to reach this tier</p>
                <div className="w-full bg-background rounded h-2">
                  <div className="bg-yellow-400 h-2 rounded w-1/4" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">#1 player_0x</p>
                    <p className="text-xs text-muted-foreground">125.3M coins</p>
                  </div>
                  <span className="text-lg">🥇</span>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">#2 cryptoking</p>
                    <p className="text-xs text-muted-foreground">98.7M coins</p>
                  </div>
                  <span className="text-lg">🥈</span>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">#3 yourusername</p>
                    <p className="text-xs text-muted-foreground">45.2M coins</p>
                  </div>
                  <span className="text-lg">🥉</span>
                </div>
              </div>
            </div>
          </div>
        )
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
              <div className="flex bg-secondary/50 rounded-lg p-1">
                {(["XRP", "ETH", "TON"] as const).map((chain) => (
                  <button
                    key={chain}
                    onClick={() => setSelectedChain(chain)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${selectedChain === chain
                        ? "bg-background text-accent shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {chain}
                  </button>
                ))}
              </div>

              <button
                onClick={handleWalletConnect}
                className="h-8 px-3 bg-secondary/50 hover:bg-secondary rounded-full flex items-center gap-2 text-xs font-medium transition-colors"
              >
                <Wallet className="w-4 h-4 text-accent" />
                <span className="hidden sm:inline-block">{getWalletButtonText()}</span>
              </button>

              <Users className="w-5 h-5 text-accent" />
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
