import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Share2, Facebook, Twitter, Link as LinkIcon, PlayCircle, X } from 'lucide-react';

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
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={item.imageUrl || 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=800'} 
          alt={item.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-8 left-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-white/20 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Torna indietro
          </button>
        </div>

        <div className="absolute top-8 right-8">
          <button 
            onClick={onBack}
            className="bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all"
            aria-label="Chiudi"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute bottom-12 left-0 w-full">
          <div className="max-w-4xl mx-auto px-8">
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block ${
              item.category === 'evento' ? 'bg-amber-500 text-white' : 'bg-white text-stone-900'
            }`}>
              {item.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
              {item.title}
            </h1>
            <div className="flex items-center gap-6 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {new Date(item.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            <div className="prose prose-stone prose-lg max-w-none">
              <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>
            </div>

            {item.videoUrl && (
              <div className="mt-12">
                <h3 className="text-2xl font-serif text-stone-900 mb-6">Video dell'evento</h3>
                <div className="aspect-video rounded-3xl overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-200">
                  <a 
                    href={item.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-4 text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    <PlayCircle className="w-16 h-16" />
                    <span className="font-bold text-sm uppercase tracking-widest">Guarda il video</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Share */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Condividi</h4>
                <div className="flex flex-col gap-3">
                  <button className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 text-stone-600 hover:bg-stone-100 transition-colors text-sm font-medium">
                    <Facebook className="w-5 h-5 text-[#1877F2]" />
                    Facebook
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 text-stone-600 hover:bg-stone-100 transition-colors text-sm font-medium">
                    <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                    Twitter
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 text-stone-600 hover:bg-stone-100 transition-colors text-sm font-medium">
                    <LinkIcon className="w-5 h-5" />
                    Copia Link
                  </button>
                </div>
              </div>

              <div className="p-6 bg-stone-900 rounded-3xl text-white">
                <h4 className="font-serif text-xl mb-4">Partecipa anche tu</h4>
                <p className="text-stone-400 text-sm mb-6">Unisciti alla nostra associazione per non perdere i prossimi eventi.</p>
                <button 
                  onClick={onRegisterClick}
                  className="w-full bg-white text-stone-900 py-3 rounded-xl font-bold text-sm hover:bg-stone-100 transition-colors"
                >
                  Diventa Socio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
