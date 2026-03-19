import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Share2, Facebook, Twitter, Link as LinkIcon, PlayCircle, X, UserPlus } from 'lucide-react';

interface NewsDetailProps {
  item: any;
  onBack: () => void;
  onRegisterClick: () => void;
}

export function NewsDetail({ item, onBack, onRegisterClick }: NewsDetailProps) {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
        <img 
          src={item.imageUrl || 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=800'} 
          alt={item.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4 md:top-8 md:left-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-xs md:text-sm hover:bg-white/20 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden xs:inline">Torna indietro</span>
            <span className="xs:hidden">Indietro</span>
          </button>
        </div>

        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <button 
            onClick={onBack}
            className="bg-white/10 backdrop-blur-md text-white p-2 md:p-3 rounded-full hover:bg-white/20 transition-all"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="absolute bottom-6 md:bottom-12 left-0 w-full">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <span className={`px-3 md:px-4 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-4 inline-block ${
              item.category === 'evento' ? 'bg-amber-500 text-white' : 'bg-white text-stone-900'
            }`}>
              {item.category}
            </span>
            <h1 className="text-2xl md:text-6xl font-serif text-white mb-3 md:mb-6 leading-tight">
              {item.title}
            </h1>
            <div className="flex items-center gap-4 md:gap-6 text-white/80 text-xs md:text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                {new Date(item.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="lg:col-span-3">
            <div className="prose prose-stone prose-sm md:prose-lg max-w-none">
              <p className="text-stone-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {item.content}
              </p>
            </div>

            {item.videoUrl && (
              <div className="mt-8 md:mt-12">
                <h3 className="text-xl md:text-2xl font-serif text-stone-900 mb-4 md:mb-6">Video dell'evento</h3>
                <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-200">
                  <a 
                    href={item.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 md:gap-4 text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    <PlayCircle className="w-12 h-12 md:w-16 md:h-16" />
                    <span className="font-bold text-[10px] md:text-sm uppercase tracking-widest">Guarda il video</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Share */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6 md:space-y-8">
              <div>
                <h4 className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 md:mb-4">Condividi</h4>
                <div className="flex flex-row lg:flex-col gap-2 md:gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  <button className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-xl bg-stone-50 text-stone-600 hover:bg-stone-100 transition-colors text-xs md:text-sm font-medium whitespace-nowrap">
                    <Facebook className="w-4 h-4 md:w-5 md:h-5 text-[#1877F2]" />
                    Facebook
                  </button>
                  <button className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-xl bg-stone-50 text-stone-600 hover:bg-stone-100 transition-colors text-xs md:text-sm font-medium whitespace-nowrap">
                    <Twitter className="w-4 h-4 md:w-5 md:h-5 text-[#1DA1F2]" />
                    Twitter
                  </button>
                  <button className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-xl bg-stone-50 text-stone-600 hover:bg-stone-100 transition-colors text-xs md:text-sm font-medium whitespace-nowrap">
                    <LinkIcon className="w-4 h-4 md:w-5 md:h-5" />
                    Copia Link
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-stone-900 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-2xl shadow-stone-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16" />
                <div className="relative z-10 space-y-4 md:space-y-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl md:text-2xl mb-1 md:mb-2">Partecipa anche tu</h4>
                    <p className="text-stone-400 text-xs md:text-sm leading-relaxed">
                      Unisciti alla nostra associazione per sostenere il territorio e non perdere i prossimi eventi esclusivi.
                    </p>
                  </div>
                  <button 
                    onClick={onRegisterClick}
                    className="w-full bg-white text-stone-900 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm hover:bg-stone-100 transition-all transform active:scale-95 shadow-lg shadow-white/10 flex items-center justify-center gap-2"
                  >
                    Diventa Socio Ora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
