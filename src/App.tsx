/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { NewsEvents } from './components/NewsEvents';
import { Gallery } from './components/Gallery';
import { SponsorsSection } from './components/SponsorsSection';
import { Dashboard } from './components/Dashboard';
import { LotterySection } from './components/LotterySection';
import { PollSection } from './components/PollSection';
import { NewsDetail } from './components/NewsDetail';
import { RegistrationModal } from './components/RegistrationModal';
import { ContestRegistrationModal } from './components/ContestRegistrationModal';
import { ContestAnnouncement } from './components/ContestAnnouncement';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { CookiePolicy } from './components/CookiePolicy';
import { CookieBanner } from './components/CookieBanner';
import { SEO } from './components/SEO';
import { X, LogIn, Facebook, Instagram, Youtube, Twitter, Shield, Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  const [view, setView] = React.useState<'home' | 'privacy' | 'cookie'>('home');
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return localStorage.getItem('session_user') !== null;
  });
  const [user, setUser] = React.useState<any>(() => {
    const saved = localStorage.getItem('session_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = React.useState(false);
  const [showContestRegistrationModal, setShowContestRegistrationModal] = React.useState(false);
  const [selectedContest, setSelectedContest] = React.useState<any>(null);
  const [selectedNews, setSelectedNews] = React.useState<any>(null);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [socialLinks, setSocialLinks] = React.useState({
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    twitter: 'https://twitter.com'
  });

  const [apiStatus, setApiStatus] = React.useState<'checking' | 'ok' | 'error'>('checking');

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.ok ? setApiStatus('ok') : setApiStatus('error'))
      .catch(() => setApiStatus('error'));

    fetch('/api/settings/social_links')
      .then(res => res.json())
      .then(data => {
        if (data.value) setSocialLinks(data.value);
      })
      .catch(err => console.error('Error fetching social links:', err));
  }, []);

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

  const mainSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pro San Felice 2023",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo.png`,
    "description": "Associazione di promozione sociale e culturale dedicata alla valorizzazione del territorio e delle tradizioni di Colle d'Anchise e del Molise.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Via Salita la chiesa, 19",
      "addressLocality": "Colle d'Anchise",
      "addressRegion": "CB",
      "postalCode": "86020",
      "addressCountry": "IT"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+39 3476799004",
      "contactType": "customer service",
      "email": "sanfeliceassociazione@gmail.com"
    },
    "sameAs": [
      socialLinks.facebook,
      socialLinks.instagram,
      socialLinks.twitter,
      socialLinks.youtube
    ]
  };

  if (isLoggedIn) {
    return <Dashboard user={user} onLogout={() => { 
      setIsLoggedIn(false); 
      setUser(null); 
      localStorage.removeItem('session_user');
    }} />;
  }

  if (view === 'privacy') {
    return <PrivacyPolicy onBack={() => setView('home')} />;
  }

  if (view === 'cookie') {
    return <CookiePolicy onBack={() => setView('home')} />;
  }

  if (selectedNews) {
    return (
      <>
        <NewsDetail 
          item={selectedNews} 
          onBack={() => setSelectedNews(null)} 
          onRegisterClick={() => setShowRegistrationModal(true)} 
        />
        <RegistrationModal 
          isOpen={showRegistrationModal} 
          onClose={() => setShowRegistrationModal(false)} 
        />
      </>
    );
  }

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-stone-200">
        <SEO schema={mainSchema} />
        <Navbar onLoginClick={() => setShowLoginModal(true)} onRegisterClick={() => setShowRegistrationModal(true)} />
        <main>
          <Hero />
          <SponsorsSection />
          <PollSection />
          <LotterySection />
          <NewsEvents onNewsClick={(item) => setSelectedNews(item)} />
          <Gallery />
        </main>

        <ContestAnnouncement onRegisterClick={(contest) => {
          setSelectedContest(contest);
          setShowContestRegistrationModal(true);
        }} />

        <ContestRegistrationModal 
          isOpen={showContestRegistrationModal} 
          onClose={() => setShowContestRegistrationModal(false)} 
          contest={selectedContest} 
        />
        
        <RegistrationModal 
          isOpen={showRegistrationModal} 
          onClose={() => setShowRegistrationModal(false)} 
        />
        
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
                  <li>Email: sanfeliceassociazione@gmail.com</li>
                  <li>Tel: +39 3476799004</li>
                  <li>Sede: Via Salita la chiesa, 19 - Colle d'Anchise (CB)</li>
                  <li>C.F. 92083740701</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Seguici</h5>
                <div className="flex gap-4">
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-all">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all">
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              <p>&copy; {new Date().getFullYear()} Pro San Felice 2023. Tutti i diritti riservati.</p>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setView('privacy')}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Privacy Policy
                </button>
                <button 
                  onClick={() => setView('cookie')}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Cookie className="w-3.5 h-3.5" />
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>
        </footer>

        <CookieBanner />

        <AnimatePresence>
          {showLoginModal && (
            <div className="fixed inset-0 z-[100] overflow-y-auto p-2 md:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLoginModal(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />
              <div className="flex min-h-full items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden mx-2"
                >
                  <button 
                    onClick={() => setShowLoginModal(false)}
                    className="absolute top-3 right-3 md:top-6 md:right-6 text-stone-400 hover:text-stone-900 transition-colors z-50 p-1.5 md:p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-stone-100"
                    aria-label="Chiudi"
                  >
                    <X className="w-4.5 h-4.5 md:w-6 md:h-6" />
                  </button>
                  
                  <div className="text-center mb-5 md:mb-8">
                    <div className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 bg-stone-100 rounded-xl md:rounded-2xl mb-3 md:mb-4">
                      <LogIn className="w-5 h-5 md:w-8 md:h-8 text-stone-900" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-serif text-stone-900 leading-tight">Area Riservata</h3>
                    <p className="text-stone-500 text-[10px] md:text-sm mt-1.5 md:mt-2">Accedi per gestire l'associazione</p>
                    {apiStatus === 'error' && (
                      <div className="mt-3 md:mt-4 p-2.5 md:p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[9px] md:text-xs font-medium">
                        Attenzione: Il server non risponde. Verifica la connessione.
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleLogin} className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 ml-1">Username</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 ml-1">Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-stone-900 text-white py-3 md:py-4 rounded-xl font-bold hover:bg-stone-800 transition-all transform active:scale-95 shadow-lg shadow-stone-900/20 text-sm md:text-base mt-2"
                    >
                      Accedi ora
                    </button>
                  </form>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </HelmetProvider>
  );
}

