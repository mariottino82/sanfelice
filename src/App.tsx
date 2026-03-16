/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { NewsEvents } from './components/NewsEvents';
import { Gallery } from './components/Gallery';
import { Dashboard } from './components/Dashboard';
import { LotterySection } from './components/LotterySection';
import { PollSection } from './components/PollSection';
import { NewsDetail } from './components/NewsDetail';
import { X, LogIn, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return localStorage.getItem('session_user') !== null;
  });
  const [user, setUser] = React.useState<any>(() => {
    const saved = localStorage.getItem('session_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [selectedNews, setSelectedNews] = React.useState<any>(null);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
        setShowLoginModal(false);
        localStorage.setItem('session_user', JSON.stringify(data.user));
      } else {
        alert(data.message || 'Credenziali errate. Per i soci: usa la tua email come username e "socio" come password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Errore durante il login. Riprova più tardi.');
    }
  };

  if (isLoggedIn) {
    return <Dashboard user={user} onLogout={() => { 
      setIsLoggedIn(false); 
      setUser(null); 
      localStorage.removeItem('session_user');
    }} />;
  }

  if (selectedNews) {
    return <NewsDetail item={selectedNews} onBack={() => setSelectedNews(null)} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-stone-200">
      <Navbar onLoginClick={() => setShowLoginModal(true)} />
      <main>
        <Hero />
        <PollSection />
        <LotterySection />
        <NewsEvents onNewsClick={(item) => setSelectedNews(item)} />
        <Gallery />
      </main>
      
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-white font-serif text-xl mb-4">Pro San Felice 2023</h4>
              <p className="text-sm leading-relaxed">
                Associazione di promozione sociale e culturale dedicata alla valorizzazione del territorio e delle tradizioni di San Felice.
              </p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Contatti</h5>
              <ul className="space-y-2 text-sm">
                <li>Email: info@prosanfelice.it</li>
                <li>Tel: +39 3476799004</li>
                <li>Sede: Via Salita la chiesa, 18 - Colle d'Anchise (CB)</li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Seguici</h5>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 text-center text-xs">
            <p>&copy; {new Date().getFullYear()} Pro San Felice 2023. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors z-10 p-2 hover:bg-stone-100 rounded-full"
                aria-label="Chiudi"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-2xl mb-4">
                  <LogIn className="w-8 h-8 text-stone-900" />
                </div>
                <h3 className="text-2xl font-serif text-stone-900">Area Riservata</h3>
                <p className="text-stone-500 text-sm mt-2">Accedi per gestire l'associazione</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Username</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all transform active:scale-95 shadow-lg shadow-stone-900/20"
                >
                  Accedi ora
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

