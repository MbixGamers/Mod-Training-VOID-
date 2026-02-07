import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have auth parameters in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        const hasAuthParams = hashParams.has('access_token') || 
                             hashParams.has('refresh_token') || 
                             searchParams.has('code');

        if (hasAuthParams) {
          // Wait for Supabase to process the auth callback
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth error:', error);
            setError('Authentication failed. Please try again.');
            setTimeout(() => navigate('/login', { replace: true }), 2000);
            return;
          }

          if (data.session) {
            console.log('Auth successful, redirecting to test page');
            // Clean the URL and navigate to test
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
                setTimeout(() => navigate('/login', { replace: true }), 2000);
              }
            }, 1000);
          }
        } else {
          // If no auth params, check if already logged in
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            navigate('/test', { replace: true });
          } else {
            // No session found, redirect to login
            setError('No active session. Redirecting to login...');
            setTimeout(() => navigate('/login', { replace: true }), 1500);
          }
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('An error occurred. Please try again.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    handleAuthCallback();

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      if (event === 'SIGNED_IN' && session) {
        window.history.replaceState({}, document.title, '/test');
        navigate('/test', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-400 mb-2">{error}</div>
            <div className="text-zinc-500 text-sm">Redirecting...</div>
          </>
        ) : (
          <>
            <div className="text-zinc-400 mb-4">Processing login...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
          </>
        )}
      </div>
    </div>
  );
};
