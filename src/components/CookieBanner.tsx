import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-[100]"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-stone-900" />
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-stone-900" />
              </div>
              <div className="space-y-3">
                <h4 className="font-serif text-stone-900 text-lg">Informativa sui Cookie</h4>
                <p className="text-stone-500 text-xs leading-relaxed">
                  Utilizziamo cookie tecnici per garantire il corretto funzionamento del sito e cookie di analisi per migliorare la tua esperienza. Proseguendo la navigazione acconsenti al loro utilizzo.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleAccept}
                    className="bg-stone-900 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-stone-800 transition-all active:scale-95"
                  >
                    Accetto
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-stone-500 text-[10px] font-medium hover:text-stone-900 transition-colors"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
