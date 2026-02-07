import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Callback } from './pages/Callback';
import { Home } from './pages/Home';
import Login from './pages/Login';
import { Test } from './pages/Test';
import { Admin } from './pages/Admin';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/test" element={<Test />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Router>
    );
}

export default App;