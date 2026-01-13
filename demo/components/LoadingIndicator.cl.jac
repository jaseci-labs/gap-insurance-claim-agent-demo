"""
Loading indicator for AI responses
"""

import from ..utils.mergeCls { cn }

def:pub LoadingIndicator() -> any {
    return <div className="flex gap-3 mb-6">
        <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🤖</span>
        </div>

        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full loading-dot" />
                <div className="w-2 h-2 bg-primary rounded-full loading-dot" />
                <div className="w-2 h-2 bg-primary rounded-full loading-dot" />
            </div>
            <p className="text-xs text-text-muted mt-2">
                Analyzing your claim...
            </p>
        </div>
    </div>;
}
