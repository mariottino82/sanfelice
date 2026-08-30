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

/**
 * Checks if an event or general initiative date is in the past (end of day comparison).
 */
export function isEventEnded(item: any): boolean {
  if (!item) return false;
  const now = new Date();
  
  // Prefer the exact event execution date first
  const targetDateStr = item.eventDate || item.date || item.drawDate || item.endDate || item.startDate;
  if (!targetDateStr) return false;

  const targetDate = parseItalianDate(targetDateStr);
  targetDate.setHours(23, 59, 59, 999);

  return now.getTime() > targetDate.getTime();
}

export interface ContestRegistrationStatus {
  isOpen: boolean;
  isEnded: boolean;
  isDeadlinePassed: boolean;
  isNotStarted: boolean;
  message: string;
}

/**
 * Accurately determines if contest registration is currently open, expired, or not yet started.
 * - If eventDate is in the past => Event Ended => Registration Closed
 * - If endDate (deadline) is in the past => Deadline Expired => Registration Closed
 * - If startDate is in the future => Not Started Yet => Registration Closed
 */
export function getContestRegistrationStatus(contest: any): ContestRegistrationStatus {
  if (!contest) {
    return { isOpen: false, isEnded: false, isDeadlinePassed: false, isNotStarted: false, message: 'Concorso non disponibile' };
  }

  const now = new Date();

  // 1. Check if the event itself has already occurred
  if (contest.eventDate) {
    const eventDate = parseItalianDate(contest.eventDate);
    eventDate.setHours(23, 59, 59, 999);
    if (now.getTime() > eventDate.getTime()) {
      return {
        isOpen: false,
        isEnded: true,
        isDeadlinePassed: true,
        isNotStarted: false,
        message: 'Evento Concluso - Iscrizioni Chiuse'
      };
    }
  }

  // 2. Check if the registration deadline (endDate) has passed
  if (contest.endDate) {
    const endDate = parseItalianDate(contest.endDate);
    endDate.setHours(23, 59, 59, 999);
    if (now.getTime() > endDate.getTime()) {
      return {
        isOpen: false,
        isEnded: false,
        isDeadlinePassed: true,
        isNotStarted: false,
        message: 'Termine Iscrizioni Scaduto'
      };
    }
  }

  // 3. Fallback date check if neither eventDate nor endDate was specifically provided
  if (!contest.eventDate && !contest.endDate && contest.date) {
    const d = parseItalianDate(contest.date);
    d.setHours(23, 59, 59, 999);
    if (now.getTime() > d.getTime()) {
      return {
        isOpen: false,
        isEnded: true,
        isDeadlinePassed: true,
        isNotStarted: false,
        message: 'Evento Terminato'
      };
    }
  }

  // 4. Check if registration has not yet started (startDate)
  if (contest.startDate) {
    const startDate = parseItalianDate(contest.startDate);
    startDate.setHours(0, 0, 0, 0);
    if (now.getTime() < startDate.getTime()) {
      return {
        isOpen: false,
        isEnded: false,
        isDeadlinePassed: false,
        isNotStarted: true,
        message: `Iscrizioni aperte dal ${formatDateDisplay(contest.startDate)}`
      };
    }
  }

  // Otherwise, registration is active and open!
  return {
    isOpen: true,
    isEnded: false,
    isDeadlinePassed: false,
    isNotStarted: false,
    message: 'Iscrizioni Aperte'
  };
}

export function isContestRegistrationOpen(contest: any): boolean {
  return getContestRegistrationStatus(contest).isOpen;
}

