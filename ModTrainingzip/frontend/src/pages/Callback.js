import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Starting auth callback handler...');
        
        // First, exchange the code for a session if present in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        const hasAuthCode = searchParams.has('code');
        const hasHashParams = hashParams.has('access_token') || hashParams.has('refresh_token');
        
        console.log('Auth params detected:', { hasAuthCode, hasHashParams });
        
        if (hasAuthCode || hasHashParams) {
          // Give Supabase a moment to process the callback
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Now check for the session
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          console.log('Session check result:', {
            hasSession: !!data?.session,
            error: sessionError?.message,
            userId: data?.session?.user?.id
          });
          
          if (sessionError) {
            console.error('❌ Session error:', sessionError);
            if (isSubscribed) {
              setError('Authentication failed. Please try again.');
              setProcessing(false);
              setTimeout(() => navigate('/', { replace: true }), 2000);
            }
            return;
          }

          if (data?.session) {
            console.log('✅ Session established successfully');
            console.log('User details:', {
              id: data.session.user.id,
              email: data.session.user.email,
              provider_id: data.session.user.user_metadata?.provider_id,
              name: data.session.user.user_metadata?.name
            });
            
            // Clean the URL before redirecting
            if (isSubscribed) {
              window.history.replaceState({}, document.title, '/callback');
              setProcessing(false);
              
              // Redirect to test page after successful authentication
              setTimeout(() => {
                navigate('/test', { replace: true });
              }, 500);
            }
            return;
          }
          
          // If no session yet, wait and retry
          console.log('⏳ No session yet, retrying...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const { data: retryData, error: retryError } = await supabase.auth.getSession();
          
          if (retryError || !retryData?.session) {
            console.error('❌ Retry failed:', retryError);
            if (isSubscribed) {
              setError('Authentication incomplete. Please try logging in again.');
              setProcessing(false);
              setTimeout(() => navigate('/', { replace: true }), 2000);
            }
            return;
          }
          
          console.log('✅ Session established on retry');
          if (isSubscribed) {
            window.history.replaceState({}, document.title, '/callback');
            setProcessing(false);
            setTimeout(() => {
              navigate('/test', { replace: true });
            }, 500);
          }
        } else {
          // No auth params, check if already logged in
          console.log('No auth params, checking existing session...');
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData?.session) {
            console.log('✅ Existing session found');
            if (isSubscribed) {
              navigate('/test', { replace: true });
            }
          } else {
            console.log('❌ No session found');
            if (isSubscribed) {
              setError('No active session. Redirecting...');
              setProcessing(false);
              setTimeout(() => navigate('/login', { replace: true }), 1500);
            }
          }
        }
      } catch (err) {
        console.error('💥 Callback error:', err);
        if (isSubscribed) {
          setError('An error occurred. Please try again.');
          setProcessing(false);
          setTimeout(() => navigate('/', { replace: true }), 2000);
        }
      }
    };

    handleAuthCallback();

    return () => {
      isSubscribed = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-400 mb-2 text-lg">{error}</div>
            <div className="text-zinc-500 text-sm">Redirecting...</div>
          </>
        ) : (
          <>
            <div className="text-zinc-400 mb-4 text-lg">
              {processing ? 'Processing authentication...' : 'Success! Redirecting...'}
            </div>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto"></div>
            <div className="mt-4 text-zinc-600 text-sm">
              {processing ? 'Please wait while we verify your Discord account' : 'Taking you to the dashboard'}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
