import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft } from 'lucide-react';

export const PrivacyPolicy = ({ onBack }: { onBack: () => void }) => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Torna alla Home
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-stone-100"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-stone-900" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-stone-900">Informativa sulla Privacy</h1>
          </div>

          <div className="prose prose-stone max-w-none space-y-6 text-stone-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">1. Titolare del Trattamento</h2>
              <p>
                Il Titolare del trattamento è l'<strong>Associazione Pro San Felice 2023</strong>, con sede legale in Via Salita la chiesa, 19 - Colle d'Anchise (CB), C.F. 92083740701. 
                Email di contatto: sanfeliceassociazione@gmail.com.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">2. Tipologia di Dati Raccolti</h2>
              <p>
                I dati personali raccolti tramite questo sito includono:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Dati identificativi (nome, cognome, email, telefono) forniti volontariamente tramite i moduli di iscrizione o contatto.</li>
                <li>Dati di navigazione raccolti automaticamente (indirizzo IP, tipo di browser, tempi di accesso).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">3. Finalità del Trattamento</h2>
              <p>I dati sono trattati per le seguenti finalità:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Gestione delle iscrizioni all'associazione e ai concorsi.</li>
                <li>Invio di comunicazioni relative alle attività istituzionali e agli eventi.</li>
                <li>Adempimento di obblighi di legge e regolamentari.</li>
                <li>Miglioramento dell'esperienza di navigazione sul sito.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">4. Base Giuridica</h2>
              <p>
                Il trattamento si fonda sul consenso dell'interessato, sull'esecuzione di un contratto (iscrizione) e sul legittimo interesse del Titolare nel promuovere le proprie attività culturali e sociali.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">5. Modalità e Durata del Trattamento</h2>
              <p>
                Il trattamento viene effettuato con strumenti informatici e/o cartacei, con logiche strettamente correlate alle finalità indicate. I dati saranno conservati per il tempo necessario a conseguire le finalità per cui sono stati raccolti o secondo quanto previsto dalle norme di legge.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">6. Diritti dell'Interessato</h2>
              <p>
                Ai sensi del GDPR (Regolamento UE 2016/679), l'utente ha il diritto di:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Accedere ai propri dati e riceverne copia.</li>
                <li>Chiedere la rettifica o la cancellazione degli stessi.</li>
                <li>Limitare il trattamento o opporsi ad esso.</li>
                <li>Revocare il consenso in qualsiasi momento.</li>
              </ul>
              <p className="mt-4">
                Per esercitare tali diritti, è possibile inviare una comunicazione all'indirizzo email: sanfeliceassociazione@gmail.com.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">7. Modifiche all'Informativa</h2>
              <p>
                Il Titolare si riserva il diritto di modificare la presente informativa in qualsiasi momento. Si consiglia di consultare regolarmente questa pagina per verificare eventuali aggiornamenti.
              </p>
            </section>

            <div className="pt-8 border-t border-stone-100 text-sm italic">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
