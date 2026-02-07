import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Callback } from './pages/Callback';
import { Home } from './pages/Home';
import Login from './pages/Login';
import { Test } from './pages/Test';
import { Admin } from './pages/Admin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Results } from './pages/Results';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/test" element={<ProtectedRoute><Test /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App;