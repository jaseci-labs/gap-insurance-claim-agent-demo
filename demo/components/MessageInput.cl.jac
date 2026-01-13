"""
Message input component with send button
"""

import from ..utils.mergeCls { cn }

def:pub MessageInput(
    value: str,
    onChange: any,
    onSend: any,
    onKeyPress: any,
    disabled: bool = False
) -> any {
    return <div className="border-t border-border/50 bg-card/30 backdrop-blur-md p-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex gap-4">
            <textarea
                value={value}
                onChange={lambda e: any -> None { onChange(e.target.value); }}
                onKeyPress={onKeyPress}
                disabled={disabled}
                placeholder="Ask about GAP claims or upload documents..."
                rows={1}
                className={cn(
                    "flex-1 px-4 py-3 rounded-xl resize-none min-h-[60px]",
                    "border border-border/50 hover:border-primary/50 focus:border-primary",
                    "focus:ring-2 focus:ring-primary/20",
                    "bg-background/80 text-text-primary placeholder:text-text-muted",
                    "transition-all duration-300 outline-none text-base leading-relaxed",
                    (disabled and "opacity-50 cursor-not-allowed")
                )}
            />

            <button
                onClick={onSend}
                disabled={disabled or not value.trim()}
                className={cn(
                    "h-[60px] px-6 rounded-xl font-medium",
                    "bg-primary hover:bg-primary-dark text-white",
                    "transition-all duration-300 shadow-sm",
                    "hover:shadow-lg hover:scale-105",
                    "disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed",
                    "flex items-center gap-2"
                )}
            >
                <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                <span className="hidden sm:inline">Send</span>
            </button>
        </div>
        
        <div className="max-w-4xl mx-auto mt-2 text-xs text-text-muted text-center">
            Press Enter to send, Shift+Enter for new line
        </div>
    </div>;
}
