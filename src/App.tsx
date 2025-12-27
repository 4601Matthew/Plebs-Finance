import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Cashflow from './components/Cashflow';
import Accounts from './components/Accounts';
import CreditCards from './components/CreditCards';
import Expenses from './components/Expenses';
import Bills from './components/Bills';
import Goals from './components/Goals';
import Profile from './components/Profile';
import Layout from './components/Layout';
import { User } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(!!userId || authStatus === 'true');
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUserId', user.id);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUserId');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout} currentUser={currentUser}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cashflow" element={<Cashflow />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/credit-cards" element={<CreditCards />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

