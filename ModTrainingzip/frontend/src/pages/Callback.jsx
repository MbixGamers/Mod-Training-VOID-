import React from 'react';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const Callback = () => {
    const history = useHistory();

    useEffect(() => {
        // Simulate an authentication process (this should include your actual logic)
        const authenticateUser = () => {
            // Here you would normally handle the OAuth token
            // After success, redirect to test page
            history.push('/test');
        };

        authenticateUser();
    }, [history]);

    return <div>Loading...</div>;
};

export default Callback;
