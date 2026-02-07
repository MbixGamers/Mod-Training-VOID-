import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const ADMIN_USER_IDS = ['394600108846350346', '928635423465537579']; // Hardcoded admin IDs
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mod-training-void-backend-cbpz.onrender.com';

export const Admin = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Clean up URL parameters if they exist
    if (window.location.search || window.location.hash) {
      window.history.replaceState({}, document.title, '/admin');
    }

    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error('Please log in to access admin portal');
          navigate('/login');
          return;
        }

        // Check Discord user ID from session
        const discordUserId = session.user.user_metadata?.provider_id || session.user.id;
        
        if (!ADMIN_USER_IDS.includes(discordUserId)) {
          toast.error('Unauthorized access - Admin privileges required');
          navigate('/');
          return;
        }

        setIsAdmin(true);
        await fetchSubmissions();
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Error verifying admin status');
        navigate('/login');
      }
    };
    
    checkAdmin();
  }, [navigate]);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/submissions`);
      setSubmissions(response.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/action`, {
        submission_id: id,
        action: action
      });
      
      if (response.status === 200) {
        toast.success(`Submission ${action}ed successfully`);
        await fetchSubmissions();
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-zinc-400 mb-4">Loading admin portal...</div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Portal</h1>
      {submissions.length === 0 ? (
        <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 text-center">
          <p className="text-zinc-400">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
              <div>
                <p className="font-bold">{sub.username} ({sub.user_email})</p>
                <p className="text-sm text-zinc-400">Score: {sub.score}% - {sub.passed ? 'PASSED' : 'FAILED'}</p>
                <p className="text-xs text-zinc-500">Status: {sub.status}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleAction(sub.id, 'accepted')} className="bg-green-600 hover:bg-green-700">Accept</Button>
                <Button onClick={() => handleAction(sub.id, 'denied')} className="bg-red-600 hover:bg-red-700">Deny</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
