import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if there's a hash in the URL (OAuth callback)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        // Also check for code parameter in query string (PKCE flow)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (accessToken || code) {
          // Let Supabase handle the session establishment
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            setError('Failed to authenticate. Please try again.');
            setTimeout(() => navigate('/login'), 2000);
            return;
          }

          if (session) {
            // Successfully authenticated, clean URL and redirect
            window.history.replaceState({}, document.title, '/test');
            navigate('/test', { replace: true });
          } else {
            // Wait a bit for session to be established
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession) {
                window.history.replaceState({}, document.title, '/test');
                navigate('/test', { replace: true });
              } else {
                setError('Authentication incomplete. Please try logging in again.');
                setTimeout(() => navigate('/login'), 2000);
              }
            }, 1000);
          }
        } else {
          // No auth params, check if already logged in
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigate('/test', { replace: true });
          } else {
            setError('No authentication data found. Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
          }
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('An unexpected error occurred. Please try again.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-zinc-400 mb-4">
          {error || 'Processing login...'}
        </div>
        {!error && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};
