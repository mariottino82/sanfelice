import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Download, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

export function Gallery() {
  const [media, setMedia] = React.useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

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
      }
    };
    fetchGallery();
  }, []);

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
      // Fallback: open in new tab if fetch fails due to CORS
      window.open(url, '_blank');
    }
  };

  const selectedItem = selectedIndex !== null ? media[selectedIndex] : null;

  const handleNext = React.useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex !== null && media.length > 0) {
      setSelectedIndex((selectedIndex + 1) % media.length);
    }
  }, [selectedIndex, media.length]);

  const handlePrev = React.useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIndex !== null && media.length > 0) {
      setSelectedIndex((selectedIndex - 1 + media.length) % media.length);
    }
  }, [selectedIndex, media.length]);

  // Keyboard navigation
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

  // Touch swipe handling
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-widest text-stone-500 font-semibold mb-2">I Nostri Ricordi</h2>
          <h3 className="text-4xl font-serif text-stone-900">Foto & Video Gallery</h3>
        </div>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
          {media.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              onClick={() => setSelectedIndex(index)}
              className="relative rounded-2xl overflow-hidden group cursor-pointer break-inside-avoid shadow-sm hover:shadow-xl transition-all duration-500"
            >
              {item.type === 'video' ? (
                <div className="w-full aspect-video bg-stone-100 flex items-center justify-center">
                  <img
                    src={item.url.includes('youtube.com') || item.url.includes('youtu.be') 
                      ? `https://img.youtube.com/vi/${item.url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg` 
                      : item.url}
                    alt={`Video thumbnail ${item.id}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      // Fallback if youtube thumbnail fails
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`Gallery item ${item.id}`}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
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
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden bg-stone-950/95 backdrop-blur-sm flex flex-col"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Header controls */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent">
              <div className="text-white/70 font-mono text-sm">
                {selectedIndex + 1} / {media.length}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(selectedItem.url);
                  }}
                  className="p-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md"
                  aria-label="Scarica"
                >
                  <Download className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(null);
                  }}
                  className="p-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md"
                  aria-label="Chiudi"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div 
              className="flex-1 flex items-center justify-center relative w-full h-full"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Navigation Arrows (Desktop) */}
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

              {/* Media Container */}
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
                    {selectedItem.url.includes('youtube.com') || selectedItem.url.includes('youtu.be') ? (
                      <iframe
                        src={selectedItem.url.includes('youtu.be') 
                          ? selectedItem.url.replace('youtu.be/', 'youtube.com/embed/') 
                          : selectedItem.url.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={selectedItem.url}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                ) : (
                  <img
                    src={selectedItem.url}
                    alt={`Gallery item ${selectedIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
