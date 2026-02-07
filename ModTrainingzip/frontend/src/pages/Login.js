// Import necessary libraries
import React from 'react';
import { supabase } from '../lib/supabase';

const Login = () => {
    const handleLogin = async () => {
        const domain = window.location.origin;
        await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: `${domain}/callback`
            }
        });
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 text-center">
                <h1 className="text-3xl font-bold text-white mb-6">Login to Void</h1>
                <button 
                    onClick={handleLogin}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-6 rounded transition-colors"
                >
                    Login with Discord
                </button>
            </div>
        </div>
    );
};

export default Login;