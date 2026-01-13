import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import MobileMenuButton from './MobileMenuButton';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LimitReachedModal from './LimitReachedModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { jacServerService, ChatMessage as JacChatMessage } from '@/services/jacServer';
import { FileText, CheckCircle2, XCircle, Clock, AlertCircle, Mail } from 'lucide-react';

// Ally logo path
const allyLogo = "/logo.png";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'document-upload' | 'document-result' | 'processing-status';
  data?: any;
}

interface UploadedFile {
  name: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
}

interface ProcessingStatus {
  stage: string;
  message: string;
}

const JacChatbot = () => {
  const { user, messageCount, incrementMessageCount, canSendMessage, maxFreeMessages, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadedFile[]>([]);
  const [claimSessionId, setClaimSessionId] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [lastAssessment, setLastAssessment] = useState<any>(null);

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
      setUploadingFiles([]);
      
      // Close sidebar on mobile after starting new chat
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Failed to create new session:', error);
      // Fallback to resetting messages without server interaction
      setMessages([]);
      setUploadingFiles([]);
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
      // Check if this is a follow-up to document processing
      if (lastAssessment && (
        message.toLowerCase().includes('update') ||
        message.toLowerCase().includes('change') ||
        message.toLowerCase().includes('modify') ||
        message.toLowerCase().includes('email') ||
        message.toLowerCase().includes('name')
      )) {
        // Handle as document-related request
        const contextualPrompt = `Based on the GAP claim assessment I just provided, the user asks: "${message}". 
        
Previous assessment context:
- Follow-up email template was provided
- Missing items: ${lastAssessment.missingItems?.join(', ') || 'None'}
- Claimant name: ${lastAssessment.extractedFields?.claimantName || 'Not extracted'}

Please provide a helpful response focused on updating the assessment or email, not Jac code examples.`;
        
        const response = await jacServerService.sendMessage(contextualPrompt, sessionId, user?.email || '');
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Normal chat flow
        const userEmail = user?.email || '';
        const response = await jacServerService.sendMessage(message, sessionId, userEmail);
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      }
      
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

  const handleFileUpload = async (files: File[]) => {
    // Add a system message for upload initiation
    const uploadMessage: Message = {
      id: Date.now().toString(),
      content: 'Processing GAP claim documents...',
      isUser: false,
      timestamp: new Date(),
      type: 'document-upload',
      data: { files: files.map(f => f.name) }
    };
    
    setMessages(prev => [...prev, uploadMessage]);
    setUploadingFiles(files.map(f => ({ name: f.name, status: 'uploading', progress: 10 })));

    const updateStatus = (stage: string, message: string) => {
      setProcessingStatus({ stage, message });
    };

    try {
      // Generate unique claim session ID
      const newClaimSessionId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setClaimSessionId(newClaimSessionId);

      // Step 1: Reading files
      updateStatus('reading', 'Let me take a look at these documents...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filesWithBase64 = await Promise.all(
        files.map(file => {
          return new Promise<{ filename: string; content_base64: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64String = (reader.result as string).split(',')[1];
              resolve({ filename: file.name, content_base64: base64String });
            };
            reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
            reader.readAsDataURL(file);
          });
        })
      );

      // Step 2: Uploading
      updateStatus('uploading', 'Securing your documents for analysis...');
      setUploadingFiles(prev => prev.map(f => ({ ...f, progress: 25 })));
      
      const uploadResponse = await fetch(`${API_URL}/walker/upload_claim_documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: newClaimSessionId,
          files: filesWithBase64,
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      
      // Step 3: Extracting text
      updateStatus('extracting', 'Reading through the contract details and extracting key information...');
      setUploadingFiles(prev => prev.map(f => ({ ...f, status: 'processing', progress: 40 })));
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 4: AI Analysis
      updateStatus('analyzing', 'Carefully analyzing the claim requirements and policy terms...');
      setUploadingFiles(prev => prev.map(f => ({ ...f, progress: 55 })));
      
      const processResponse = await fetch(`${API_URL}/walker/process_claim_documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: newClaimSessionId,
        }),
      });

      if (!processResponse.ok) {
        throw new Error('Processing failed');
      }

      // Step 5: Identifying requirements
      updateStatus('requirements', 'Checking what documentation might be missing or incomplete...');
      setUploadingFiles(prev => prev.map(f => ({ ...f, progress: 75 })));
      await new Promise(resolve => setTimeout(resolve, 600));

      const processData = await processResponse.json();
      
      if (processData.reports && processData.reports.length > 0) {
        const result = processData.reports[0];
        
        if (result.assessment) {
          // Step 6: Generating report
          updateStatus('finalizing', 'Preparing your comprehensive assessment with recommendations...');
          setUploadingFiles(prev => prev.map(f => ({ ...f, progress: 90 })));
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Store assessment for context
          setLastAssessment(result.assessment);
          
          // Update file status
          setUploadingFiles(prev => 
            prev.map(f => ({ ...f, status: 'complete' as const, progress: 100 }))
          );
          
          updateStatus('complete', 'All done! I have completed the analysis of your documents.');
          
          // Add result message
          const resultMessage: Message = {
            id: Date.now().toString(),
            content: 'Document analysis complete',
            isUser: false,
            timestamp: new Date(),
            type: 'document-result',
            data: result.assessment
          };
          setMessages(prev => [...prev, resultMessage]);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      updateStatus('error', 'Something went wrong while processing. Could you try uploading again?');
      setUploadingFiles(prev => 
        prev.map(f => ({ ...f, status: 'error' as const, progress: 0 }))
      );
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Failed to process documents. Please try again.',
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setTimeout(() => {
        setUploadingFiles([]);
        setProcessingStatus(null);
      }, 2000);
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'document-upload') {
      return (
        <Card key={message.id} className="p-4 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Processing Documents</span>
          </div>
          
          <div className="space-y-3">
            {uploadingFiles.map((file, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{file.name}</span>
                  {file.status === 'complete' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {file.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                  )}
                </div>
                <Progress value={file.progress} className="h-1.5" />
                
                {/* Processing Status below progress bar */}
                {processingStatus && (
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground/80">
                      {processingStatus.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      );
    }

    if (message.type === 'document-result') {
      const assessment = message.data;
      return (
        <Card key={message.id} className="p-6 border-primary/20 bg-card">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">GAP Claim Assessment</h3>
              <Badge variant={assessment.completenessScore >= 70 ? "success" : "warning"}>
                {assessment.completenessScore}% Complete
              </Badge>
            </div>

            {/* Extracted Fields */}
            {assessment.extractedFields && Object.keys(assessment.extractedFields).some(k => assessment.extractedFields[k]) && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-foreground/80">Extracted Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(assessment.extractedFields).map(([key, value]) => 
                    value && (
                      <div key={key} className="flex flex-col">
                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-foreground font-medium">{String(value)}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Missing Items */}
            {assessment.missingItems && assessment.missingItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-foreground/80 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Missing Documentation
                </h4>
                <ul className="space-y-1 text-sm">
                  {assessment.missingItems.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {assessment.nextSteps && assessment.nextSteps.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-foreground/80">Recommended Next Steps</h4>
                <ol className="space-y-1 text-sm list-decimal list-inside text-muted-foreground">
                  {assessment.nextSteps.slice(0, 5).map((step: string, idx: number) => (
                    <li key={idx}>{step.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Follow-up Email */}
            {assessment.followUpEmail && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-foreground/80 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Follow-up Email Template
                </h4>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap text-foreground">
                  {assessment.followUpEmail}
                </pre>
              </div>
            )}
          </div>
        </Card>
      );
    }

    return (
      <ChatMessage
        key={message.id}
        message={message.content}
        isUser={message.isUser}
        timestamp={message.timestamp}
      />
    );
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
            <div className="max-w-4xl mx-auto space-y-4 lg:pt-0 pt-16 min-w-0 overflow-hidden">
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
                          <span>Answer questions about GAP claim process</span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Click the 📎 button to upload documents or ask any questions about GAP claims
                    </p>
                  </div>
                </div>
              )}
              
              {messages.map((message) => renderMessage(message))}
              
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
                    <div className="text-xs text-muted-foreground mt-1">Processing your request...</div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
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
