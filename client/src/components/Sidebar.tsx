import { useState } from 'react';
import { Menu, X, Plus, MessageSquare, Settings, HelpCircle, ChevronLeft, ChevronRight, LogOut, User, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Ally logo path
const allyLogo = "/logo.png";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
}

const Sidebar = ({ isOpen, onToggle, onNewChat }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user, logout, isAuthenticated, messageCount, maxFreeMessages } = useAuth();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isExpanded ? 'w-70' : 'w-16'} lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-primary/10 rounded-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <img
                    src={allyLogo}
                    alt="Ally"
                    className="relative w-10 h-10 object-contain"
                  />
                </div>
                {isExpanded && (
                  <div>
                    <h1 className="text-lg font-bold text-primary">
                      Ally GAP
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Claims Processing Agent
                    </p>
                  </div>
                )}
              </div>

              {!isExpanded && (
                <div className="relative group mx-auto">
                  <div className="absolute -inset-1 bg-primary/10 rounded-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <img
                    src={allyLogo}
                    alt="Ally"
                    className="relative w-8 h-8 object-contain"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Expand/Collapse button - only on desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleExpanded}
                  className="hidden lg:flex text-muted-foreground hover:text-primary"
                >
                  {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>

                {/* Close button - only on mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="lg:hidden text-muted-foreground hover:text-primary"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* New Claim Button */}
          <div className="p-4">
            <Button
              onClick={onNewChat}
              className={`w-full justify-start gap-3 bg-primary hover:bg-primary/90 text-primary-foreground ${!isExpanded ? 'px-2' : ''}`}
              title="New Claim"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {isExpanded && "New Claim"}
            </Button>
          </div>

          {/* Claim History */}
          {isExpanded && (
            <div className="flex-1 overflow-y-auto px-4">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Recent Claims
                </div>

                {/* Current claim - active */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent text-foreground cursor-pointer hover:bg-accent/80">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="text-sm truncate">Current Session</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            {/* Authenticated User Profile */}
            {isExpanded && isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-foreground hover:text-primary hover:bg-accent p-3"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getUserInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {user.name || user.email}
                      </span>
                      {user.name && (
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start" side="top">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Guest User Actions */}
            {isExpanded && !isAuthenticated && (
              <div className="space-y-3">
                <Link to="/register">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
            
            {!isExpanded && isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full px-2 py-2 text-foreground hover:text-primary hover:bg-accent"
                    title={user.name || user.email}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getUserInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start" side="right">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name || user.email}</span>
                      {user.name && (
                        <span className="text-xs text-muted-foreground font-normal">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!isExpanded && !isAuthenticated && (
              <div className="space-y-2">
                <Link to="/register">
                  <Button
                    variant="ghost"
                    className="w-full px-2 py-2 text-primary hover:text-primary-foreground hover:bg-primary"
                    title="Sign Up"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="w-full px-2 py-2 text-muted-foreground hover:text-primary hover:bg-accent"
                    title="Sign In"
                  >
                    <LogIn className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-accent ${!isExpanded ? 'px-2' : ''}`}
              size="sm"
              title="Help & FAQ"
              onClick={() => window.open('https://www.ally.com/auto/vehicle-protection/claims-support/', '_blank')}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              {isExpanded && "Help & FAQ"}
            </Button>

            {/* Status indicator */}
            {isExpanded && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent px-3 py-2 rounded-lg mt-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isAuthenticated ? 'bg-green-500' : 'bg-primary'}`}></div>
                {isAuthenticated ? 'Ready to process' : 'Guest mode'}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
