"""
Message bubble component for chat messages
"""

import from ..utils.mergeCls { cn }

def:pub MessageBubble(message: any) -> any {
    is_user = message.is_user;

    justify_class = "justify-start";
    if is_user {
        justify_class = "justify-end";
    }

    bubble_class = "bg-card/80 border border-border/50 text-text-primary rounded-2xl shadow-sm hover:shadow-md hover:border-border";
    if is_user {
        bubble_class = "bg-primary text-white rounded-2xl shadow-md hover:shadow-lg";
    }

    ai_avatar = None;
    if not is_user {
        ai_avatar = <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center flex-shrink-0 p-1.5 hover:scale-110 transition-transform duration-200">
            <img 
                src="/assets/logo.png" 
                alt="Assistant" 
                className="w-full h-full object-contain"
            />
        </div>;
    }

    user_avatar = None;
    if is_user {
        user_avatar = <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md hover:scale-110 transition-transform duration-200">
            <span className="text-xs font-bold text-white">You</span>
        </div>;
    }

    return <div className={cn("flex gap-3 p-3 animate-fade-in", justify_class)}>
        {ai_avatar}

        <div className={cn(
            "max-w-[70%] px-4 py-3",
            "whitespace-pre-wrap leading-relaxed text-sm",
            "transition-all duration-200",
            bubble_class
        )}>
            {message.content}
        </div>

        {user_avatar}
    </div>;
}
