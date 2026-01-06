"use client"

import { Lock } from "lucide-react"

interface MinerCardProps {
    name: string
    icon: string
    description: string
    income: number
    cost: number
    owned: number
}

export default function MinerCard({ name, icon, description, income, cost, owned }: MinerCardProps) {
    const isLocked = cost > 100000 && owned === 0

    return (
        <div
            className={`rounded-xl border p-4 transition-all ${isLocked
                    ? "bg-card/50 border-border/50 opacity-60"
                    : "bg-card border-accent/30 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/20"
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">{icon}</div>
                    <div>
                        <p className="font-black text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                </div>
                {isLocked && <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border/50">
                <div>
                    <p className="text-xs text-muted-foreground">Income</p>
                    <p className="font-black text-accent text-sm">{income}/sec</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Owned</p>
                    <p className="font-black text-sm">{owned}</p>
                </div>
                <button
                    className={`ml-auto px-4 py-2 rounded-lg font-semibold text-sm transition-all ${isLocked
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-accent text-black hover:shadow-lg hover:shadow-accent/50 hover:scale-105"
                        }`}
                >
                    {cost.toLocaleString()}
                </button>
            </div>
        </div>
    )
}
