"use client"

interface UpgradeCardProps {
    name: string
    description: string
    cost: number
    level: number
    maxLevel: number
}

export default function UpgradeCard({ name, description, cost, level, maxLevel }: UpgradeCardProps) {
    const isMaxed = level >= maxLevel

    return (
        <div className="rounded-xl bg-gradient-to-r from-card to-card/50 border border-accent/20 p-4 hover:border-accent/60 transition-all">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <p className="font-black">{name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>
                <div className="flex gap-1">
                    {[...Array(maxLevel)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < level ? "bg-accent" : "bg-border"}`} />
                    ))}
                </div>
            </div>

            <div className="flex gap-3 items-center pt-3 border-t border-border/50">
                <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Progress</p>
                    <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-accent to-purple-400 h-2 transition-all"
                            style={{ width: `${(level / maxLevel) * 100}%` }}
                        />
                    </div>
                </div>
                <button
                    className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${isMaxed
                            ? "bg-muted text-muted-foreground cursor-default"
                            : "bg-accent text-black hover:shadow-lg hover:shadow-accent/50 hover:scale-105"
                        }`}
                >
                    {isMaxed ? "MAX" : cost.toLocaleString()}
                </button>
            </div>
        </div>
    )
}
