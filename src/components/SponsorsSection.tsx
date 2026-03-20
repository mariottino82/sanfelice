import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface Sponsor {
  id: number;
  name: string;
  image: string;
}

interface SponsorItemProps {
  sponsor: Sponsor;
  index: number;
}

const SponsorItem: React.FC<SponsorItemProps> = ({ sponsor, index }) => {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <div
      ref={itemRef}
      className="relative h-[70vh] w-full overflow-hidden flex items-center justify-center border-b border-white/5"
    >
      <motion.div 
        style={{ y, scale, opacity }}
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src={sponsor.image} 
          alt={sponsor.name} 
          className="w-full h-full object-cover brightness-[0.4]"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, margin: "-100px" }}
        >
          <h3 className="text-5xl md:text-9xl font-serif text-white font-bold tracking-tighter mb-6 drop-shadow-2xl">
            {sponsor.name}
          </h3>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-emerald-500/50 flex-1" />
            <span className="text-white/40 text-[10px] uppercase tracking-[0.5em] font-bold">Official Sponsor</span>
            <div className="h-px bg-emerald-500/50 flex-1" />
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-12 left-12 text-white/10 font-mono text-[120px] font-bold select-none pointer-events-none hidden lg:block">
        0{index + 1}
      </div>
    </div>
  );
};

export function SponsorsSection() {
  const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetch('/api/sponsors/active')
      .then(res => res.json())
      .then(data => setSponsors(data))
      .catch(err => console.error('Error fetching active sponsors:', err));
  }, []);

  if (sponsors.length === 0) return null;

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

      <div className="flex flex-col">
        {sponsors.map((sponsor, index) => (
          <SponsorItem key={sponsor.id} sponsor={sponsor} index={index} />
        ))}
      </div>
    </section>
  );
}
