import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import JacChatbot from '@/components/JacChatbot';
import AdminDashboard from '@/components/AdminDashboard';
import ClaimIntake from '@/components/ClaimIntake';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, FileText } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');

  // Show admin dashboard for admin users
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b bg-card">
          <div className="container mx-auto">
            <TabsList className="w-full justify-start h-14 bg-transparent border-b-0">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Jac Assistant
              </TabsTrigger>
              <TabsTrigger 
                value="claim" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6"
              >
                <FileText className="h-4 w-4 mr-2" />
                GAP Claim Intake
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
          <JacChatbot />
        </TabsContent>
        
        <TabsContent value="claim" className="flex-1 m-0 overflow-auto">
          <ClaimIntake />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
