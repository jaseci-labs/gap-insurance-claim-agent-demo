"""
Sidebar component with navigation and claims list
"""

import from react { useState }
import from ..utils.mergeCls { cn }

def:pub Sidebar(
    currentSessionId: str = None,
    onNewClaim: any = None,
    onSignUp: any = None,
    onSignIn: any = None
) -> any {
    return <aside className={cn(
        "w-64 bg-card border-r border-border",
        "flex flex-col h-full"
    )}>
        <div className="p-6 border-b border-border mb-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-primary/10 rounded-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <img
                        src="/assets/logo.png"
                        alt="Ally"
                        className="relative w-10 h-10 object-contain"
                    />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-primary">
                        Ally GAP
                    </h1>
                    <p className="text-xs text-text-muted">
                        Claims Processing Agent
                    </p>
                </div>
            </div>
        </div>

        <div className="px-6 mb-6">
            <button
                onClick={onNewClaim}
                className={cn(
                    "w-full px-4 py-3 rounded-lg",
                    "bg-primary hover:bg-primary/90 text-white",
                    "font-semibold transition-all duration-300",
                    "flex items-center justify-start gap-3",
                    "hover:shadow-lg hover:scale-[1.02]"
                )}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <line x1="12" x2="12" y1="5" y2="19"></line>
                    <line x1="5" x2="19" y1="12" y2="12"></line>
                </svg>
                <span>New Claim</span>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 my-4">
            <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-6">
                Recent Claims
            </div>

            {currentSessionId and (
                <div className={cn(
                    "flex items-center gap-3 p-3 rounded-lg mb-2",
                    "bg-primary/5 border border-primary/20",
                    "cursor-pointer hover:bg-primary/10",
                    "transition-all duration-200"
                )}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="text-sm text-text-primary font-medium">Current Session</span>
                </div>
            )}
        </div>

        <div className="px-6 py-6 border-t border-border mt-auto">
            <div className="space-y-4">
            <button
                onClick={onSignUp}
                className={cn(
                    "w-full px-4 py-3 rounded-lg",
                    "bg-primary hover:bg-primary/90 text-white",
                    "font-medium transition-all duration-300",
                    "flex items-center justify-center gap-2",
                    "hover:shadow-md"
                )}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="19" x2="19" y1="8" y2="14"></line>
                    <line x1="22" x2="16" y1="11" y2="11"></line>
                </svg>
                <span>Sign Up</span>
            </button>

            <button
                onClick={onSignIn}
                className={cn(
                    "w-full px-4 py-3 rounded-lg",
                    "bg-white hover:bg-surface",
                    "border border-primary text-primary hover:bg-primary hover:text-white",
                    "font-medium transition-all duration-300",
                    "flex items-center justify-center gap-2"
                )}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" x2="3" y1="12" y2="12"></line>
                </svg>
                <span>Sign In</span>
            </button>

            <button className={cn(
                "w-full px-4 py-2 rounded-lg text-sm",
                "text-text-muted hover:text-primary",
                "hover:bg-surface transition-all duration-200",
                "flex items-center justify-center gap-2"
            )}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" x2="12.01" y1="17" y2="17"></line>
                </svg>
                <span>Help & FAQ</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-text-muted bg-surface px-4 py-3 rounded-lg mt-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span>Guest mode</span>
            </div>
            </div>
        </div>
    </aside>;
}
