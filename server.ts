import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import Pop3Command from 'node-pop3';
import { getDb } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration for gallery uploads
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'public', 'uploads', 'gallery');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const galleryUpload = multer({ 
  storage: galleryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 20 // Max 20 files at once
  }
});
const emailUpload = multer({ storage: galleryStorage });

import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const db = await getDb();

  // Database write test
  try {
    await db.run('CREATE TABLE IF NOT EXISTS _write_test (id INTEGER PRIMARY KEY, val TEXT)');
    await db.run('INSERT INTO _write_test (val) VALUES (?)', ['test_' + Date.now()]);
    console.log('Database write test successful');
    
    // Ensure totalVotes is initialized to 0 for existing polls
    try {
      await db.run('UPDATE polls SET totalVotes = 0 WHERE totalVotes IS NULL');
    } catch (e) {
      console.error('Error initializing totalVotes:', e);
    }
  } catch (e) {
    console.error('DATABASE WRITE TEST FAILED! Database might be read-only.', e);
  }

  app.use(express.json());

  // Sponsors API
  const uploadSponsor = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sponsors');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'sponsor-' + uniqueSuffix + path.extname(file.originalname));
    }
  }) });

  const uploadBookingEvent = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'bookings');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'booking-' + uniqueSuffix + path.extname(file.originalname));
    }
  }) });

  app.post('/api/sponsors/upload', uploadSponsor.single('image'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/sponsors/${req.file.filename}`;
    res.json({ path: url });
  });

  app.post('/api/booking-events/upload', uploadBookingEvent.single('image'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/bookings/${req.file.filename}`;
    res.json({ path: url });
  });

  app.get('/api/sponsors', async (req, res) => {
    try {
      const sponsors = await db.all('SELECT * FROM sponsors ORDER BY position ASC, id DESC');
      res.json(sponsors);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/sponsors/active', async (req, res) => {
    try {
      const now = new Date().toISOString();
      const sponsors = await db.all(
        'SELECT * FROM sponsors WHERE active = 1 AND (startDate IS NULL OR startDate <= ?) AND (endDate IS NULL OR endDate >= ?) ORDER BY position ASC, id DESC',
        [now, now]
      );
      res.json(sponsors);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/sponsors/reorder', async (req, res) => {
    try {
      const { sponsors } = req.body;
      for (const sponsor of sponsors) {
        await db.run('UPDATE sponsors SET position = ? WHERE id = ?', [sponsor.position, sponsor.id]);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/sponsors', async (req, res) => {
    try {
      const { name, image, startDate, endDate, active, position } = req.body;
      const result = await db.run(
        'INSERT INTO sponsors (name, image, startDate, endDate, active, position) VALUES (?, ?, ?, ?, ?, ?)',
        [name, image, startDate, endDate, active ? 1 : 0, position || 0]
      );
      res.json({ id: result.lastID });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/sponsors/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, image, startDate, endDate, active, position } = req.body;
      await db.run(
        'UPDATE sponsors SET name = ?, image = ?, startDate = ?, endDate = ?, active = ?, position = ? WHERE id = ?',
        [name, image, startDate, endDate, active ? 1 : 0, position || 0, id]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/sponsors/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM sponsors WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Booking Events API
  app.get('/api/booking-events', async (req, res) => {
    try {
      const events = await db.all('SELECT * FROM booking_events ORDER BY date DESC');
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/booking-events', async (req, res) => {
    try {
      const { title, description, date, time, location, image, price, totalTickets, active, showOnHomepage } = req.body;
      const result = await db.run(
        'INSERT INTO booking_events (title, description, date, time, location, image, price, totalTickets, active, showOnHomepage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, description, date, time, location, image, price, totalTickets, active ? 1 : 0, showOnHomepage ? 1 : 0]
      );
      res.json({ id: result.lastID });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/booking-events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, date, time, location, image, price, totalTickets, active, showOnHomepage } = req.body;
      await db.run(
        'UPDATE booking_events SET title = ?, description = ?, date = ?, time = ?, location = ?, image = ?, price = ?, totalTickets = ?, active = ?, showOnHomepage = ? WHERE id = ?',
        [title, description, date, time, location, image, price, totalTickets, active ? 1 : 0, showOnHomepage ? 1 : 0, id]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/booking-events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM booking_events WHERE id = ?', [id]);
      await db.run('DELETE FROM bookings WHERE eventId = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Bookings API
  app.get('/api/bookings', async (req, res) => {
    try {
      const { eventId } = req.query;
      let query = 'SELECT * FROM bookings';
      const params = [];
      if (eventId) {
        query += ' WHERE eventId = ?';
        params.push(eventId);
      }
      query += ' ORDER BY id DESC';
      const bookings = await db.all(query, params);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    try {
      const { eventId, name, email, phone, paymentStatus, tickets = 1 } = req.body;
      
      const numTickets = parseInt(tickets) || 1;
      if (numTickets < 1) return res.status(400).json({ error: 'Numero biglietti non valido' });

      // Check availability
      const event = await db.get('SELECT * FROM booking_events WHERE id = ?', [eventId]);
      if (!event) return res.status(404).json({ error: 'Evento non trovato' });
      if (event.soldTickets + numTickets > event.totalTickets) {
        return res.status(400).json({ error: 'Sold out o biglietti insufficienti' });
      }

      // Check limit for free events
      if (event.price === 0) {
        const existingBookings = await db.get(
          'SELECT COUNT(*) as count FROM bookings WHERE eventId = ? AND (email = ? OR phone = ? OR name = ?)',
          [eventId, email, phone, name]
        );
        if (existingBookings && existingBookings.count + numTickets > 4) {
          return res.status(400).json({ error: 'Limite massimo di 4 biglietti per persona raggiunto per questo evento gratuito.' });
        }
      }

      const ticketNumbers: string[] = [];
      const purchaseDate = new Date().toISOString();
      const status = paymentStatus || (event.price > 0 ? 'pending' : 'confirmed');
      
      for (let i = 0; i < numTickets; i++) {
        const ticketNumber = `SF-${eventId}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
        ticketNumbers.push(ticketNumber);
        await db.run(
          'INSERT INTO bookings (eventId, name, email, phone, ticketNumber, purchaseDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [eventId, name, email, phone, ticketNumber, purchaseDate, status]
        );
      }

      // Update sold tickets count
      await db.run('UPDATE booking_events SET soldTickets = soldTickets + ? WHERE id = ?', [numTickets, eventId]);

      // Send confirmation email
      try {
        const emailSettingsRow = await db.get('SELECT value FROM settings WHERE key = ?', ['email_settings']);
        if (emailSettingsRow) {
          const settings = JSON.parse(emailSettingsRow.value);
          if (settings.smtp_host && settings.smtp_user && settings.smtp_pass && email) {
            const transporter = nodemailer.createTransport({
              host: settings.smtp_host,
              port: parseInt(settings.smtp_port),
              secure: parseInt(settings.smtp_port) === 465,
              auth: {
                user: settings.smtp_user,
                pass: settings.smtp_pass
              }
            });

            const ticketsHtml = ticketNumbers.map(tn => `
              <div style="background-color: #1c1917; color: #ffffff; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 16px;">
                <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: 700; margin: 0 0 8px 0; opacity: 0.6;">Il tuo Biglietto Digitale</p>
                <h3 style="font-size: 28px; margin: 0; font-family: monospace; letter-spacing: 1px;">${tn}</h3>
              </div>
            `).join('');

            const mailOptions = {
              from: `"${settings.from_name || 'Pro San Felice'}" <${settings.from_email || settings.smtp_user}>`,
              to: email,
              subject: `Conferma Prenotazione: ${event.title}`,
              html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 24px;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #1c1917; font-size: 24px; margin: 0; font-weight: 700;">Conferma Prenotazione</h1>
                    <p style="color: #78716c; font-size: 14px; margin-top: 8px;">Grazie per la tua partecipazione!</p>
                  </div>

                  <div style="background-color: #fafaf9; border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #f5f5f4;">
                    <h2 style="color: #1c1917; font-size: 18px; margin: 0 0 16px 0; border-bottom: 1px solid #e5e5e5; padding-bottom: 12px;">Dettagli Evento</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #78716c; font-size: 14px; width: 100px;">Evento:</td>
                        <td style="padding: 8px 0; color: #1c1917; font-size: 14px; font-weight: 600;">${event.title}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Data:</td>
                        <td style="padding: 8px 0; color: #1c1917; font-size: 14px; font-weight: 600;">${new Date(event.date).toLocaleDateString('it-IT')}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Ora:</td>
                        <td style="padding: 8px 0; color: #1c1917; font-size: 14px; font-weight: 600;">${event.time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Luogo:</td>
                        <td style="padding: 8px 0; color: #1c1917; font-size: 14px; font-weight: 600;">${event.location}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #78716c; font-size: 14px;">Biglietti:</td>
                        <td style="padding: 8px 0; color: #1c1917; font-size: 14px; font-weight: 600;">${numTickets}</td>
                      </tr>
                    </table>
                  </div>

                  ${ticketsHtml}
                  <p style="font-size: 12px; margin-top: 12px; opacity: 0.8; text-align: center;">Mostra questi codici all'ingresso dell'evento.</p>

                  <div style="text-align: center; color: #78716c; font-size: 12px; line-height: 1.6; margin-top: 32px;">
                    <p><strong>Dati Partecipante:</strong><br />${name}<br />${email}<br />${phone}</p>
                    <p style="margin-top: 24px; border-top: 1px solid #e5e5e5; padding-top: 24px;">
                      <strong>Associazione Pro San Felice</strong><br />
                      Per assistenza contattaci all'indirizzo email della sede.
                    </p>
                  </div>
                </div>
              `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Confirmation email sent to ${email}`);
          }
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }

      res.json({ success: true, ticketNumbers });
    } catch (error) {
      console.error('Booking error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/bookings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [id]);
      if (booking) {
        await db.run('DELETE FROM bookings WHERE id = ?', [id]);
        await db.run('UPDATE booking_events SET soldTickets = MAX(0, soldTickets - 1) WHERE id = ?', [booking.eventId]);
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete booking error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Donations API
  app.post('/api/donations', async (req, res) => {
    try {
      const { firstName, lastName, email, amount } = req.body;
      const date = new Date().toISOString();
      
      const result = await db.run(
        'INSERT INTO donations (firstName, lastName, email, amount, date, status) VALUES (?, ?, ?, ?, ?, ?)',
        [firstName, lastName, email, amount || 0, date, 'pending']
      );

      res.json({ success: true, id: result.lastID });
    } catch (error) {
      console.error('Donation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/donations/confirm', async (req, res) => {
    try {
      const { id } = req.body;
      const donation = await db.get('SELECT * FROM donations WHERE id = ?', [id]);
      
      if (!donation) return res.status(404).json({ error: 'Donazione non trovata' });
      if (donation.status === 'confirmed') return res.json({ success: true, alreadyConfirmed: true });

      // Update status
      await db.run('UPDATE donations SET status = ? WHERE id = ?', ['confirmed', id]);

      // Generate PDF Attestato
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Background decoration
      doc.setDrawColor(28, 25, 23); // stone-900
      doc.setLineWidth(1.5);
      doc.rect(10, 10, 277, 190);
      doc.setLineWidth(0.5);
      doc.rect(12, 12, 273, 186);

      // Add Logo if exists
      try {
        const logoPath = path.join(process.cwd(), 'logo.png');
        if (fs.existsSync(logoPath)) {
          const logoData = fs.readFileSync(logoPath).toString('base64');
          doc.addImage(logoData, 'PNG', 133.5, 18, 30, 30); // Centered logo
        }
      } catch (e) {
        console.error('Error adding logo to PDF:', e);
      }

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(36);
      doc.setTextColor(28, 25, 23);
      doc.text('ATTESTATO DI RINGRAZIAMENTO', 148.5, 65, { align: 'center' });

      // Separator line
      doc.setDrawColor(28, 25, 23);
      doc.setLineWidth(0.5);
      doc.line(80, 72, 217, 72);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(18);
      doc.text('Si ringrazia sentitamente', 148.5, 85, { align: 'center' });

      // Name
      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(34);
      doc.setTextColor(28, 25, 23);
      doc.text(`${donation.firstName} ${donation.lastName}`, 148.5, 105, { align: 'center' });

      // Body
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.setTextColor(68, 64, 60); // stone-600
      const bodyText = "Per il prezioso contributo e il generoso sostegno offerto all'Associazione Pro San Felice 2023. Grazie alla tua donazione possiamo continuare a valorizzare il nostro territorio e le nostre tradizioni.";
      const splitText = doc.splitTextToSize(bodyText, 200);
      doc.text(splitText, 148.5, 125, { align: 'center' });

      // Decorative element
      doc.setDrawColor(231, 229, 228); // stone-200
      doc.setLineWidth(0.2);
      doc.line(40, 155, 257, 155);

      // Footer
      doc.setTextColor(28, 25, 23);
      doc.setFontSize(12);
      doc.text(`Data: ${new Date(donation.date).toLocaleDateString('it-IT')}`, 40, 175);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Il Presidente', 220, 175, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Associazione Pro San Felice 2023', 220, 182, { align: 'center' });

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      // Send thank you email with PDF
      try {
        const emailSettingsRow = await db.get('SELECT value FROM settings WHERE key = ?', ['email_settings']);
        if (emailSettingsRow) {
          const settings = JSON.parse(emailSettingsRow.value);
          if (settings.smtp_host && settings.smtp_user && settings.smtp_pass && donation.email) {
            const transporter = nodemailer.createTransport({
              host: settings.smtp_host,
              port: parseInt(settings.smtp_port),
              secure: parseInt(settings.smtp_port) === 465,
              auth: {
                user: settings.smtp_user,
                pass: settings.smtp_pass
              }
            });

            const mailOptions = {
              from: `"${settings.from_name || 'Pro San Felice'}" <${settings.from_email || settings.smtp_user}>`,
              to: donation.email,
              subject: 'Grazie per la tua donazione - Pro San Felice',
              html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 24px;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #1c1917; font-size: 24px; margin: 0; font-weight: 700;">Grazie, ${donation.firstName}!</h1>
                    <p style="color: #78716c; font-size: 14px; margin-top: 8px;">Il tuo supporto è fondamentale per la nostra associazione.</p>
                  </div>

                  <div style="background-color: #fafaf9; border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #f5f5f4;">
                    <p style="color: #1c1917; font-size: 16px; line-height: 1.6; margin: 0;">
                      Gentile <strong>${donation.firstName} ${donation.lastName}</strong>,<br><br>
                      Ti ringraziamo di cuore per aver scelto di sostenere la <strong>Pro San Felice</strong>. 
                      Le donazioni come la tua ci permettono di continuare a valorizzare il nostro territorio e le nostre tradizioni.
                      <br><br>
                      In allegato trovi un attestato di ringraziamento come segno della nostra gratitudine.
                    </p>
                  </div>

                  <div style="text-align: center; color: #78716c; font-size: 12px; line-height: 1.6; margin-top: 32px;">
                    <p style="margin-top: 24px; border-top: 1px solid #e5e5e5; padding-top: 24px;">
                      <strong>Associazione Pro San Felice</strong><br />
                      Via Salita la chiesa, 19 - Colle d'Anchise (CB)<br />
                      sanfeliceassociazione@gmail.com
                    </p>
                  </div>
                </div>
              `,
              attachments: [
                {
                  filename: 'Attestato_Ringraziamento_ProSanFelice.pdf',
                  content: pdfBuffer
                }
              ]
            };

            await transporter.sendMail(mailOptions);
            console.log(`Thank you email with PDF sent to ${donation.email}`);
          }
        }
      } catch (emailError) {
        console.error('Error sending thank you email:', emailError);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Donation confirm error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin/donations', async (req, res) => {
    try {
      const donations = await db.all('SELECT * FROM donations ORDER BY date DESC');
      res.json(donations);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/admin/donations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM donations WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Visitors API
  app.post('/api/track-visit', async (req, res) => {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || '';
      let deviceType = 'Desktop';
      if (/mobile/i.test(userAgent)) deviceType = 'Mobile';
      if (/tablet/i.test(userAgent)) deviceType = 'Tablet';

      const timestamp = new Date().toISOString();

      // Insert visit
      await db.run(
        'INSERT INTO visits (ip, deviceType, timestamp) VALUES (?, ?, ?)',
        [ip, deviceType, timestamp]
      );

      // Increment total visits in settings
      const row = await db.get('SELECT value FROM settings WHERE key = ?', ['total_visits']);
      let totalVisits = 1;
      if (row) {
        totalVisits = parseInt(row.value) + 1;
        await db.run('UPDATE settings SET value = ? WHERE key = ?', [totalVisits.toString(), 'total_visits']);
      } else {
        await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['total_visits', '1']);
      }

      // Cleanup old visits (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      await db.run('DELETE FROM visits WHERE timestamp < ?', [thirtyDaysAgo.toISOString()]);

      res.json({ success: true });
    } catch (error) {
      console.error('Track visit error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/admin/visitors', async (req, res) => {
    try {
      const row = await db.get('SELECT value FROM settings WHERE key = ?', ['total_visits']);
      const totalVisits = row ? parseInt(row.value) : 0;

      const recentVisits = await db.all('SELECT * FROM visits ORDER BY timestamp DESC LIMIT 1000');

      res.json({ totalVisits, recentVisits });
    } catch (error) {
      console.error('Fetch visitors error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Settings API
  app.get('/api/settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const row = await db.get('SELECT value FROM settings WHERE key = ?', [key]);
      if (row) {
        res.json({ value: JSON.parse(row.value) });
      } else {
        res.json({ value: null });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      await db.run(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, JSON.stringify(value)]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health check
  app.get('/api/health', async (req, res) => {
    let dbStatus = 'unknown';
    let dbError = null;
    try {
      await db.run('CREATE TABLE IF NOT EXISTS _write_test (id INTEGER PRIMARY KEY, val TEXT)');
      await db.run('INSERT INTO _write_test (val) VALUES (?)', ['health_check_' + Date.now()]);
      dbStatus = 'writable';
    } catch (e: any) {
      dbStatus = 'error';
      dbError = e.message;
      console.error('Health check DB error:', e);
    }
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      database: dbStatus,
      databaseError: dbError,
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Auth API
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check users table (admins)
      const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
      if (user) {
        return res.json({ success: true, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
      }

      // Check members table (soci)
      const member = await db.get('SELECT * FROM members WHERE email = ? AND password = ?', [username, password]);
      if (member) {
        return res.json({ 
          success: true, 
          user: { id: member.id, username: member.name, role: member.role || 'Socio', email: member.email } 
        });
      }

      res.status(401).json({ success: false, message: 'Credenziali errate' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Members API
  app.get('/api/members', async (req, res) => {
    try {
      const members = await db.all('SELECT * FROM members ORDER BY name ASC');
      res.json(members.map(m => ({
        ...m,
        payments: JSON.parse(m.payments || '{}')
      })));
    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/members', async (req, res) => {
    const { name, email, phone, address, role, status, joinDate, password, payments } = req.body;
    try {
      const result = await db.run(
        'INSERT INTO members (name, email, phone, address, role, status, joinDate, password, payments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone, address, role || 'Socio', status || 'attivo', joinDate || new Date().toISOString(), password, JSON.stringify(payments || {})]
      );
      res.json({ id: result.lastID });
    } catch (e) {
      console.error('Error creating member:', e);
      res.status(400).json({ error: 'Email già presente o dati non validi' });
    }
  });

  app.put('/api/members/:id', async (req, res) => {
    const { name, email, phone, address, role, status, password, payments } = req.body;
    try {
      await db.run(
        'UPDATE members SET name = ?, email = ?, phone = ?, address = ?, role = ?, status = ?, password = ?, payments = ? WHERE id = ?',
        [name, email, phone, address, role, status, password, JSON.stringify(payments || {}), req.params.id]
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating member:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/members/:id', async (req, res) => {
    await db.run('DELETE FROM members WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Events API
  app.get('/api/events', async (req, res) => {
    const events = await db.all('SELECT * FROM events ORDER BY date DESC');
    res.json(events);
  });

  app.post('/api/events', async (req, res) => {
    const { title, date, location, description, image, video, category } = req.body;
    const result = await db.run(
      'INSERT INTO events (title, date, location, description, image, video, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, date || new Date().toISOString(), location, description, image, video, category]
    );
    res.json({ id: result.lastID });
  });

  app.put('/api/events/:id', async (req, res) => {
    const { title, date, location, description, image, video, category } = req.body;
    await db.run(
      'UPDATE events SET title = ?, date = ?, location = ?, description = ?, image = ?, video = ?, category = ? WHERE id = ?',
      [title, date || new Date().toISOString(), location, description, image, video, category, req.params.id]
    );
    res.json({ success: true });
  });

  app.delete('/api/events/:id', async (req, res) => {
    await db.run('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // News API
  app.get('/api/news', async (req, res) => {
    const news = await db.all('SELECT * FROM news ORDER BY date DESC');
    res.json(news);
  });

  app.post('/api/news', async (req, res) => {
    const { title, date, excerpt, content, image, video, category, showOnHomepage } = req.body;
    const result = await db.run(
      'INSERT INTO news (title, date, excerpt, content, image, video, category, showOnHomepage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, date || new Date().toISOString(), excerpt, content, image, video, category, showOnHomepage ? 1 : 0]
    );
    res.json({ id: result.lastID });
  });

  app.put('/api/news/:id', async (req, res) => {
    const { title, date, excerpt, content, image, video, category, showOnHomepage } = req.body;
    await db.run(
      'UPDATE news SET title = ?, date = ?, excerpt = ?, content = ?, image = ?, video = ?, category = ?, showOnHomepage = ? WHERE id = ?',
      [title, date || new Date().toISOString(), excerpt, content, image, video, category, showOnHomepage ? 1 : 0, req.params.id]
    );
    res.json({ success: true });
  });

  app.delete('/api/news/:id', async (req, res) => {
    await db.run('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Gallery API
  app.get('/api/gallery', async (req, res) => {
    try {
      const gallery = await db.all('SELECT * FROM gallery ORDER BY date DESC');
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/gallery', async (req, res) => {
    try {
      const { url, title, type, category, date } = req.body;
      const result = await db.run(
        'INSERT INTO gallery (url, title, type, category, date) VALUES (?, ?, ?, ?, ?)',
        [url, title, type || 'image', category, date || new Date().toISOString()]
      );
      res.json({ id: result.lastID });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/upload-gallery', galleryUpload.array('files'), async (req: any, res) => {
    console.log('Gallery upload request received:', { filesCount: req.files?.length });
    if (!req.files || req.files.length === 0) {
      console.warn('No files uploaded in gallery request');
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const results = [];
    const date = new Date().toISOString();
    
    try {
      for (const file of req.files) {
        const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
        const url = `/uploads/gallery/${file.filename}`;
        console.log('Saving gallery item:', { url, type });
        const result = await db.run(
          'INSERT INTO gallery (url, type, date) VALUES (?, ?, ?)',
          [url, type, date]
        );
        results.push({ id: result.lastID, url, type, date });
      }
      console.log('Gallery upload successful, items:', results.length);
      res.json(results);
    } catch (err: any) {
      console.error('Gallery upload database error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/gallery-clean-external', async (req, res) => {
    try {
      // Delete all items that don't start with /uploads/ or are not local
      const result = await db.run(
        "DELETE FROM gallery WHERE url NOT LIKE '/uploads/%' AND url NOT LIKE 'http%://img.youtube.com/%' AND url NOT LIKE 'http%://www.youtube.com/%' AND url NOT LIKE 'http%://youtu.be/%'"
      );
      res.json({ success: true, deletedCount: result.changes });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/gallery/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const row = await db.get('SELECT url FROM gallery WHERE id = ?', [id]);
      if (!row) return res.status(404).json({ error: 'Item not found' });
      
      // Only delete if it's a local file
      if (row.url.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', row.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await db.run('DELETE FROM gallery WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Polls API
  app.get('/api/polls', async (req, res) => {
    try {
      const polls = await db.all('SELECT * FROM polls ORDER BY id DESC');
      res.json(polls.map(p => {
        let options = [];
        let votes = [];
        try {
          options = JSON.parse(p.options || '[]');
        } catch (e) {
          console.error(`Error parsing options for poll ${p.id}:`, e);
        }
        try {
          votes = JSON.parse(p.votes || '[]');
        } catch (e) {
          console.error(`Error parsing votes for poll ${p.id}:`, e);
        }
        return { 
          ...p, 
          options,
          votes,
          totalVotes: p.totalVotes || 0,
          active: !!p.active,
          showOnHomepage: !!p.showOnHomepage
        };
      }));
    } catch (error) {
      console.error('Error fetching polls:', error);
      res.status(500).json({ error: 'Errore durante il caricamento dei sondaggi' });
    }
  });

  app.post('/api/polls', async (req, res) => {
    const { question, options, active, showOnHomepage, endDate } = req.body;
    console.log('Creating new poll:', { question, active, showOnHomepage, endDate });
    try {
      const result = await db.run(
        'INSERT INTO polls (question, options, votes, active, showOnHomepage, endDate) VALUES (?, ?, ?, ?, ?, ?)',
        [question || '', JSON.stringify(options || []), JSON.stringify([]), active ? 1 : 0, showOnHomepage ? 1 : 0, endDate || null]
      );
      console.log('Poll created successfully, ID:', result.lastID);
      res.json({ success: true, id: result.lastID });
    } catch (error: any) {
      console.error('Error creating poll:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Errore durante la creazione del sondaggio' 
      });
    }
  });

  app.put('/api/polls/:id', async (req, res) => {
    const { question, options, active, showOnHomepage, endDate } = req.body;
    console.log(`Updating poll ${req.params.id}:`, { question, active, showOnHomepage, endDate });
    try {
      const result = await db.run(
        'UPDATE polls SET question = ?, options = ?, active = ?, showOnHomepage = ?, endDate = ? WHERE id = ?',
        [question || '', JSON.stringify(options || []), active ? 1 : 0, showOnHomepage ? 1 : 0, endDate || null, req.params.id]
      );
      console.log(`Poll ${req.params.id} updated successfully. Changes:`, result.changes);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating poll:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Errore durante il salvataggio del sondaggio' 
      });
    }
  });

  app.post('/api/polls/:id/vote', async (req, res) => {
    const { optionIndex, email, phone } = req.body;
    console.log(`Vote request for poll ${req.params.id}:`, { optionIndex, email, phone });
    try {
      const poll = await db.get('SELECT * FROM polls WHERE id = ?', [req.params.id]);
      if (poll) {
        const options = JSON.parse(poll.options || '[]');
        const votes = JSON.parse(poll.votes || '[]');
        
        // Check if email already voted
        if (email && votes.some((v: any) => v.email === email)) {
          return res.status(400).json({ error: 'Hai già votato in questo sondaggio con questa email' });
        }

        if (optionIndex === undefined || optionIndex < 0 || optionIndex >= options.length) {
          console.error('Invalid option index:', optionIndex);
          return res.status(400).json({ error: 'Indice opzione non valido' });
        }

        // Update option vote count
        options[optionIndex].votes = (options[optionIndex].votes || 0) + 1;

        // Add detailed vote
        votes.push({
          email,
          phone,
          date: new Date().toISOString(),
          optionId: options[optionIndex].id,
          optionText: options[optionIndex].text
        });

        const currentTotalVotes = (poll.totalVotes || 0) + 1;

        await db.run(
          'UPDATE polls SET options = ?, votes = ?, totalVotes = ? WHERE id = ?',
          [JSON.stringify(options), JSON.stringify(votes), currentTotalVotes, req.params.id]
        );
        
        console.log(`Vote recorded successfully for poll ${req.params.id}. New total: ${currentTotalVotes}`);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Sondaggio non trovato' });
      }
    } catch (error: any) {
      console.error('Error recording vote:', error);
      res.status(500).json({ error: 'Errore durante la registrazione del voto: ' + error.message });
    }
  });

  app.delete('/api/polls/:id', async (req, res) => {
    try {
      await db.run('DELETE FROM polls WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting poll:', error);
      res.status(500).json({ error: 'Errore durante l\'eliminazione del sondaggio' });
    }
  });

  // Minutes API
  app.get('/api/minutes', async (req, res) => {
    const minutes = await db.all('SELECT * FROM minutes ORDER BY date DESC');
    res.json(minutes);
  });

  app.post('/api/minutes', async (req, res) => {
    const { title, date, content, file_path } = req.body;
    const result = await db.run(
      'INSERT INTO minutes (title, date, content, file_path) VALUES (?, ?, ?, ?)',
      [title, date || new Date().toISOString(), content, file_path || null]
    );
    res.json({ id: result.lastID });
  });

  const minutesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'public/minutes/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `verbale_${Date.now()}_${file.originalname}`);
    }
  });
  const uploadMinutes = multer({ storage: minutesStorage });

  app.post('/api/minutes/:id/upload', uploadMinutes.single('file'), async (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    const filePath = `/minutes/${req.file.filename}`;
    await db.run('UPDATE minutes SET file_path = ? WHERE id = ?', [filePath, req.params.id]);
    res.json({ success: true, path: filePath });
  });

  app.delete('/api/minutes/:id', async (req, res) => {
    await db.run('DELETE FROM minutes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Appointments API
  app.get('/api/appointments', async (req, res) => {
    const appointments = await db.all('SELECT * FROM appointments ORDER BY date ASC');
    res.json(appointments);
  });

  app.post('/api/appointments', async (req, res) => {
    const { title, date, location, description } = req.body;
    const result = await db.run(
      'INSERT INTO appointments (title, date, location, description) VALUES (?, ?, ?, ?)',
      [title, date, location, description]
    );
    res.json({ id: result.lastID });
  });

  app.delete('/api/appointments/:id', async (req, res) => {
    await db.run('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Registrations API
  app.get('/api/registrations', async (req, res) => {
    const registrations = await db.all('SELECT * FROM registrations ORDER BY date DESC');
    res.json(registrations);
  });

  app.post('/api/registrations', async (req, res) => {
    const { name, email, phone, message, password } = req.body;
    const result = await db.run(
      'INSERT INTO registrations (name, email, phone, message, date, password) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, message, new Date().toISOString(), password]
    );
    res.json({ id: result.lastID });
  });

  app.delete('/api/registrations/:id', async (req, res) => {
    await db.run('DELETE FROM registrations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Finances API
  app.get('/api/finances', async (req, res) => {
    const finances = await db.all('SELECT * FROM finances ORDER BY date DESC');
    res.json(finances);
  });

  app.post('/api/finances', async (req, res) => {
    const { event_name, type, amount, date, company_details, receipt_number, social_year, receipt_path } = req.body;
    const result = await db.run(
      'INSERT INTO finances (event_name, type, amount, date, company_details, receipt_number, social_year, receipt_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [event_name, type, amount, date || new Date().toISOString(), company_details || null, receipt_number || null, social_year || null, receipt_path || null]
    );
    res.json({ id: result.lastID });
  });

  const receiptsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'public/receipts/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `ricevuta_${Date.now()}_${file.originalname}`);
    }
  });
  const uploadReceipts = multer({ storage: receiptsStorage });

  app.post('/api/finances/upload-receipt', uploadReceipts.single('file'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    const filePath = `/receipts/${req.file.filename}`;
    res.json({ success: true, path: filePath });
  });

  app.delete('/api/finances/:id', async (req, res) => {
    try {
      // 1. Get the record to know its year and if it has a receipt number
      const record = await db.get('SELECT social_year, receipt_number FROM finances WHERE id = ?', [req.params.id]);
      
      if (!record) {
        return res.status(404).json({ error: 'Record non trovato' });
      }

      // 2. Delete the record
      await db.run('DELETE FROM finances WHERE id = ?', [req.params.id]);

      // 3. If it had a receipt number, re-sequence all receipts for that year
      if (record.receipt_number && record.social_year) {
        const year = record.social_year;
        const yearReceipts = await db.all(
          'SELECT id FROM finances WHERE social_year = ? AND receipt_number IS NOT NULL ORDER BY CAST(receipt_number AS INTEGER) ASC',
          [year]
        );

        for (let i = 0; i < yearReceipts.length; i++) {
          const newNumber = (i + 1).toString();
          await db.run('UPDATE finances SET receipt_number = ? WHERE id = ?', [newNumber, yearReceipts[i].id]);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting finance record:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Contests API
app.get('/api/contests', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM contests ORDER BY id DESC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contests', async (req, res) => {
  console.log('POST /api/contests - Body:', req.body);
  const { title, type, description, image, startDate, endDate, cost, prizes, showOnHomepage, winners } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO contests (title, type, description, image, startDate, endDate, cost, prizes, showOnHomepage, winners) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, type, description, image, startDate, endDate, cost, prizes, showOnHomepage ? 1 : 0, winners || '[]']
    );
    console.log('Insert result:', result);
    res.json({ id: result.lastID });
  } catch (err: any) {
    console.error('Error inserting contest:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contests/:id', async (req, res) => {
  console.log(`PUT /api/contests/${req.params.id} - Body:`, req.body);
  const { title, type, description, image, startDate, endDate, cost, prizes, showOnHomepage, winners } = req.body;
  try {
    const result = await db.run(
      'UPDATE contests SET title = ?, type = ?, description = ?, image = ?, startDate = ?, endDate = ?, cost = ?, prizes = ?, showOnHomepage = ?, winners = ? WHERE id = ?',
      [title, type, description, image, startDate, endDate, cost, prizes, showOnHomepage ? 1 : 0, winners || '[]', req.params.id]
    );
    console.log('Update result:', result);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error updating contest:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contests/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/contests/${id} - Request received`);
  try {
    // First, delete registrations associated with this contest to avoid FK issues
    const regResult = await db.run('DELETE FROM contest_registrations WHERE contestId = ?', [id]);
    console.log(`Deleted ${regResult.changes} registrations for contest ${id}`);

    // Then delete the contest
    const result = await db.run('DELETE FROM contests WHERE id = ?', [id]);
    console.log(`Delete contest result:`, result);
    
    if (result.changes === 0) {
      console.warn(`No contest found with ID: ${id}`);
      return res.status(404).json({ error: 'Concorso non trovato' });
    }
    
    res.json({ success: true, message: 'Concorso eliminato con successo' });
  } catch (err: any) {
    console.error('Error deleting contest:', err);
    res.status(500).json({ error: err.message });
  }
});

const contestStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/contests/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `concorso_${Date.now()}_${file.originalname}`);
  }
});
const uploadContest = multer({ storage: contestStorage });

app.post('/api/contests/:id/upload', uploadContest.single('image'), async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nessun file caricato' });
  }
  const filePath = `/contests/${req.file.filename}`;
  await db.run('UPDATE contests SET image = ? WHERE id = ?', [filePath, req.params.id]);
  res.json({ success: true, path: filePath });
});

const contestCommunicationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/contest_communications/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `comm_${Date.now()}_${file.originalname}`);
  }
});
const uploadContestCommunication = multer({ storage: contestCommunicationStorage });

app.post('/api/contests/:id/send-communication', uploadContestCommunication.single('attachment'), async (req: any, res) => {
  const { id } = req.params;
  const { title, message } = req.body;
  const attachment = req.file;

  try {
    const db = await getDb();
    // 1. Get contest info
    const contest = await db.get('SELECT * FROM contests WHERE id = ?', [id]);
    if (!contest) return res.status(404).json({ error: 'Concorso non trovato' });

    // 2. Get registered users for this contest
    const registrations = await db.all('SELECT email FROM contest_registrations WHERE contestId = ? AND status = "confirmed"', [id]);
    if (registrations.length === 0) {
      return res.status(400).json({ error: 'Nessun iscritto confermato per questo concorso' });
    }

    const recipients = registrations.map(r => r.email);

    // 3. Send emails
    const nodemailer = await import('nodemailer');
    const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
    if (!emailSettingsRow) return res.status(400).json({ error: 'Impostazioni email non configurate' });
    const settings = JSON.parse(emailSettingsRow.value);

    const transporter = nodemailer.createTransport({
      host: settings.smtp_host || 'smtp.gmail.com',
      port: parseInt(settings.smtp_port) || 587,
      secure: parseInt(settings.smtp_port) === 465,
      requireTLS: parseInt(settings.smtp_port) === 587,
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions: any = {
      from: `"${settings.from_name || 'Associazione'}" <${settings.from_email || settings.smtp_user}>`,
      to: recipients.join(','),
      subject: title,
      html: message.replace(/\n/g, '<br>'),
    };

    if (attachment) {
      mailOptions.attachments = [{
        filename: attachment.originalname,
        path: attachment.path
      }];
    }

    await transporter.sendMail(mailOptions);

    // 4. Save to history
    const sentAt = new Date().toISOString();
    const attachmentPath = attachment ? `/uploads/contest_communications/${attachment.filename}` : null;
    
    await db.run(
      'INSERT INTO contest_communications (contestId, title, message, attachmentPath, recipients, sentAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, message, attachmentPath, JSON.stringify(recipients), sentAt]
    );

    res.json({ success: true, recipientsCount: recipients.length });
  } catch (error: any) {
    console.error('Error sending contest communication:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contests/:id/communications', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const communications = await db.all('SELECT * FROM contest_communications WHERE contestId = ? ORDER BY sentAt DESC', [id]);
    res.json(communications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Contest Registrations API
app.get('/api/contest-registrations', async (req, res) => {
  const { contestId } = req.query;
  let query = 'SELECT * FROM contest_registrations';
  let params: any[] = [];
  if (contestId) {
    query += ' WHERE contestId = ?';
    params.push(contestId);
  }
  query += ' ORDER BY id DESC';
  try {
    const rows = await db.all(query, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contest-registrations', async (req, res) => {
  const { contestId, name, email, phone, isMinor, parentName, parentEmail, parentPhone, privacyAccepted } = req.body;
  const date = new Date().toISOString();
  try {
    const result = await db.run(
      'INSERT INTO contest_registrations (contestId, name, email, phone, isMinor, parentName, parentEmail, parentPhone, privacyAccepted, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [contestId, name, email, phone, isMinor ? 1 : 0, parentName, parentEmail, parentPhone, privacyAccepted ? 1 : 0, date]
    );
    res.json({ id: result.lastID });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contest-registrations/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM contest_registrations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

  // Email API
  app.post('/api/send-email', async (req, res) => {
    const { to, subject, html, text } = req.body;
    
    try {
      const nodemailer = await import('nodemailer');
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      
      if (!emailSettingsRow) {
        return res.status(400).json({ error: 'Email settings not configured' });
      }
      
      const settings = JSON.parse(emailSettingsRow.value);
      
      if (!settings.smtp_user || !settings.smtp_pass) {
        return res.status(400).json({ error: 'SMTP credentials missing' });
      }

      const transporter = nodemailer.createTransport({
        host: settings.smtp_host || 'smtp.gmail.com',
        port: parseInt(settings.smtp_port) || 587,
        secure: parseInt(settings.smtp_port) === 465,
        requireTLS: parseInt(settings.smtp_port) === 587,
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const info = await transporter.sendMail({
        from: `"${settings.from_name || 'Associazione'}" <${settings.from_email || settings.smtp_user}>`,
        to,
        subject,
        text,
        html,
      });

      console.log('Message sent: %s', info.messageId);
      res.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
      console.error('Error sending email:', error);
      let errorMessage = error.message;
      if (errorMessage.includes('Username and Password not accepted') || errorMessage.includes('535')) {
        errorMessage = 'Credenziali SMTP non accettate. Se usi Gmail, DEVI attivare la "Verifica in due passaggi" e usare una "Password per le App" (16 caratteri). Google blocca la tua password normale per motivi di sicurezza.';
      }
      res.status(500).json({ error: `Errore invio email: ${errorMessage}` });
    }
  });

// Lottery API
  app.get('/api/lottery', async (req, res) => {
    const lottery = await db.get('SELECT * FROM lottery LIMIT 1');
    if (lottery) {
      res.json({
        ...lottery,
        active: !!lottery.active,
        showOnHomepage: !!lottery.showOnHomepage,
        prizes: JSON.parse(lottery.prizes || '[]'),
        history: JSON.parse(lottery.history || '[]'),
        regulations_path: lottery.regulations_path,
        municipality_request_path: lottery.municipality_request_path,
        minutes_path: lottery.minutes_path
      });
    } else {
      res.status(404).json({ error: 'Lotteria non trovata' });
    }
  });

  app.put('/api/lottery', async (req, res) => {
    const { active, showOnHomepage, name, drawDate, ticketsCount, ticketPrice, prizes, history, regulations_path, municipality_request_path, minutes_path } = req.body;
    await db.run(
      'UPDATE lottery SET active = ?, showOnHomepage = ?, name = ?, drawDate = ?, ticketsCount = ?, ticketPrice = ?, prizes = ?, history = ?, regulations_path = ?, municipality_request_path = ?, minutes_path = ? WHERE id = 1',
      [active ? 1 : 0, showOnHomepage ? 1 : 0, name, drawDate, ticketsCount || 1000, ticketPrice || 2.50, JSON.stringify(prizes), JSON.stringify(history), regulations_path || null, municipality_request_path || null, minutes_path || null]
    );
    res.json({ success: true });
  });

  const lotteryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'public/lottery-docs/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `lotteria_${Date.now()}_${file.originalname}`);
    }
  });
  const uploadLottery = multer({ storage: lotteryStorage });

  app.post('/api/lottery/upload-doc', uploadLottery.single('file'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    const filePath = `/lottery-docs/${req.file.filename}`;
    res.json({ success: true, path: filePath });
  });

  // Email Client API
  // Helper to get POP3 client from settings
  const getPop3Client = (settings: any) => {
    const popUser = (settings.pop_user || settings.smtp_user || '').trim();
    const popPass = (settings.pop_pass || settings.smtp_pass || '').trim();
    const port = parseInt(settings.pop_port) || 995;
    const useTls = settings.pop_tls !== undefined ? settings.pop_tls : (port === 995);
    
    return new Pop3Command({
      user: popUser,
      password: popPass,
      host: settings.pop_host || 'pop.gmail.com',
      port: port,
      tls: useTls,
      timeout: 15000
    });
  };

  // Helper to get IMAP client from settings
  const getImapClient = (settings: any) => {
    const imapUser = (settings.imap_user || settings.smtp_user || '').trim();
    const imapPass = (settings.imap_pass || settings.smtp_pass || '').trim();
    const port = parseInt(settings.imap_port) || 993;
    const useTls = settings.imap_tls !== undefined ? settings.imap_tls : (port === 993);
    
    return new ImapFlow({
      host: settings.imap_host || 'imap.gmail.com',
      port: port,
      secure: useTls,
      auth: {
        user: imapUser,
        pass: imapPass
      },
      logger: false,
      tls: {
        rejectUnauthorized: false
      }
    });
  };

  // Email Client API
  // Helper to list folders
  app.get('/api/emails/folders', async (req, res) => {
    try {
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      if (!emailSettingsRow) return res.status(400).json({ error: 'Impostazioni email non configurate' });
      const settings = JSON.parse(emailSettingsRow.value);
      
      if (settings.protocol !== 'imap') {
        return res.json({ folders: [{ path: 'INBOX', name: 'Inbox', special: '' }] });
      }

      const client = getImapClient(settings);
      try {
        await client.connect();
        const list = await client.list();
        const folders = list.map(f => ({
          path: f.path,
          name: f.name,
          special: f.specialUse || ''
        }));
        res.json({ folders });
      } finally {
        await client.logout();
      }
    } catch (error: any) {
      console.error('Folders Fetch Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Helper to get full email content
  app.get('/api/emails/:uid', async (req, res) => {
    const { uid } = req.params;
    const { folder = 'INBOX' } = req.query;

    try {
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      if (!emailSettingsRow) return res.status(400).json({ error: 'Impostazioni email non configurate' });
      const settings = JSON.parse(emailSettingsRow.value);

      if (settings.protocol === 'pop3') {
        const client = getPop3Client(settings);
        try {
          const connectPromise = client.connect();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout connessione POP3')), 10000));
          await Promise.race([connectPromise, timeoutPromise]);
          
          const fetchPromise = client.RETR(parseInt(uid));
          const fetchTimeoutPromise = new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Timeout recupero email POP3')), 15000));
          const raw = await Promise.race([fetchPromise, fetchTimeoutPromise]);
          
          if (!raw) return res.status(404).json({ error: 'Email non trovata' });

          const parsed = await simpleParser(raw);
          
          const getAddress = (addr: any) => {
            if (!addr) return { name: 'Sconosciuto', address: 'unknown' };
            const val = addr.value ? addr.value[0] : (Array.isArray(addr) ? addr[0] : addr);
            return {
              name: val.name || '',
              address: val.address || 'unknown'
            };
          };

          return res.json({
            uid: uid,
            from: getAddress(parsed.from),
            to: getAddress(parsed.to),
            subject: parsed.subject || '(Nessun oggetto)',
            date: parsed.date || new Date(),
            html: parsed.html || parsed.textAsHtml || '',
            text: parsed.text || '',
            attachments: parsed.attachments.map((a, idx) => ({
              filename: a.filename,
              contentType: a.contentType,
              size: a.size,
              part: idx.toString()
            }))
          });
        } finally {
          try { await client.QUIT(); } catch (e) {}
        }
      }

      const client = getImapClient(settings);
      try {
        await client.connect();
        const lock = await client.getMailboxLock(folder as string);
        try {
          const message = await client.fetchOne(uid, { source: true, envelope: true, flags: true, bodyStructure: true }, { uid: true });
          if (!message) return res.status(404).json({ error: 'Email non trovata' });

          const parsed = await simpleParser(message.source);
          
          const getAddress = (addr: any) => {
            if (!addr) return { name: 'Sconosciuto', address: 'unknown' };
            const val = addr.value ? addr.value[0] : (Array.isArray(addr) ? addr[0] : addr);
            return {
              name: val.name || '',
              address: val.address || 'unknown'
            };
          };

          res.json({
            uid: message.uid.toString(),
            from: getAddress(parsed.from),
            to: getAddress(parsed.to),
            subject: parsed.subject || '(Nessun oggetto)',
            date: parsed.date || new Date(),
            html: parsed.html || parsed.textAsHtml || '',
            text: parsed.text || '',
            attachments: parsed.attachments.map((a, idx) => ({
              filename: a.filename,
              contentType: a.contentType,
              size: a.size,
              part: idx.toString()
            }))
          });
        } finally {
          lock.release();
        }
      } finally {
        await client.logout();
      }
    } catch (error: any) {
      console.error('Email Detail Fetch Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Download attachment
  app.get('/api/emails/:uid/attachment/:part', async (req, res) => {
    const { uid, part } = req.params;
    const { folder = 'INBOX' } = req.query;

    try {
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      if (!emailSettingsRow) return res.status(400).json({ error: 'Impostazioni email non configurate' });
      const settings = JSON.parse(emailSettingsRow.value);

      if (settings.protocol === 'pop3') {
        const client = getPop3Client(settings);
        try {
          const connectPromise = client.connect();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout connessione POP3')), 10000));
          await Promise.race([connectPromise, timeoutPromise]);
          
          const fetchPromise = client.RETR(parseInt(uid));
          const fetchTimeoutPromise = new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Timeout recupero email POP3')), 15000));
          const raw = await Promise.race([fetchPromise, fetchTimeoutPromise]);
          
          if (!raw) return res.status(404).json({ error: 'Email non trovata' });

          const parsed = await simpleParser(raw);
          const attachment = parsed.attachments[parseInt(part)];
          
          if (!attachment) return res.status(404).json({ error: 'Allegato non trovato' });

          res.setHeader('Content-Type', attachment.contentType);
          res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
          res.send(attachment.content);
        } finally {
          try { await client.QUIT(); } catch (e) {}
        }
        return;
      }

      const client = getImapClient(settings);
      try {
        await client.connect();
        const lock = await client.getMailboxLock(folder as string);
        try {
          const message = await client.fetchOne(uid, { source: true }, { uid: true });
          if (!message) return res.status(404).json({ error: 'Email non trovata' });

          const parsed = await simpleParser(message.source);
          const attachment = parsed.attachments[parseInt(part)];
          
          if (!attachment) return res.status(404).json({ error: 'Allegato non trovato' });

          res.setHeader('Content-Type', attachment.contentType);
          res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
          res.send(attachment.content);
        } finally {
          lock.release();
        }
      } finally {
        await client.logout();
      }
    } catch (error: any) {
      console.error('Attachment Download Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/emails', async (req, res) => {
    const { folder = 'INBOX', page = '1', search = '' } = req.query;
    const pageSize = 20;
    const skip = (parseInt(page as string) - 1) * pageSize;

    try {
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      if (!emailSettingsRow) return res.status(400).json({ error: 'Impostazioni email non configurate' });
      const settings = JSON.parse(emailSettingsRow.value);

      if (settings.protocol === 'imap' || !settings.protocol) {
        console.log('Using IMAP protocol');
        const imapOperation = (async () => {
          const client = getImapClient(settings);
          try {
            console.log('Connecting to IMAP...');
            await client.connect();
            console.log('IMAP connected. Getting mailbox lock for:', folder);
            const lock = await client.getMailboxLock(folder as string);
            try {
              console.log('Mailbox locked. Getting status...');
              const status = await client.status(folder as string, { messages: true });
              const totalMessages = status.messages || 0;
              console.log('Total messages:', totalMessages);
              
              const messages = [];
              if (totalMessages > 0) {
                  // Fetch last 20 messages
                  const end = Math.max(1, totalMessages - skip);
                  const start = Math.max(1, totalMessages - skip - pageSize + 1);
                  const range = `${start}:${end}`;
                  console.log('Fetching range:', range);
                  
                  for await (const message of client.fetch(range, { envelope: true, flags: true, bodyStructure: true })) {
                    let preview = '';
                    
                    messages.push({
                      uid: message.uid.toString(),
                      seq: message.seq,
                      from: { 
                          name: message.envelope.from?.[0]?.name || '', 
                          address: message.envelope.from?.[0]?.address || '' 
                      },
                      subject: message.envelope.subject || '(Nessun oggetto)',
                      date: message.envelope.date || new Date(),
                      flags: Array.from(message.flags || []),
                      hasAttachments: message.bodyStructure?.childNodes?.some(part => part.disposition === 'attachment') || false,
                      preview
                    });
                  }
                  // Reverse to show newest first
                  messages.reverse();
              }

              const totalPages = Math.ceil(totalMessages / pageSize);
              console.log('IMAP fetch complete. Returning messages.');
              return {
                emails: messages,
                total: totalMessages,
                totalPages,
                page: parseInt(page as string),
                pageSize
              };
            } finally {
              lock.release();
            }
          } finally {
            await client.logout();
          }
        })();

        const result = await Promise.race([
          imapOperation,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout globale operazione IMAP (40s)')), 40000))
        ]) as any;
        return res.json(result);
      } else if (settings.protocol === 'pop3') {
        const pop3Operation = (async () => {
          const port = parseInt(settings.pop_port) || 995;
            const client = getPop3Client(settings);
            console.log(`Connecting to POP3 server: ${settings.pop_host}:${port} (TLS: ${settings.pop_tls !== undefined ? settings.pop_tls : (port === 995)})`);
            
            // Add timeout to connect
            await Promise.race([
              client.connect(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout connessione POP3 (15s)')), 15000))
            ]);
            
            console.log('POP3 connected successfully');
            
            // Use STAT to get count quickly with timeout
            const stat = await Promise.race([
              client.STAT(),
              new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Timeout STAT POP3 (5s)')), 5000))
            ]);
            console.log('POP3 STAT response:', stat);
            
            const statMatch = stat.match(/^\+OK\s+(\d+)/i);
            const totalMessages = statMatch ? parseInt(statMatch[1]) : 0;
            console.log(`Total messages in POP3 inbox: ${totalMessages}`);
            
            const messages = [];
            const endIdx = totalMessages - skip;
            const startIdx = Math.max(1, totalMessages - skip - pageSize + 1);

            console.log(`Fetching messages from ${endIdx} down to ${startIdx}`);

            if (totalMessages > 0 && endIdx >= 1) {
              const actualEndIdx = Math.min(totalMessages, endIdx);
              
              for (let i = actualEndIdx; i >= startIdx; i--) {
                try {
                  console.log(`Fetching headers and preview for message ${i}...`);
                  // Try TOP first, fallback to RETR if it fails
                  let raw;
                  try {
                    const fetchPromise = client.TOP(i, 10);
                    const timeoutPromise = new Promise<string>((_, reject) => 
                      setTimeout(() => reject(new Error('Timeout fetching message headers')), 3000)
                    );
                    raw = await Promise.race([fetchPromise, timeoutPromise]);
                  } catch (topErr: any) {
                    console.warn(`TOP failed for message ${i}, falling back to RETR:`, topErr.message);
                    const fetchPromise = client.RETR(i);
                    const timeoutPromise = new Promise<string>((_, reject) => 
                      setTimeout(() => reject(new Error('Timeout fetching message with RETR')), 10000)
                    );
                    raw = await Promise.race([fetchPromise, timeoutPromise]);
                  }
                  
                  if (raw) {
                    const parsed = await simpleParser(raw);
                    messages.push({
                      uid: i.toString(),
                      seq: i,
                      from: parsed.from?.value[0] || { name: 'Sconosciuto', address: 'unknown' },
                      subject: parsed.subject || '(Nessun oggetto)',
                      date: parsed.date || new Date(),
                      flags: [],
                      hasAttachments: (parsed.attachments && parsed.attachments.length > 0),
                      preview: parsed.text?.substring(0, 100) || ''
                    });
                    console.log(`Successfully fetched message ${i}`);
                  }
                } catch (err) {
                  console.error(`Error fetching message ${i}:`, err);
                }
              }
            }

            const totalPages = Math.ceil(totalMessages / pageSize);
            console.log(`Finished fetching emails. Returning ${messages.length} messages.`);
            return {
              emails: messages,
              total: totalMessages,
              totalPages,
              page: parseInt(page as string),
              pageSize
            };
          })();

          const result = await Promise.race([
            pop3Operation, 
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout globale operazione POP3 (45s)')), 45000))
          ]) as any;
          res.json(result);
      }
    } catch (error: any) {
      console.error('Email Fetch Error details:', error);
      let errorMessage = error.message;
      if (error.authenticationFailed || 
          errorMessage.includes('Username and Password not accepted') || 
          errorMessage.includes('AUTHENTICATIONFAILED') || 
          errorMessage.includes('invalid user or password') || 
          errorMessage.includes('535')) {
        errorMessage = 'Credenziali non accettate. Se usi Gmail, DEVI attivare la "Verifica in due passaggi" e usare una "Password per le App" (16 caratteri). Assicurati inoltre che il protocollo IMAP sia ABILITATO nelle impostazioni del tuo account email.';
      }
      res.status(500).json({ error: `Errore email: ${errorMessage}. Verifica le credenziali e le impostazioni del server.` });
    }
  });

  app.post('/api/emails/test', async (req, res) => {
    try {
      const settings = req.body;
      if (!settings) return res.status(400).json({ error: 'Settings are required' });
      
      const client = getPop3Client(settings);

      console.log(`Testing POP3 connection to ${settings.pop_host}:${parseInt(settings.pop_port) || 995}`);
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout connessione POP3 (10s)')), 10000))
      ]);
      await Promise.race([
        client.QUIT(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout QUIT POP3 (2s)')), 2000))
      ]);
      res.json({ success: true, message: 'Connessione POP3 riuscita!' });
    } catch (error: any) {
      console.error('POP3 Test Error:', error);
      let errorMessage = error.message;
      if (error.authenticationFailed || errorMessage.includes('Username and Password not accepted') || errorMessage.includes('535')) {
        errorMessage = 'Credenziali POP3 non accettate. Se usi Gmail, DEVI attivare la "Verifica in due passaggi" e usare una "Password per le App" (16 caratteri). La tua password normale non funzionerà anche se la verifica in due passaggi è disattivata.';
      }
      res.status(500).json({ error: `Errore POP3: ${errorMessage}` });
    }
  });

  app.post('/api/emails/test-imap', async (req, res) => {
    try {
      const settings = req.body;
      if (!settings) return res.status(400).json({ error: 'Settings are required' });
      
      const client = getImapClient(settings);

      console.log(`Testing IMAP connection to ${settings.imap_host}:${parseInt(settings.imap_port) || 993}`);
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout connessione IMAP (15s)')), 15000))
      ]);
      await client.logout();
      res.json({ success: true, message: 'Connessione IMAP riuscita!' });
    } catch (error: any) {
      console.error('IMAP Test Error:', error);
      let errorMessage = error.message;
      if (error.authenticationFailed || errorMessage.includes('AUTHENTICATIONFAILED') || errorMessage.includes('invalid user or password') || errorMessage.includes('535')) {
        errorMessage = 'Credenziali IMAP non accettate. Se usi Gmail, DEVI attivare la "Verifica in due passaggi" e usare una "Password per le App". Assicurati inoltre di aver ABILITATO l\'IMAP nelle impostazioni di Gmail (Ingranaggio -> Visualizza tutte le impostazioni -> Inoltro e POP/IMAP).';
      }
      res.status(500).json({ error: `Errore IMAP: ${errorMessage}` });
    }
  });

  app.post('/api/emails/test-smtp', async (req, res) => {
    try {
      const settings = req.body;
      if (!settings) return res.status(400).json({ error: 'Settings are required' });
      if (!settings.smtp_user || !settings.smtp_pass) {
        return res.status(400).json({ error: 'Username e Password SMTP sono obbligatori' });
      }
      
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: settings.smtp_host || 'smtp.gmail.com',
        port: parseInt(settings.smtp_port) || 587,
        secure: parseInt(settings.smtp_port) === 465,
        requireTLS: parseInt(settings.smtp_port) === 587,
        auth: {
          user: (settings.smtp_user || '').trim(),
          pass: (settings.smtp_pass || '').trim(),
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log(`Testing SMTP connection to ${settings.smtp_host}:${parseInt(settings.smtp_port) || 587}`);
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout verifica SMTP (10s)')), 10000))
      ]);
      res.json({ success: true, message: 'Connessione SMTP riuscita!' });
    } catch (error: any) {
      console.error('SMTP Test Error:', error);
      let errorMessage = error.message;
      if (error.authenticationFailed || errorMessage.includes('Username and Password not accepted') || errorMessage.includes('535')) {
        errorMessage = 'Credenziali SMTP non accettate. Se usi Gmail, DEVI attivare la "Verifica in due passaggi" e usare una "Password per le App" (16 caratteri). Assicurati inoltre che l\'indirizzo email sia corretto.';
      }
      res.status(500).json({ error: `Errore SMTP: ${errorMessage}` });
    }
  });

  app.post('/api/emails/send', emailUpload.array('attachments'), async (req: any, res) => {
    const { to, subject, body, html, replyTo, inReplyTo, references } = req.body;
    const emailContent = html || body;
    const attachments = (req.files as any[])?.map(f => ({
      filename: f.originalname,
      path: f.path
    })) || [];

    try {
      const nodemailer = await import('nodemailer');
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      if (!emailSettingsRow) return res.status(400).json({ error: 'Impostazioni email non configurate' });
      const settings = JSON.parse(emailSettingsRow.value);

      const transporter = nodemailer.createTransport({
        host: settings.smtp_host || 'smtp.gmail.com',
        port: parseInt(settings.smtp_port) || 587,
        secure: parseInt(settings.smtp_port) === 465,
        requireTLS: parseInt(settings.smtp_port) === 587,
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_pass,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      const mailOptions: any = {
        from: `"${settings.from_name || 'Associazione'}" <${settings.from_email || settings.smtp_user}>`,
        to,
        subject,
        html: emailContent,
        attachments
      };

      if (replyTo) mailOptions.replyTo = replyTo;
      if (inReplyTo) mailOptions.inReplyTo = inReplyTo;
      if (references) {
        try {
          mailOptions.references = JSON.parse(references);
        } catch (e) {
          mailOptions.references = references;
        }
      }

      await transporter.sendMail(mailOptions);

      // Cleanup uploaded attachments
      attachments.forEach(a => {
        if (fs.existsSync(a.path)) fs.unlinkSync(a.path);
      });

      res.json({ success: true });
    } catch (error: any) {
      let errorMessage = error.message;
      if (errorMessage.includes('Username and Password not accepted') || errorMessage.includes('535')) {
        errorMessage = 'Credenziali non accettate da Gmail. Assicurati di usare una "Password per le App" (16 caratteri) e non la tua password normale.';
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post('/api/emails/:uid/trash', async (req, res) => {
    const { uid } = req.params;
    const { folder = 'INBOX' } = req.query;

    try {
      const emailSettingsRow = await db.get('SELECT * FROM settings WHERE key = ?', ['email_settings']);
      if (!emailSettingsRow) return res.status(400).json({ error: 'Impostazioni email non configurate' });
      const settings = JSON.parse(emailSettingsRow.value);
      const protocol = settings.protocol || 'pop3';

      if (protocol === 'imap') {
        const client = getImapClient(settings);
        try {
          await client.connect();
          const lock = await client.getMailboxLock(folder as string);
          try {
            // Find trash folder
            const list = await client.list();
            const trashFolder = list.find(f => f.specialUse === '\\Trash' || f.path.toLowerCase().includes('trash') || f.path.toLowerCase().includes('cestino'));
            
            if (trashFolder) {
              await client.messageMove(uid, trashFolder.path, { uid: true });
            } else {
              // If no trash folder, just delete (add \Deleted flag and expunge)
              await client.messageFlagsAdd(uid, ['\\Deleted'], { uid: true });
            }
            res.json({ success: true });
          } finally {
            lock.release();
          }
        } finally {
          await client.logout();
        }
      } else {
        const client = getPop3Client(settings);
        try {
          const connectPromise = client.connect();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout connessione POP3')), 10000));
          await Promise.race([connectPromise, timeoutPromise]);
          
          const index = parseInt(uid);
          await client.DELE(index);
          res.json({ success: true });
        } finally {
          try {
            await Promise.race([
              client.QUIT(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout QUIT POP3')), 2000))
            ]);
          } catch (e) {
            console.error('POP3 QUIT Error:', e);
          }
        }
      }
    } catch (error: any) {
      console.error('Trash Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Settings API
  app.get('/api/settings/:key', async (req, res) => {
    try {
      const setting = await db.get('SELECT * FROM settings WHERE key = ?', [req.params.key]);
      if (setting) {
        res.json({ value: JSON.parse(setting.value) });
      } else {
        // Return a default empty object or null instead of 404 for settings
        res.json({ value: null });
      }
    } catch (error) {
      console.error('Error fetching setting:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/settings/:key', async (req, res) => {
    try {
      const { value } = req.body;
      await db.run(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [req.params.key, JSON.stringify(value)]
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving setting:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Users API
  app.get('/api/users', async (req, res) => {
    try {
      const users = await db.all('SELECT id, username, email, role, lastLogin FROM users');
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const { username, password, role, email } = req.body;
      const result = await db.run(
        'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
        [username, password || 'admin', role || 'Operatore', email]
      );
      res.json({ id: result.lastID });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // Logo Upload API
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/');
    },
    filename: (req, file, cb) => {
      cb(null, 'logo.png');
    }
  });
  const logoUpload = multer({ storage: logoStorage });

  app.post('/api/upload-logo', logoUpload.single('logo'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    
    // Copy logo.png to favicon.ico so they are always in sync
    try {
      const logoPath = path.join(publicDir, 'logo.png');
      const faviconPath = path.join(publicDir, 'favicon.ico');
      if (fs.existsSync(logoPath)) {
        fs.copyFileSync(logoPath, faviconPath);
      }
    } catch (err) {
      console.error('Error copying logo to favicon:', err);
    }
    
    res.json({ success: true, path: '/logo.png' });
  });

  // 1. Percorsi Assoluti Certi
  const rootPath = __dirname;
  const distPath = path.join(rootPath, 'dist');
  const publicPath = path.join(rootPath, 'public');

  console.log('DEBUG PERCORSI:', {
    rootPath,
    distPath,
    publicPath,
    logoInPublic: fs.existsSync(path.join(publicPath, 'logo.png')),
    logoInDist: fs.existsSync(path.join(distPath, 'logo.png'))
  });

  // 2. Rotte specifiche per logo e favicon (PRIMA dei file statici per evitare la cache)
  app.get(['/logo.png', '/favicon.ico'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const fileP = path.join(publicPath, 'logo.png');
    const fileD = path.join(distPath, 'logo.png');
    const fileR = path.join(rootPath, 'logo.png');
    
    if (fs.existsSync(fileP)) return res.sendFile(fileP);
    if (fs.existsSync(fileD)) return res.sendFile(fileD);
    if (fs.existsSync(fileR)) return res.sendFile(fileR);
    
    res.status(404).send('Logo non trovato sul disco');
  });

  // SEO: robots.txt
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /

Sitemap: https://www.prosanfelice.it/sitemap.xml`);
  });

  // SEO: sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    const today = new Date().toISOString().split('T')[0];
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.prosanfelice.it/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
  });

  // 3. Servizio file statici (sempre public)
  app.use(express.static(publicPath));

  let vite: any;
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
    console.log('Starting Vite in middleware mode...');
    try {
      vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom', // Use custom to handle index.html manually
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('Vite failed to start:', e);
    }
  } else {
    // In production, serve built files
    app.use(express.static(distPath));
  }

  // SPA fallback - must be last
  app.get('*', async (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) return next();
    
    try {
      if (vite) {
        // In dev mode, serve and transform index.html from root
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(rootPath, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      }

      // In production, serve dist/index.html
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
      
      res.status(404).send('Not found');
    } catch (e: any) {
      console.error('SPA fallback error:', e);
      res.status(500).send(e.message);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('CRITICAL: Failed to start server:', err);
  process.exit(1);
});
