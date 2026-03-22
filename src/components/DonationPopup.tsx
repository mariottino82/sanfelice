import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Gift } from 'lucide-react';

interface DonationPopupProps {
  onOpenDonation: () => void;
}

export function DonationPopup({ onOpenDonation }: DonationPopupProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasBeenShown, setHasBeenShown] = React.useState(false);

  React.useEffect(() => {
    // Show popup after 20 seconds of initial load
    const timer = setTimeout(() => {
      const shown = sessionStorage.getItem('donation_popup_shown');
      if (!shown) {
        setIsVisible(true);
        setHasBeenShown(true);
        sessionStorage.setItem('donation_popup_shown', 'true');
      }
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleAction = () => {
    setIsVisible(false);
    onOpenDonation();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, y: 100, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-[90] max-w-sm w-full"
        >
          <div className="bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                </div>
                <div>
                  <h4 className="text-lg font-serif text-stone-900 mb-1">Sostieni la nostra Associazione</h4>
                  <p className="text-stone-500 text-xs leading-relaxed mb-4">
                    Ogni piccola offerta ci aiuta a mantenere vive le tradizioni di San Felice. Grazie per il tuo supporto!
                  </p>
                  <button
                    onClick={handleAction}
                    className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center gap-2"
                  >
                    Fai un'offerta <Gift className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="h-1 bg-red-500/10 w-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, ease: "linear" }}
                onAnimationComplete={handleClose}
                className="h-full bg-red-500"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
