"use client"

import { useEffect, useState } from "react"
import { Crown, Trophy, Medal } from "lucide-react"

interface LeaderboardUser {
    username: string
    points: string
}

interface CurrentUserRank {
    rank: number
    points: string
    username: string
}

interface LeagueViewProps {
    initData: string
}

export default function LeagueView({ initData }: LeagueViewProps) {
    const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([])
    const [currentUser, setCurrentUser] = useState<CurrentUserRank | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!initData) return

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leaderboard`, {
            headers: { 'x-telegram-init-data': initData }
        })
            .then(res => res.json())
            .then(data => {
                setTopUsers(data.topUsers || [])
                setCurrentUser(data.currentUser || null)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [initData])

    const getRankIcon = (index: number) => {
        if (index === 0) return <span className="text-2xl">🥇</span>
        if (index === 1) return <span className="text-2xl">🥈</span>
        if (index === 2) return <span className="text-2xl">🥉</span>
        return <span className="font-mono text-muted-foreground">#{index + 1}</span>
    }

    if (loading) return <div className="text-center py-10 opacity-50">Loading leaderboard...</div>

    return (
        <div className="px-4 py-6 pb-24">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Leaderboard
            </h2>

            {/* Current User Rank Card */}
            {currentUser && (
                <div className="bg-gradient-to-r from-accent/20 to-purple-500/20 border border-accent/50 rounded-xl p-4 mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <Crown className="w-5 h-5 text-accent" />
                            <div>
                                <p className="font-black text-lg">Your Rank</p>
                                <p className="text-xs text-muted-foreground">{currentUser.username}</p>
                            </div>
                        </div>
                        <span className="text-2xl font-black">#{currentUser.rank}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-mono text-white/80">{parseInt(currentUser.points).toLocaleString()} coins</p>
                    </div>
                </div>
            )}

            {/* Top 50 List */}
            <div className="space-y-3">
                {topUsers.map((user, index) => (
                    <div
                        key={index}
                        className={`
                            flex justify-between items-center p-4 rounded-lg border 
                            ${user.username === currentUser?.username
                                ? 'bg-accent/10 border-accent/50'
                                : 'bg-card border-border'}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 flex justify-center">
                                {getRankIcon(index)}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{user.username}</p>
                                <p className="text-xs text-muted-foreground">{parseInt(user.points).toLocaleString()} coins</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {topUsers.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                    No players found yet. Be the first!
                </div>
            )}
        </div>
    )
}
