import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar, Facebook, Twitter, Link as LinkIcon, PlayCircle, X, UserPlus, Mail, CheckCircle2 } from 'lucide-react';
import { SEO } from './SEO';

interface NewsDetailProps {
  item: any;
  onBack: () => void;
  onRegisterClick: () => void;
}

export function NewsDetail({ item, onBack, onRegisterClick }: NewsDetailProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  if (!item) return null;

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(item.title)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const newsSchema = {
    "@context": "https://schema.org",
    "@type": item.category === 'evento' ? 'Event' : 'NewsArticle',
    "headline": item.title,
    "name": item.title,
    "description": (item.content || '').substring(0, 160),
    "image": item.image || `${window.location.origin}/logo.png`,
    "datePublished": item.date,
    "author": {
      "@type": "Organization",
      "name": "Pro San Felice 2023"
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
        onClick={onBack}
      >
        <SEO 
          title={item.title} 
          description={(item.content || '').substring(0, 160)} 
          image={item.image}
          type="article"
          schema={newsSchema}
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-white rounded-2xl sm:rounded-[2.5rem] overflow-hidden max-w-4xl w-full max-h-[92vh] sm:max-h-[88vh] shadow-2xl flex flex-col md:flex-row relative my-auto border border-stone-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onBack}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 p-2 sm:p-2.5 bg-stone-900/80 text-white hover:bg-stone-900 sm:bg-white/90 sm:text-stone-900 sm:hover:bg-white backdrop-blur-md rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Side: Image / Poster Area (Auto-scaled & Responsive) */}
          <div className="w-full md:w-1/2 min-h-[200px] xs:min-h-[240px] sm:min-h-[280px] md:min-h-[440px] max-h-[300px] xs:max-h-[340px] md:max-h-none relative flex-shrink-0 bg-stone-950 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            {/* Blurred background for seamless ratio padding */}
            <img 
              src={item.image || 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=800'} 
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
              aria-hidden="true"
            />
            {/* Main foreground image with object-contain so NO text/photo is cut off */}
            <img 
              src={item.image || 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=800'} 
              alt={item.title}
              className="relative z-10 w-full h-full max-h-[260px] xs:max-h-[300px] md:max-h-[480px] object-contain rounded-xl drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden pointer-events-none z-10" />

            {/* Mobile Category Badge Overlay */}
            <div className="absolute bottom-3 left-4 right-12 text-white md:hidden z-20">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white inline-block mb-1 shadow-sm ${
                item.category === 'evento' ? 'bg-amber-500' : 'bg-stone-900'
              }`}>
                {item.category || 'Notizia'}
              </span>
              <h2 className="text-base sm:text-lg font-serif text-white leading-tight line-clamp-2">{item.title}</h2>
            </div>
          </div>

          {/* Right Side: Details & Scrollable Content */}
          <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col justify-between space-y-4 sm:space-y-6">
            <div>
              {/* Desktop Header */}
              <div className="hidden md:block mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-2 inline-block shadow-sm ${
                  item.category === 'evento' ? 'bg-amber-500' : 'bg-stone-900'
                }`}>
                  {item.category || 'Notizia'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 leading-tight font-bold">
                  {item.title}
                </h1>
                <div className="flex items-center gap-2 text-stone-500 text-xs mt-2 font-medium">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>
                    {new Date(item.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Main Text Content */}
              <div className="prose prose-stone prose-sm max-w-none">
                <p className="text-stone-600 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm md:text-base break-words">
                  {item.content}
                </p>
              </div>

              {/* Video if present */}
              {item.video && (
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Video dell'evento</h4>
                  <a 
                    href={item.video} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors text-stone-800 font-bold text-xs"
                  >
                    <PlayCircle className="w-5 h-5 text-red-600" />
                    <span>Guarda il video su YouTube / Media</span>
                  </a>
                </div>
              )}
            </div>

            {/* Actions & Sharing Footer */}
            <div className="pt-4 border-t border-stone-100 space-y-4 mt-auto">
              {/* Share section */}
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Condividi</p>
                <div className="flex gap-2">
                  <button 
                    onClick={handleShareFacebook}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-stone-50 text-stone-700 hover:bg-stone-100 transition-all text-xs font-semibold border border-stone-200"
                  >
                    <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                    <span>Facebook</span>
                  </button>
                  <button 
                    onClick={handleShareTwitter}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-stone-50 text-stone-700 hover:bg-stone-100 transition-all text-xs font-semibold border border-stone-200"
                  >
                    <Twitter className="w-3.5 h-3.5 text-[#1DA1F2]" />
                    <span>X</span>
                  </button>
                  <button 
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-stone-50 text-stone-700 hover:bg-stone-100 transition-all text-xs font-semibold border border-stone-200"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5 text-stone-500" />}
                    <span>{copied ? 'Copiato!' : 'Copia'}</span>
                  </button>
                </div>
              </div>

              {/* Call to Action button */}
              <button
                onClick={() => {
                  onBack();
                  onRegisterClick();
                }}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 sm:py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2 transform active:scale-[0.99]"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                Unisciti / Partecipa
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
