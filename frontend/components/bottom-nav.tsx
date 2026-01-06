"use client"

import type React from "react"

import { Zap, Coins, Rocket, Crown } from "lucide-react"

type Tab = "mine" | "earn" | "upgrades" | "league"

interface BottomNavProps {
    activeTab: Tab
    onTabChange: (tab: Tab) => void
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: "mine", label: "Mine", icon: <Zap className="w-5 h-5" /> },
        { id: "earn", label: "Earn", icon: <Coins className="w-5 h-5" /> },
        { id: "upgrades", label: "Boost", icon: <Rocket className="w-5 h-5" /> },
        { id: "league", label: "League", icon: <Crown className="w-5 h-5" /> },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur border-t border-border">
            <div className="flex justify-around items-center h-20 px-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? "text-accent" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {tab.icon}
                        <span className="text-xs font-semibold">{tab.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    )
}
