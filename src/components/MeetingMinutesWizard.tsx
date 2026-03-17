import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Calendar, MapPin, Users, List, MessageSquare, CheckCircle2, Download, Plus, Trash2, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface MeetingMinutesWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AgendaItem {
  id: string;
  title: string;
  discussion: string;
  decision: string;
}

export function MeetingMinutesWizard({ isOpen, onClose, onSuccess }: MeetingMinutesWizardProps) {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '21:00',
    location: 'Sede Sociale - Via Salita la chiesa, 18',
    type: 'Assemblea Ordinaria',
    president: 'Presidente in carica',
    secretary: '',
    attendees: '',
    agenda: [] as AgendaItem[],
  });

  const addAgendaItem = () => {
    const newItem: AgendaItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      discussion: '',
      decision: '',
    };
    setFormData({ ...formData, agenda: [...formData.agenda, newItem] });
  };

  const removeAgendaItem = (id: string) => {
    setFormData({ ...formData, agenda: formData.agenda.filter(item => item.id !== id) });
  };

  const updateAgendaItem = (id: string, field: keyof AgendaItem, value: string) => {
    setFormData({
      ...formData,
      agenda: formData.agenda.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('PRO SAN FELICE 2023', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Associazione di Promozione Sociale', 105, y, { align: 'center' });
    y += 5;
    doc.text('San Felice del Molise (CB)', 105, y, { align: 'center' });
    y += 15;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('VERBALE DI ADUNANZA', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(14);
    doc.text(formData.title.toUpperCase(), 105, y, { align: 'center' });
    y += 15;

    // General Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const introText = `L'anno ${formData.date.split('-')[0]}, il giorno ${formData.date.split('-')[2]} del mese di ${new Date(formData.date).toLocaleString('it-IT', { month: 'long' })}, alle ore ${formData.time}, presso ${formData.location}, si è riunita l'${formData.type} dell'Associazione "Pro San Felice 2023".`;
    
    const splitIntro = doc.splitTextToSize(introText, 170);
    doc.text(splitIntro, margin, y);
    y += (splitIntro.length * 6) + 5;

    // Attendees
    doc.setFont('helvetica', 'bold');
    doc.text('Presidenza e Segreteria:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Assume la presidenza il Sig. ${formData.president}.`, margin, y);
    y += 6;
    doc.text(`Funge da segretario il Sig. ${formData.secretary}.`, margin, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Presenti:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    const attendeesText = formData.attendees || 'Tutti i soci regolarmente iscritti.';
    const splitAttendees = doc.splitTextToSize(attendeesText, 170);
    doc.text(splitAttendees, margin, y);
    y += (splitAttendees.length * 6) + 10;

    // Agenda
    doc.setFont('helvetica', 'bold');
    doc.text('ORDINE DEL GIORNO:', margin, y);
    y += 8;
    formData.agenda.forEach((item, index) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`${index + 1}. ${item.title}`, margin + 5, y);
      y += 6;
    });
    y += 10;

    // Discussion
    doc.setFont('helvetica', 'bold');
    doc.text('SVOLGIMENTO E DELIBERAZIONI:', margin, y);
    y += 8;

    formData.agenda.forEach((item, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Punto ${index + 1}: ${item.title}`, margin, y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      const discText = `Discussione: ${item.discussion}`;
      const splitDisc = doc.splitTextToSize(discText, 170);
      doc.text(splitDisc, margin + 5, y);
      y += (splitDisc.length * 6) + 2;

      const decText = `Deliberazione: ${item.decision}`;
      const splitDec = doc.splitTextToSize(decText, 170);
      doc.setFont('helvetica', 'italic');
      doc.text(splitDec, margin + 5, y);
      y += (splitDec.length * 6) + 8;
    });

    // Footer
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    y += 20;
    doc.setFont('helvetica', 'normal');
    doc.text('Non essendovi altro da deliberare, la seduta è tolta alle ore ________.', margin, y);
    y += 30;

    // Signatures
    doc.text('Il Segretario', margin + 20, y);
    doc.text('Il Presidente', 130, y);
    y += 15;
    doc.text('__________________________', margin + 10, y);
    doc.text('__________________________', 120, y);

    doc.save(`Verbale_${formData.date}_${formData.title.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          date: formData.date,
          content: JSON.stringify(formData)
        })
      });

      if (response.ok) {
        generatePDF();
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error saving minutes:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] overflow-y-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="flex min-h-full items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-stone-900">Nuovo Verbale</h3>
                    <p className="text-stone-500 text-sm">Step {step} di 4</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white rounded-full transition-colors border border-stone-200 shadow-sm"
                >
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Titolo Adunanza</label>
                        <input 
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none"
                          placeholder="es: Consiglio Direttivo Straordinario"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Tipo di Riunione</label>
                        <select 
                          value={formData.type}
                          onChange={e => setFormData({...formData, type: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none"
                        >
                          <option>Assemblea Ordinaria</option>
                          <option>Assemblea Straordinaria</option>
                          <option>Consiglio Direttivo</option>
                          <option>Riunione Operativa</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Data</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                          <input 
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Ora Inizio</label>
                        <input 
                          type="time"
                          value={formData.time}
                          onChange={e => setFormData({...formData, time: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Luogo</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input 
                          value={formData.location}
                          onChange={e => setFormData({...formData, location: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Presidente</label>
                        <input 
                          value={formData.president}
                          onChange={e => setFormData({...formData, president: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Segretario</label>
                        <input 
                          value={formData.secretary}
                          onChange={e => setFormData({...formData, secretary: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none"
                          placeholder="Nome del segretario verbalizzante"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Soci Presenti</label>
                      <textarea 
                        value={formData.attendees}
                        onChange={e => setFormData({...formData, attendees: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none resize-none"
                        placeholder="Elenca i soci presenti o scrivi 'Tutti i soci'..."
                      />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-serif text-stone-900">Ordine del Giorno</h4>
                      <button 
                        onClick={addAgendaItem}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
                      >
                        <Plus className="w-4 h-4" /> Aggiungi Punto
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.agenda.map((item, index) => (
                        <div key={item.id} className="p-6 bg-stone-50 rounded-2xl border border-stone-200 relative group">
                          <button 
                            onClick={() => removeAgendaItem(item.id)}
                            className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex gap-4">
                            <span className="text-2xl font-serif text-stone-300">0{index + 1}</span>
                            <div className="flex-1 space-y-4">
                              <input 
                                value={item.title}
                                onChange={e => updateAgendaItem(item.id, 'title', e.target.value)}
                                className="w-full bg-transparent border-b border-stone-200 py-2 text-lg font-medium text-stone-900 focus:border-stone-900 outline-none transition-colors"
                                placeholder="Titolo del punto all'OdG..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {formData.agenda.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-[2rem]">
                          <List className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                          <p className="text-stone-400">Nessun punto all'ordine del giorno aggiunto.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    {formData.agenda.map((item, index) => (
                      <div key={item.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-stone-900 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <h4 className="text-lg font-serif text-stone-900">{item.title}</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 ml-11">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Discussione</label>
                            <textarea 
                              value={item.discussion}
                              onChange={e => updateAgendaItem(item.id, 'discussion', e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none resize-none text-sm"
                              placeholder="Cosa è stato discusso..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Deliberazione / Decisione</label>
                            <textarea 
                              value={item.decision}
                              onChange={e => updateAgendaItem(item.id, 'decision', e.target.value)}
                              rows={2}
                              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm bg-emerald-50/30"
                              placeholder="Cosa è stato deciso..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-stone-100 bg-stone-50 flex justify-between items-center">
                <button 
                  onClick={step === 1 ? onClose : prevStep}
                  className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:text-stone-900 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> {step === 1 ? 'Annulla' : 'Indietro'}
                </button>
                
                <div className="flex gap-4">
                  {step < 4 ? (
                    <button 
                      onClick={nextStep}
                      disabled={step === 1 && !formData.title}
                      className="flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 disabled:opacity-50"
                    >
                      Continua <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      {loading ? 'Salvataggio...' : (
                        <>
                          <Save className="w-5 h-5" /> Genera e Salva
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
