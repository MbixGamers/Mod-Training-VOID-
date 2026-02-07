import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const ADMIN_USER_IDS = ['394600108846350346', '928635423465537579']; // Hardcoded admin IDs

export const Admin = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      if (!ADMIN_USER_IDS.includes(session.user.id)) {
        toast.error('Unauthorized access');
        navigate('/');
        return;
      }
      fetchSubmissions();
    };
    checkAdmin();
  }, [navigate]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const response = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: id, action })
      });
      if (response.ok) {
        toast.success(`Submission ${action}ed`);
        fetchSubmissions();
      }
    } catch (error) {
      toast.error('Failed to perform action');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Portal</h1>
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
    </div>
  );
};
