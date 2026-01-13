"""
Main claims chat page
"""

import from react { useState }
import from ..hooks.useClaimsChat { useClaimsChat }
import from ..components.Sidebar { Sidebar }
import from ..components.MessageBubble { MessageBubble }
import from ..components.MessageInput { MessageInput }
import from ..components.LoadingIndicator { LoadingIndicator }
import from ..components.WelcomeScreen { WelcomeScreen }
import from ..utils.mergeCls { cn }

def:pub ClaimsPage() -> any {
    # For demo, use a mock user email
    [userEmail, setUserEmail] = useState("user@ally.com");
    [sessionId, setSessionId] = useState(None);

    # Use claims chat hook
    chat = useClaimsChat(userEmail);

    # Handle new claim
    def handleNewClaim() -> None {
        # Reset chat for new claim
        console.log("New claim clicked");
        window.location.reload();
    }

    # Handle auth actions
    def handleSignUp() -> None {
        console.log("Sign up clicked");
    }

    def handleSignIn() -> None {
        console.log("Sign in clicked");
    }

    # Set session ID when messages exist
    if chat.messages.length > 0 and not sessionId {
        setSessionId("current");
    }

    # Error display (shown for both welcome and chat states)
    error_display = None;
    if chat.error {
        error_display = <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{chat.error}</p>
        </div>;
    }

    # Render welcome or messages
    content = None;
    if chat.messages.length == 0 {
        content = <div>
            {error_display}
            <WelcomeScreen />
        </div>;
    } else {
        message_list = chat.messages.map(lambda msg: any -> any {
            return <MessageBubble key={msg.timestamp} message={msg} />;
        });

        loading_indicator = None;
        if chat.isLoading {
            loading_indicator = <LoadingIndicator />;
        }

        content = <div>
            {error_display}
            {message_list}
            {loading_indicator}
            <div ref={chat.messagesEndRef} />
        </div>;
    }

    return <div className="flex h-screen bg-background">
        <Sidebar 
            currentSessionId={sessionId}
            onNewClaim={handleNewClaim}
            onSignUp={handleSignUp}
            onSignIn={handleSignIn}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-border/50 bg-background px-4 py-4 shadow-sm">
                <div className="flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <img 
                            src="/assets/logo.png" 
                            alt="Ally" 
                            className="w-8 h-8 object-contain"
                        />
                        <h1 className="text-xl font-semibold text-primary">Ally GAP Claims Agent</h1>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-4">
                    {content}
                </div>
            </div>

            <MessageInput
                value={chat.inputText}
                onChange={chat.setInputText}
                onSend={chat.handleSendMessage}
                onKeyPress={chat.handleKeyPress}
                disabled={chat.isLoading}
            />
        </div>
    </div>;
}
