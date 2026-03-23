import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Download, Maximize2, ChevronLeft, ChevronRight, ArrowLeft, Image as ImageIcon, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SEO } from '../components/SEO';

export function GalleryPage({ onLoginClick, onRegisterClick, onDonationClick }: any) {
  const [media, setMedia] = React.useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'image' | 'video'>('all');

  React.useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/gallery');
        const data = await response.json();
        if (data.length > 0) {
          setMedia(data);
        } else {
          // Fallback to default if nothing in database
          const defaultMedia = [
            { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800' },
            { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=800' },
            { id: 3, type: 'video', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800' },
            { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800' },
            { id: 5, type: 'image', url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800' },
            { id: 6, type: 'video', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800' },
          ];
          setMedia(defaultMedia);
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
    window.scrollTo(0, 0);
  }, []);

  const filteredMedia = media.filter(item => filter === 'all' || item.type === filter);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `pro-san-felice-gallery-${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const selectedItem = selectedIndex !== null ? filteredMedia[selectedIndex] : null;

  const handleNext = React.useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex !== null && filteredMedia.length > 0) {
      setSelectedIndex((selectedIndex + 1) % filteredMedia.length);
    }
  }, [selectedIndex, filteredMedia.length]);

  const handlePrev = React.useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex !== null && filteredMedia.length > 0) {
      setSelectedIndex((selectedIndex - 1 + filteredMedia.length) % filteredMedia.length);
    }
  }, [selectedIndex, filteredMedia.length]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  return (
    <div className="min-h-screen bg-stone-50">
      <SEO 
        title="Gallery - Pro San Felice" 
        description="Esplora i momenti più belli catturati durante i nostri eventi e attività."
      />
      <Navbar 
        onLoginClick={onLoginClick} 
        onRegisterClick={onRegisterClick} 
        onDonationClick={onDonationClick}
      />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Torna alla Home
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-5xl font-serif text-stone-900 mb-4">Foto & Video Gallery</h1>
                <p className="text-stone-600 max-w-2xl">
                  Rivivi i momenti più significativi della nostra comunità attraverso questa raccolta di immagini e video.
                </p>
              </div>
              
              <div className="flex bg-white p-1 rounded-2xl border border-stone-200 shadow-sm self-start md:self-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    filter === 'all' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Tutti
                </button>
                <button
                  onClick={() => setFilter('image')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    filter === 'image' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Foto
                </button>
                <button
                  onClick={() => setFilter('video')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    filter === 'video' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  Video
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
              {filteredMedia.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedIndex(index)}
                  className="relative rounded-2xl overflow-hidden group cursor-pointer break-inside-avoid shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-100"
                >
                  {item.type === 'video' ? (
                    <div className="w-full aspect-video bg-stone-100 flex items-center justify-center relative group">
                      {(item.url.includes('youtube.com') || item.url.includes('youtu.be')) && (
                        <img
                          src={`https://img.youtube.com/vi/${item.url.includes('youtu.be') ? item.url.split('/').pop()?.split('?')[0] : item.url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`}
                          alt={`Video thumbnail ${item.id}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800';
                          }}
                        />
                      )}
                      {!(item.url.includes('youtube.com') || item.url.includes('youtu.be')) && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-white/50 group-hover:bg-stone-800 transition-colors">
                          <Play className="w-12 h-12 mb-2 opacity-50" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Video Locale</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    item.url && (
                      <img
                        src={item.url}
                        alt={`Gallery item ${item.id}`}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const card = target.closest('.break-inside-avoid');
                          if (card) (card as HTMLElement).style.display = 'none';
                        }}
                      />
                    )
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    {item.type === 'video' ? (
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 self-center mb-auto mt-auto">
                        <Play className="w-5 h-5 text-white fill-white ml-1" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 self-center mb-auto mt-auto transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {filteredMedia.length === 0 && (
                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-stone-200">
                  <ImageIcon className="w-16 h-16 text-stone-200 mx-auto mb-6" />
                  <p className="text-stone-400 font-serif text-xl">Nessun elemento trovato in questa categoria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-hidden bg-stone-950/95 backdrop-blur-sm flex flex-col"
            onClick={() => setSelectedIndex(null)}
          >
            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent">
              <div className="text-white/70 font-mono text-sm">
                {selectedIndex + 1} / {filteredMedia.length}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(selectedItem.url);
                  }}
                  className="p-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md"
                >
                  <Download className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(null);
                  }}
                  className="p-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative w-full h-full">
              <button
                onClick={handlePrev}
                className="absolute left-4 md:left-8 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md transition-all z-50 hidden md:flex"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 md:right-8 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md transition-all z-50 hidden md:flex"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full h-full p-4 md:p-16 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedItem.type === 'video' ? (
                  <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    {selectedItem.url && (selectedItem.url.includes('youtube.com') || selectedItem.url.includes('youtu.be')) ? (
                      <iframe
                        src={selectedItem.url.includes('youtu.be') 
                          ? `https://www.youtube.com/embed/${selectedItem.url.split('/').pop()?.split('?')[0]}` 
                          : `https://www.youtube.com/embed/${selectedItem.url.split('v=')[1]?.split('&')[0]}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      selectedItem.url && (
                        <video
                          src={selectedItem.url}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                      )
                    )}
                  </div>
                ) : (
                  selectedItem.url && (
                    <img
                      src={selectedItem.url}
                      alt={`Gallery item ${selectedIndex + 1}`}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                  )
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
