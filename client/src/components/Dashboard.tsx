import { useAuth } from '@/contexts/AuthContext';
import JacChatbot from '@/components/JacChatbot';
import AdminDashboard from '@/components/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Show admin dashboard for admin users
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <JacChatbot />
    </div>
  );
};

export default Dashboard;
