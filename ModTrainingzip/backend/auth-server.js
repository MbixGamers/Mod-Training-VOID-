// auth-server.js

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(cookieParser());

// Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/auth/discord', (req, res) => {
    // Generate Discord OAuth2 URL
    const discordOAuthUrl = `https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URL&response_type=code&scope=identify%20email`;
    res.redirect(discordOAuthUrl);
});

app.get('/auth/discord/callback', async (req, res) => {
    const { code } = req.query;
    // Exchange code for access token
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: 'YOUR_CLIENT_ID',
            client_secret: 'YOUR_CLIENT_SECRET',
            code,
            grant_type: 'authorization_code',
            redirect_uri: 'YOUR_REDIRECT_URL'
        })
    });
    const data = await response.json();

    // Access token is here
    if (data.access_token) {
        // Now you can query user information
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${data.access_token}`
            }
        });
        const userData = await userResponse.json();

        // Store user in Supabase
        const { error } = await supabase
            .from('users')
            .upsert({ discord_id: userData.id, email: userData.email, username: userData.username });

        if (error) return res.status(500).send('Error storing user data');

        // Send response or redirect user
        res.send('Authentication successful!');
    } else {
        res.status(400).send('Failed to obtain access token');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
