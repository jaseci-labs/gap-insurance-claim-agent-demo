"""
Header component for the Ally GAP Claims Agent
"""

import from ..utils.mergeCls { cn }

def:pub Header(onLogout: any = None) -> any {
    # Build logout button conditionally
    logout_button = None;
    if onLogout {
        logout_button = <button
            onClick={onLogout}
            className={cn(
                "px-4 py-2 rounded-lg",
                "bg-surface hover:bg-surface-hover",
                "border border-border",
                "text-text-primary font-medium",
                "transition-colors duration-200"
            )}
        >
            Sign Out
        </button>;
    }

    return <header className={cn(
        "border-b border-border bg-background",
        "px-6 py-4",
        "flex items-center justify-between"
    )}>
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
            </div>
            <div>
                <h1 className="text-xl font-bold text-primary">
                    Ally GAP Claims Agent
                </h1>
                <p className="text-sm text-text-secondary">
                    Streamline your GAP insurance claims
                </p>
            </div>
        </div>

        {logout_button}
    </header>;
}
