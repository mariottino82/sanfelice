import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Sponsor {
  id: number;
  name: string;
  image: string;
}

export function SponsorsSection() {
  const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetch('/api/sponsors/active')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSponsors(data);
        }
      })
      .catch(err => console.error('Error fetching active sponsors:', err));
  }, []);

  React.useEffect(() => {
    if (sponsors.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [sponsors.length]);

  if (sponsors.length === 0) return null;

  const currentSponsor = sponsors[currentIndex];

  return (
    <section ref={containerRef} className="relative py-24 overflow-hidden bg-stone-900">
      <div className="container mx-auto px-4 mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <span className="text-emerald-500 font-bold tracking-[0.3em] uppercase text-xs">Sponsor & Partner</span>
          <h2 className="text-4xl md:text-6xl font-serif text-white">Sostieni la Tradizione</h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full" />
        </motion.div>
      </div>

      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSponsor.id}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full flex items-center justify-center"
          >
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              {currentSponsor.image && (
                <img 
                  src={currentSponsor.image} 
                  alt={currentSponsor.name} 
                  className="w-full h-full object-cover brightness-[0.3]"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 via-transparent to-stone-900/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 w-full max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h3 className="text-5xl md:text-8xl lg:text-9xl font-serif text-white font-bold tracking-tighter mb-8 drop-shadow-2xl">
                  {currentSponsor.name}
                </h3>
                <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
                  <div className="h-px bg-emerald-500/50 flex-1" />
                  <span className="text-emerald-400 text-[10px] md:text-xs uppercase tracking-[0.5em] font-bold whitespace-nowrap">Official Sponsor</span>
                  <div className="h-px bg-emerald-500/50 flex-1" />
                </div>
              </motion.div>
            </div>

            {/* Index Display */}
            <div className="absolute bottom-12 left-12 text-white/5 font-mono text-[100px] md:text-[150px] font-bold select-none pointer-events-none leading-none">
              {(currentIndex + 1).toString().padStart(2, '0')}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        {sponsors.length > 1 && (
          <div className="absolute bottom-12 right-12 flex gap-3 z-20">
            {sponsors.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  idx === currentIndex ? 'bg-emerald-500 w-8' : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to sponsor ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
