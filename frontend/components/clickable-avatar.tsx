"use client"

interface ClickableAvatarProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void
    animate: boolean
}

export default function ClickableAvatar({ onClick, animate }: ClickableAvatarProps) {
    return (
        <button
            onClick={onClick}
            className={`relative w-40 h-40 rounded-full transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${animate ? "scale-95" : "scale-100 hover:scale-105"
                }`}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent via-purple-400 to-accent opacity-50 blur-2xl animate-pulse" />

            {/* Main button */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-purple-500 shadow-2xl shadow-accent/50 flex items-center justify-center overflow-hidden">
                {/* Inner glow */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-accent/80 to-purple-500/80 flex items-center justify-center">
                    <span className="text-6xl">⛏️</span>
                </div>
            </div>

            {/* Ripple effect on click */}
            {animate && (
                <>
                    <div className="absolute inset-0 rounded-full border-4 border-accent animate-ping opacity-75" />
                    <div className="absolute inset-0 rounded-full border-2 border-accent/50 animate-pulse" />
                </>
            )}
        </button>
    )
}
