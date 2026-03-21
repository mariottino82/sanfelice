import React from 'react';
import { motion } from 'motion/react';
import { Menu, X, Home, Calendar, Image as ImageIcon, LayoutDashboard, LogIn, Newspaper } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function Navbar({ onLoginClick, onRegisterClick }: { onLoginClick: () => void, onRegisterClick: () => void }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { name: 'Home', href: '#home', icon: Home },
    { name: 'News', href: '#news', icon: Newspaper },
    { name: 'Eventi', href: '#eventi', icon: Calendar },
    { name: 'Gallery', href: '#gallery', icon: ImageIcon },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Logo Pro San Felice" 
                className="w-full h-full object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-2xl font-serif font-bold text-stone-900">Pro San Felice</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
              >
                {item.name}
              </a>
            ))}
            <div className="flex items-center gap-3">
              <button 
                onClick={onRegisterClick}
                className="text-stone-900 border border-stone-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                Diventa Socio
              </button>
              <button 
                onClick={onLoginClick}
                className="bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-stone-800 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Accedi
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-600 hover:text-stone-900"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-stone-200"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-stone-600 hover:text-stone-900 font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <button 
              onClick={() => {
                setIsOpen(false);
                onRegisterClick();
              }}
              className="w-full text-left px-3 py-2 text-stone-900 font-bold flex items-center gap-2"
            >
              Diventa Socio
            </button>
            <button 
              onClick={() => {
                setIsOpen(false);
                onLoginClick();
              }}
              className="w-full text-left px-3 py-2 text-stone-900 font-bold flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Accedi
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
