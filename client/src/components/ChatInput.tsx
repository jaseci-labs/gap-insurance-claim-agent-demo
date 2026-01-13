import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (files: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSendMessage, onFileUpload, disabled = false, placeholder }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultPlaceholder = "Ask about Jac syntax, functions, loops, classes, or request code examples...";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t border-border/50 bg-card/30 backdrop-blur-md p-4">
      <form onSubmit={handleSubmit} className="flex gap-4 max-w-4xl mx-auto">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* File upload button */}
        {onFileUpload && (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="h-[60px] px-4 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 rounded-xl"
            title="Upload GAP claim documents"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || defaultPlaceholder}
            className="min-h-[60px] max-h-[200px] resize-none bg-background/80 border-border/50 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl text-base leading-relaxed"
            disabled={disabled}
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="h-[60px] px-6 bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 rounded-xl font-medium"
        >
          <Send className="w-5 h-5" />
          <span className="ml-2 hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;