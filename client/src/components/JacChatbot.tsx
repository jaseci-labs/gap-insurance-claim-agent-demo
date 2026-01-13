import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import MobileMenuButton from './MobileMenuButton';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LimitReachedModal from './LimitReachedModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { jacServerService, ChatMessage as JacChatMessage } from '@/services/jacServer';
// Ally logo path
const allyLogo = "/logo.png";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const JacChatbot = () => {
  const { user, messageCount, incrementMessageCount, canSendMessage, maxFreeMessages, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Initialize session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const newSessionId = jacServerService.generateSessionId();
        await jacServerService.createSession(newSessionId);
        setSessionId(newSessionId);
        console.log('Session initialized:', newSessionId);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        // Fallback to a simple session ID if server is not available
        setSessionId(jacServerService.generateSessionId());
      }
    };

    initializeSession();
  }, []);

  const handleNewChat = async () => {
    try {
      // Create a new session
      const newSessionId = jacServerService.generateSessionId();
      await jacServerService.createSession(newSessionId);
      setSessionId(newSessionId);
      
      setMessages([]);
      setIsLoading(false);
      
      // Close sidebar on mobile after starting new chat
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Failed to create new session:', error);
      // Fallback to resetting messages without server interaction
      setMessages([]);
    }
  };

    const handleSendMessage = async (message: string) => {
    if (!canSendMessage) {
      setShowLimitModal(true);
      return;
    }

    if (!sessionId) {
      console.error('No session ID available');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const userEmail = user?.email || '';
      const response = await jacServerService.sendMessage(message, sessionId, userEmail);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Increment message count for guest users (non-authenticated users)
      if (!isAuthenticated) {
        incrementMessageCount();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
      />

      {/* Chat Interface */}
      <div className="flex-1 min-w-0">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
          {/* Mobile Menu Button */}
          <MobileMenuButton onClick={() => setSidebarOpen(true)} />

          {/* Header */}
          <div className="hidden lg:flex items-center p-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <img src={allyLogo} alt="Ally" className="w-8 h-8 object-contain" />
              <h1 className="text-xl font-semibold text-primary">Ally GAP Claims Agent</h1>
            </div>
          </div>

          {/* Limit Reached Modal */}
          <LimitReachedModal
            isOpen={showLimitModal}
            onClose={() => setShowLimitModal(false)}
            messageCount={messageCount}
            maxFreeMessages={maxFreeMessages}
          />
          
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto space-y-1 lg:pt-0 pt-16 min-w-0 overflow-hidden">
              {messages.length === 0 && !isLoading && (
                <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                  <div className="text-center max-w-2xl mx-auto px-4">
                    <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <img src={allyLogo} alt="Ally" className="w-12 h-12 object-contain" />
                    </div>
                    <h2 className="text-2xl text-primary font-semibold mb-2">GAP Claim Intake Agent</h2>
                    <p className="text-base text-muted-foreground mb-6">
                      Upload your GAP claim documents for instant analysis and intake assessment
                    </p>
                    <div className="bg-accent/50 rounded-lg p-6 text-left">
                      <h3 className="font-semibold text-primary mb-3">I can help you with:</h3>
                      <ul className="space-y-2 text-sm text-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>Extract key information from GAP contracts and insurance documents</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>Identify missing documentation for complete claim intake</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>Generate claim readiness assessments and next steps</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>Draft follow-up emails for missing information</span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Start by uploading claim documents or asking a question about the GAP claim process
                    </p>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              
              {isLoading && (
                <div className="flex gap-3 p-3 animate-fade-in">
                  <div className="w-8 h-8 shrink-0 bg-primary/10 rounded-full animate-pulse flex items-center justify-center p-1.5">
                    <img src={allyLogo} alt="Processing" className="w-full h-full object-contain" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Analyzing claim documents...</div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading || !canSendMessage}
            placeholder={
              !canSendMessage
                ? "Sign up to continue..."
                : "Ask about GAP claims or upload documents..."
            }
          />
        </div>
      </div>
    </div>
  );
};

export default JacChatbot;