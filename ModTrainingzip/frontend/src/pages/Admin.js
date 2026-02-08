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
          navigate('/');
          return;
        }

        // Check Discord user ID from session metadata
        // Discord provider_id is stored in user_metadata
        const discordUserId = session.user.user_metadata?.provider_id;
        
        console.log('Admin check:', {
          userId: session.user.id,
          discordUserId: discordUserId,
          metadata: session.user.user_metadata,
          allowedIds: ADMIN_USER_IDS
        });
        
        if (!discordUserId || !ADMIN_USER_IDS.includes(discordUserId)) {
          toast.error('Unauthorized access - Admin privileges required');
          console.log('Access denied - Discord ID not in admin list');
          navigate('/');
          return;
        }

        console.log('Admin access granted for Discord ID:', discordUserId);
        setIsAdmin(true);
        await fetchSubmissions();
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Error verifying admin status');
        navigate('/');
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Admin Portal</h1>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
          >
            Back to Home
          </Button>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-400">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div 
                key={sub.id} 
                className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 hover:border-violet-500/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-lg">{sub.username}</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sub.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                        sub.status === 'accepted' ? 'bg-green-600/20 text-green-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-1">{sub.user_email}</p>
                    <p className="text-sm text-zinc-400 mb-1">User ID: {sub.user_id}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <p className={`text-sm font-medium ${sub.passed ? 'text-green-400' : 'text-red-400'}`}>
                        Score: {Math.round(sub.score)}% - {sub.passed ? 'PASSED' : 'FAILED'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Submitted: {new Date(sub.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {sub.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAction(sub.id, 'accepted')} 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                      <Button 
                        onClick={() => handleAction(sub.id, 'denied')} 
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Deny
                      </Button>
                    </div>
                  )}
                </div>

                {/* Show answers */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-violet-400 hover:text-violet-300">
                    View Answers ({sub.answers?.length || 0} questions)
                  </summary>
                  <div className="mt-3 space-y-2">
                    {sub.answers?.map((answer, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded border ${
                          answer.is_correct ? 'border-green-600/30 bg-green-600/5' : 'border-red-600/30 bg-red-600/5'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          Q{answer.question_number}: {answer.question}
                        </p>
                        <p className="text-xs text-zinc-400 font-mono">
                          {answer.user_answer || 'No answer provided'}
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
