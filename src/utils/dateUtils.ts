export function parseItalianDate(dateStr: any): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  if (typeof dateStr === 'string') {
    const parts = dateStr.trim().split(/[\/\-\.]/);
    if (parts.length === 3) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      const p2 = parseInt(parts[2], 10);
      
      if (p2 > 1000 && p1 >= 1 && p1 <= 12 && p0 >= 1 && p0 <= 31) {
        // Format: DD/MM/YYYY
        d = new Date(p2, p1 - 1, p0);
        if (!isNaN(d.getTime())) return d;
      } else if (p0 > 1000 && p1 >= 1 && p1 <= 12 && p2 >= 1 && p2 <= 31) {
        // Format: YYYY/MM/DD
        d = new Date(p0, p1 - 1, p2);
        if (!isNaN(d.getTime())) return d;
      }
    }
  }
  
  return new Date();
}

export function formatDateDisplay(dateStr: any): string {
  if (!dateStr) return '';
  const d = parseItalianDate(dateStr);
  return d.toLocaleDateString('it-IT');
}

export function formatDateForInput(dateStr?: any): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (dateStr instanceof Date) {
    try { return dateStr.toISOString().split('T')[0]; } catch (e) { return new Date().toISOString().split('T')[0]; }
  }
  
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    try {
      return d.toISOString().split('T')[0];
    } catch (e) {}
  }
  
  if (typeof dateStr === 'string') {
    const parts = dateStr.trim().split(/[\/\-\.]/);
    if (parts.length === 3) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      const p2 = parseInt(parts[2], 10);
      
      if (p2 > 1000 && p1 >= 1 && p1 <= 12 && p0 >= 1 && p0 <= 31) {
        const m = p1 < 10 ? `0${p1}` : `${p1}`;
        const day = p0 < 10 ? `0${p0}` : `${p0}`;
        return `${p2}-${m}-${day}`;
      } else if (p0 > 1000 && p1 >= 1 && p1 <= 12 && p2 >= 1 && p2 <= 31) {
        const m = p1 < 10 ? `0${p1}` : `${p1}`;
        const day = p2 < 10 ? `0${p2}` : `${p2}`;
        return `${p0}-${m}-${day}`;
      }
    }
  }
  
  return new Date().toISOString().split('T')[0];
}
