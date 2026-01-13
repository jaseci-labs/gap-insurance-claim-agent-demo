"""
Hook for managing claims chat state and interactions
"""

import from react { useState, useEffect, useRef }
import from ..service.claimsService {
    getOrCreateSession,
    sendMessage,
    getMessageHistory
}

def:pub useClaimsChat(userEmail: str) -> any {
    # State
    [sessionId, setSessionId] = useState("");
    [messages, setMessages] = useState([]);
    [inputText, setInputText] = useState("");
    [isLoading, setIsLoading] = useState(False);
    [error, setError] = useState("");

    # Refs
    messagesEndRef = useRef(None);

    # Initialize session on mount
    useEffect(
        lambda -> None {
            async def initSession() -> None {
                result = await getOrCreateSession(userEmail);

                if result.success {
                    setSessionId(result.session_id);
                    # Load message history
                    history = await getMessageHistory(result.session_id);
                    if history.success {
                        setMessages(history.messages);
                    }
                } else {
                    setError(result.error);
                }
            }

            initSession();
        },
        [userEmail]
    );

    # Auto-scroll to bottom
    useEffect(
        lambda -> None {
            if messagesEndRef.current {
                messagesEndRef.current.scrollIntoView({ "behavior": "smooth" });
            }
        },
        [messages]
    );

    # Send message handler
    async def handleSendMessage() -> None {
        if not inputText.trim() or not sessionId {
            return;
        }

        user_message = inputText.trim();
        setInputText("");
        setIsLoading(True);
        setError("");

        # Add user message to UI immediately
        user_msg = {
            "content": user_message,
            "is_user": True,
            "timestamp": String(Date.now()),
            "message_type": "text"
        };
        setMessages(lambda prev: any -> any { return prev.concat([user_msg]); });

        # Send to backend
        result = await sendMessage(sessionId, userEmail, user_message);

        setIsLoading(False);

        if result.success {
            # Add AI response
            ai_msg = {
                "content": result.response,
                "is_user": False,
                "timestamp": result.timestamp,
                "message_type": "text"
            };
            setMessages(lambda prev: any -> any { return prev.concat([ai_msg]); });
        } else {
            setError(result.error or "Failed to send message");
        }
    }

    # Handle enter key
    def handleKeyPress(e: any) -> None {
        if e.key == "Enter" and not e.shiftKey {
            e.preventDefault();
            handleSendMessage();
        }
    }

    return {
        "sessionId": sessionId,
        "messages": messages,
        "inputText": inputText,
        "isLoading": isLoading,
        "error": error,
        "messagesEndRef": messagesEndRef,
        "setInputText": setInputText,
        "handleSendMessage": handleSendMessage,
        "handleKeyPress": handleKeyPress
    };
}
