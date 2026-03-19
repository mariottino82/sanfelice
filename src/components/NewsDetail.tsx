import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Share2, Facebook, Twitter, Link as LinkIcon, PlayCircle, X, UserPlus, Mail, CheckCircle2 } from 'lucide-react';
import { SEO } from './SEO';

interface NewsDetailProps {
  item: any;
  onBack: () => void;
  onRegisterClick: () => void;
}

export function NewsDetail({ item, onBack, onRegisterClick }: NewsDetailProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    "description": item.content.substring(0, 160),
    "image": item.image || `${window.location.origin}/logo.png`,
    "datePublished": item.date,
    "author": {
      "@type": "Organization",
      "name": "Pro San Felice 2023"
    },
    ...(item.category === 'evento' ? {
      "startDate": item.date,
      "location": {
        "@type": "Place",
        "name": "Colle d'Anchise",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Colle d'Anchise",
          "addressRegion": "CB",
          "addressCountry": "IT"
        }
      }
    } : {})
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      <SEO 
        title={item.title} 
        description={item.content.substring(0, 160)} 
        image={item.image}
        type="article"
        schema={newsSchema}
      />
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
        <img 
          src={item.image || 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=800'} 
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

            {item.video && (
              <div className="mt-8 md:mt-12">
                <h3 className="text-xl md:text-2xl font-serif text-stone-900 mb-4 md:mb-6">Video dell'evento</h3>
                <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-200">
                  <a 
                    href={item.video} 
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
            <div className="sticky top-8 space-y-8 md:space-y-12">
              <div>
                <h4 className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 md:mb-6">Condividi</h4>
                <div className="flex flex-row lg:flex-col gap-3 md:gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                  <motion.button 
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShareFacebook}
                    className="flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-stone-50 text-stone-600 hover:bg-white hover:shadow-md transition-all text-xs md:text-sm font-semibold whitespace-nowrap border border-stone-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 flex items-center justify-center">
                      <Facebook className="w-4 h-4 text-[#1877F2]" />
                    </div>
                    Facebook
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShareTwitter}
                    className="flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-stone-50 text-stone-600 hover:bg-white hover:shadow-md transition-all text-xs md:text-sm font-semibold whitespace-nowrap border border-stone-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center">
                      <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                    </div>
                    Twitter
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyLink}
                    className="flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-stone-50 text-stone-600 hover:bg-white hover:shadow-md transition-all text-xs md:text-sm font-semibold whitespace-nowrap border border-stone-100"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${copied ? 'bg-emerald-100' : 'bg-stone-200'}`}>
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4 text-stone-600" />}
                    </div>
                    {copied ? 'Copiato!' : 'Copia Link'}
                  </motion.button>
                </div>
              </div>

              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 bg-gradient-to-br from-stone-900 to-stone-800 rounded-[2.5rem] text-white shadow-2xl shadow-stone-900/40 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="relative z-10 space-y-6">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                      <UserPlus className="w-7 h-7 text-white" />
                    </div>
                    
                    <div>
                      <h4 className="font-serif text-2xl mb-3 leading-tight">Diventa parte della nostra storia</h4>
                      <p className="text-stone-400 text-sm leading-relaxed">
                        Sostieni il territorio e accedi a eventi esclusivi riservati ai nostri soci.
                      </p>
                    </div>

                    <button 
                      onClick={onRegisterClick}
                      className="w-full bg-white text-stone-900 py-4 rounded-2xl font-bold text-sm hover:bg-stone-100 transition-all transform active:scale-95 shadow-xl shadow-white/5 flex items-center justify-center gap-2 group/btn"
                    >
                      Iscriviti Ora
                      <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>

                <div className="px-4">
                  <p className="text-stone-400 text-xs mb-4 text-center uppercase tracking-widest font-bold">Hai domande?</p>
                  <motion.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="mailto:sanfeliceassociazione@gmail.com"
                    className="flex items-center justify-center gap-3 text-stone-600 hover:text-stone-900 transition-colors py-3 border-2 border-stone-100 rounded-2xl font-bold text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Scrivici un'email
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
