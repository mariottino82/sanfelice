import { motion } from 'motion/react';
import { ArrowRight, Facebook } from 'lucide-react';

export function Hero() {
  return (
    <section id="home" className="relative h-screen flex items-center overflow-hidden bg-stone-900">
      {/* Background with parallax effect or overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=2000"
          alt="San Felice Festival"
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/40 to-transparent" />
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block text-stone-400 uppercase tracking-[0.3em] text-xs font-bold mb-6">
              Dal 2023 al servizio della comunità
            </span>
            <h1 className="text-6xl md:text-8xl font-serif text-white mb-8 leading-[0.9] tracking-tighter">
              Vivi la <br />
              <span className="italic text-stone-300">Tradizione</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-300 mb-10 max-w-lg font-light leading-relaxed">
              L'Associazione Pro San Felice 2023 è il cuore pulsante della nostra comunità. 
              Uniamo generazioni attraverso la cultura, l'arte e l'amore per il nostro territorio.
            </p>
            
            <div className="flex flex-wrap gap-6 items-center">
              <motion.a
                href="#news"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-stone-900 px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-stone-100 transition-all flex items-center gap-2 group"
              >
                Scopri gli Eventi
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white border-b border-white/30 pb-1 text-sm uppercase tracking-widest font-bold hover:border-white transition-all group"
              >
                <Facebook className="w-4 h-4 text-[#1877F2] group-hover:scale-110 transition-transform" />
                Seguici su Facebook
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-12 right-12 hidden lg:block">
        <div className="flex items-center gap-4 text-white/20 rotate-90 origin-right">
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold">Scorri per esplorare</span>
          <div className="w-24 h-[1px] bg-white/20" />
        </div>
      </div>
    </section>
  );
}
