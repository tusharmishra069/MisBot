"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Wallet, Coins, Calendar, Save } from "lucide-react"
import { toast } from "sonner"
import { useTelegram } from "@/hooks/useTelegram"

export default function ProfilePage() {
    const router = useRouter()
    const { user, initData } = useTelegram()
    const isDev = process.env.NODE_ENV !== 'production'
    const authData = initData || (isDev ? 'dev_data' : '')

    const [username, setUsername] = useState('')
    const [telegramId, setTelegramId] = useState('')
    const [totalCoins, setTotalCoins] = useState(0)
    const [walletAddress, setWalletAddress] = useState('')
    const [joinDate, setJoinDate] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Load user data
    useEffect(() => {
        if (authData) {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
                headers: { 'x-telegram-init-data': authData }
            })
                .then(res => res.json())
                .then(data => {
                    setUsername(data.username || '')
                    setTelegramId(data.telegram_id)
                    setTotalCoins(Number(data.points) || 0)
                    setJoinDate(new Date(data.created_at).toLocaleDateString())

                    // Get wallet if exists
                    if (data.wallets && data.wallets.length > 0) {
                        setWalletAddress(data.wallets[0].address)
                    }
                    setLoading(false)
                })
                .catch(err => {
                    console.error('Error loading profile:', err)
                    toast.error('Failed to load profile')
                    setLoading(false)
                })
        }
    }, [authData])

    const handleSave = async () => {
        if (!username.trim()) {
            toast.error('Username cannot be empty')
            return
        }

        setSaving(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-telegram-init-data': authData
                },
                body: JSON.stringify({ username: username.trim() })
            })

            if (res.ok) {
                toast.success('Profile updated successfully!')
            } else {
                const data = await res.json()
                toast.error(data.error || 'Failed to update profile')
            }
        } catch (err) {
            console.error('Error saving profile:', err)
            toast.error('Network error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-8">
            {/* Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-black">Profile</h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto px-4 py-6 space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                    </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Enter your username"
                        />
                    </div>

                    {/* Read-only Fields */}
                    <div className="space-y-3">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <User className="w-4 h-4 text-accent" />
                                <span className="text-sm text-muted-foreground">Telegram ID</span>
                            </div>
                            <p className="font-mono text-sm">{telegramId}</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-muted-foreground">Total Coins</span>
                            </div>
                            <p className="text-2xl font-black bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
                                {totalCoins.toLocaleString()}
                            </p>
                        </div>

                        {walletAddress && (
                            <div className="bg-card border border-border rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Wallet className="w-4 h-4 text-accent" />
                                    <span className="text-sm text-muted-foreground">Wallet Address</span>
                                </div>
                                <p className="font-mono text-xs break-all">{walletAddress}</p>
                            </div>
                        )}

                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-4 h-4 text-accent" />
                                <span className="text-sm text-muted-foreground">Member Since</span>
                            </div>
                            <p className="text-sm">{joinDate}</p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
