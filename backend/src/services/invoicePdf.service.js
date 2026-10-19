// Professional A4 invoice PDF (pdfkit). Used by GET /invoices/:id/pdf and the invoice e-mail attachment.
// Layout: brand header (logo, business contact, GSTIN) -> invoice meta + status -> bill-to / deliver-to
// -> line items + totals + amount in words -> delivery summary -> missed-delivery details -> payments -> footer.
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { query, queryOne, NVarChar } = require('../database/db');
const config = require('../config');

// ---------- theme ----------
const C = {
  brand: '#0D3B2E', brandDark: '#082A20', accent: '#16A34A', mint: '#A7F3D0',
  ink: '#0F172A', text: '#1F2937', muted: '#64748B', light: '#F1F5F9', line: '#E2E8F0',
  white: '#FFFFFF', red: '#DC2626', redBg: '#FEF2F2', amber: '#D97706', amberBg: '#FFFBEB',
  green: '#15803D', greenBg: '#F0FDF4',
};
const PAGE = { w: 595.28, h: 841.89, m: 36 };
const CONTENT_W = PAGE.w - PAGE.m * 2;

// ---------- fonts (Noto Sans has the ₹ glyph; Helvetica does not) ----------
const FONT_DIR = path.join(__dirname, '..', '..', 'node_modules', '@expo-google-fonts', 'noto-sans');
const FONT_FILES = {
  R: path.join(FONT_DIR, '400Regular', 'NotoSans_400Regular.ttf'),
  S: path.join(FONT_DIR, '600SemiBold', 'NotoSans_600SemiBold.ttf'),
  B: path.join(FONT_DIR, '700Bold', 'NotoSans_700Bold.ttf'),
};
const hasNoto = Object.values(FONT_FILES).every((f) => fs.existsSync(f));
const RUPEE = hasNoto ? '₹' : 'Rs.';

const registerFonts = (doc) => {
  if (hasNoto) {
    doc.registerFont('R', FONT_FILES.R);
    doc.registerFont('S', FONT_FILES.S);
    doc.registerFont('B', FONT_FILES.B);
  } else {
    doc.registerFont('R', 'Helvetica');
    doc.registerFont('S', 'Helvetica-Bold');
    doc.registerFont('B', 'Helvetica-Bold');
  }
};

// ---------- helpers ----------
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const money = (v) => `${RUPEE}${num(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const qty = (v) => `${num(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`;
const monthName = (y, m) => new Date(Number(y), Number(m) - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
const fmtDate = (v) => {
  if (!v) return '—';
  const d = v instanceof Date ? v : new Date(String(v).slice(0, 10));
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const weekday = (v) => {
  const d = new Date(String(v).slice(0, 10));
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { weekday: 'short' });
};
const daysInMonth = (y, m) => new Date(Number(y), Number(m), 0).getDate();

// Indian-numbering amount in words: 4092.5 -> "Rupees Four Thousand Ninety Two and Fifty Paise Only"
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const below100 = (n) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ' ' + ONES[n % 10] : ''}`);
const below1000 = (n) => (n >= 100 ? `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? ' ' + below100(n % 100) : ''}` : below100(n));
function amountInWords(amount) {
  let n = Math.floor(Math.abs(num(amount)));
  const paise = Math.round((Math.abs(num(amount)) - n) * 100);
  if (n === 0 && paise === 0) return 'Rupees Zero Only';
  const parts = [];
  const crore = Math.floor(n / 1e7); n %= 1e7;
  const lakh = Math.floor(n / 1e5); n %= 1e5;
  const thousand = Math.floor(n / 1e3); n %= 1e3;
  if (crore) parts.push(`${below100(crore)} Crore`);
  if (lakh) parts.push(`${below100(lakh)} Lakh`);
  if (thousand) parts.push(`${below100(thousand)} Thousand`);
  if (n) parts.push(below1000(n));
  let words = `Rupees ${parts.join(' ') || 'Zero'}`;
  if (paise) words += ` and ${below100(paise)} Paise`;
  return `${words} Only`;
}

const parseDetails = (raw) => {
  if (!raw) return { missed: [], extras: [] };
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return { missed: parsed, extras: [] };
    return { missed: Array.isArray(parsed?.missed) ? parsed.missed : [], extras: Array.isArray(parsed?.extras) ? parsed.extras : [] };
  } catch { return { missed: [], extras: [] }; }
};

// Business profile: app Settings (editable in Settings screen) win over env defaults.
async function getBusinessProfile() {
  const r = await query("SELECT [Key],[Value] FROM dbo.Settings WHERE [Key] IN ('businessName','businessAddress','businessPhone','businessGst','businessEmail','businessTagline')");
  const s = {};
  r.recordset.forEach((row) => { if (row.Value && String(row.Value).trim()) s[row.Key] = String(row.Value).trim(); });
  return {
    name: s.businessName || config.business.name || 'Dairy Farm',
    address: s.businessAddress || config.business.address || '',
    phone: s.businessPhone || config.business.phone || '',
    gst: s.businessGst || config.business.gst || '',
    email: s.businessEmail || process.env.BUSINESS_EMAIL || process.env.EMAIL_FROM || '',
    tagline: s.businessTagline || 'Fresh farm milk, delivered to your doorstep every day',
  };
}

// ---------- drawing primitives ----------
function drawLogo(doc, x, y, size, business) {
  const logoPath = path.join(__dirname, '..', '..', 'assets', 'logo.png');
  if (fs.existsSync(logoPath)) {
    doc.save().roundedRect(x, y, size, size, 12).fill(C.white).restore();
    doc.image(logoPath, x + 6, y + 6, { fit: [size - 12, size - 12], align: 'center', valign: 'center' });
    return;
  }
  // Vector fallback: white disc with a green milk drop and the business initials.
  const cx = x + size / 2; const cy = y + size / 2; const r = size / 2;
  doc.save();
  doc.circle(cx, cy, r).fill(C.white);
  const dropTop = cy - r * 0.62; const dropR = r * 0.36; const dropCy = cy + r * 0.05;
  doc.moveTo(cx, dropTop)
    .bezierCurveTo(cx + dropR * 0.9, dropCy - dropR * 0.9, cx + dropR, dropCy - dropR * 0.1, cx + dropR, dropCy)
    .arc(cx, dropCy, dropR, 0, Math.PI, false)
    .bezierCurveTo(cx - dropR, dropCy - dropR * 0.1, cx - dropR * 0.9, dropCy - dropR * 0.9, cx, dropTop)
    .fill(C.accent);
  doc.ellipse(cx - dropR * 0.35, dropCy - dropR * 0.15, dropR * 0.16, dropR * 0.3).fill(C.white);
  const initials = String(business.name || 'DF').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  doc.font('B').fontSize(r * 0.42).fillColor(C.brand).text(initials, x, cy + r * 0.42, { width: size, align: 'center' });
  doc.restore();
}

function pill(doc, x, y, text, fg, bg, opts = {}) {
  const padX = 9; const h = opts.h || 18; const size = opts.size || 8.5;
  doc.font('B').fontSize(size);
  const w = doc.widthOfString(text) + padX * 2;
  const px = opts.align === 'right' ? x - w : x;
  doc.save().roundedRect(px, y, w, h, h / 2).fill(bg).restore();
  doc.fillColor(fg).text(text, px, y + (h - size) / 2 - 1.5, { width: w, align: 'center', lineBreak: false });
  return w;
}

function labelValue(doc, x, y, label, value, opts = {}) {
  const w = opts.width || 180;
  doc.font('S').fontSize(7.5).fillColor(C.muted).text(label.toUpperCase(), x, y, { width: w, characterSpacing: 0.6, lineBreak: false });
  doc.font(opts.bold ? 'B' : 'R').fontSize(opts.size || 10).fillColor(opts.color || C.ink).text(value || '—', x, y + 11, { width: w, lineBreak: !!opts.wrap });
  return y + 11 + doc.heightOfString(value || '—', { width: w }) + 2;
}

// ---------- main renderer ----------
/**
 * @param {object} p
 * @param {object} p.invoice   dbo.Invoices row
 * @param {object} p.customer  dbo.Customers row (Name, Mobile, Email, Address, MilkType, DailyQuantity, MorningQuantity, EveningQuantity)
 * @param {object[]} p.payments dbo.Payments rows for this invoice
 * @param {object} p.business  from getBusinessProfile()
 * @returns {Promise<Buffer>}
 */
function renderInvoicePdf({ invoice: inv, customer = {}, payments = [], business }) {
  return new Promise((resolve, reject) => {
    // bottom margin 0: we place the footer ourselves; a non-zero bottom margin makes pdfkit auto-add blank pages.
    const doc = new PDFDocument({ size: 'A4', margins: { top: PAGE.m, bottom: 0, left: PAGE.m, right: PAGE.m }, bufferPages: true, info: { Title: `Invoice ${inv.InvoiceNumber}`, Author: business.name } });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    registerFonts(doc);

    const { missed, extras } = parseDetails(inv.MissedDetails);
    const amount = num(inv.Amount);
    const deliveryCharge = num(inv.DeliveryCharge);
    const rate = num(inv.RatePerLiter);
    const totalQty = num(inv.TotalQuantity);
    const milkAmount = Math.round(totalQty * rate * 100) / 100;
    const adjustment = Math.round((amount - deliveryCharge - milkAmount) * 100) / 100;
    const paid = payments.reduce((s, p) => s + num(p.AmountPaid), 0);
    const balance = Math.max(0, Math.round((amount - paid) * 100) / 100);
    const status = String(inv.PaymentStatus || 'Pending');
    const statusStyle = status === 'Paid' ? [C.green, C.greenBg] : status === 'Partial' ? [C.amber, C.amberBg] : [C.red, C.redBg];
    const period = monthName(inv.Year, inv.Month);
    const totalDays = daysInMonth(inv.Year, inv.Month);
    const milkType = customer.MilkType || 'Cow Milk';

    let y = 0;
    const left = PAGE.m; const right = PAGE.w - PAGE.m;

    // Adds a page when the next block will not fit; repeats a slim header so pages stay branded.
    const ensureSpace = (h) => {
      if (y + h <= PAGE.h - 70) return;
      doc.addPage();
      doc.save().rect(0, 0, PAGE.w, 34).fill(C.brand).restore();
      doc.font('B').fontSize(11).fillColor(C.white).text(business.name, left, 11, { lineBreak: false });
      doc.font('R').fontSize(9).fillColor(C.mint).text(`Invoice ${inv.InvoiceNumber}  •  ${period}  (continued)`, left, 12, { width: CONTENT_W, align: 'right', lineBreak: false });
      y = 52;
    };

    // ===== 1. Header band =====
    doc.save().rect(0, 0, PAGE.w, 118).fill(C.brand).restore();
    doc.save().rect(0, 118, PAGE.w, 4).fill(C.accent).restore();
    drawLogo(doc, left, 24, 70, business);

    doc.font('B').fontSize(21).fillColor(C.white).text(business.name, left + 84, 28, { width: 260, lineBreak: false });
    doc.font('R').fontSize(9).fillColor(C.mint).text(business.tagline, left + 84, 56, { width: 250 });

    const infoX = 352; const infoW = right - infoX;
    let iy = 26;
    const infoLine = (label, value) => {
      if (!value) return;
      doc.font('S').fontSize(8).fillColor(C.mint).text(label, infoX, iy, { width: 46, lineBreak: false });
      doc.font('R').fontSize(8.5).fillColor(C.white).text(value, infoX + 48, iy, { width: infoW - 48 });
      iy += Math.max(12, doc.heightOfString(value, { width: infoW - 48 }) + 2);
    };
    infoLine('Address', business.address);
    infoLine('Phone', business.phone);
    infoLine('Email', business.email);
    infoLine('GSTIN', business.gst);

    // ===== 2. Title + meta =====
    y = 140;
    doc.font('B').fontSize(24).fillColor(C.ink).text('INVOICE', left, y, { lineBreak: false });
    doc.font('R').fontSize(9.5).fillColor(C.muted).text(`Milk delivery bill for ${period}`, left, y + 30, { lineBreak: false });
    pill(doc, right, y + 4, status.toUpperCase(), statusStyle[0], statusStyle[1], { align: 'right', h: 20, size: 9 });

    const metaX = 330; const metaY = y + 32; const metaColW = 112;
    labelValue(doc, metaX, metaY, 'Invoice No', inv.InvoiceNumber, { width: metaColW, bold: true });
    labelValue(doc, metaX + metaColW, metaY, 'Invoice Date', fmtDate(inv.CreatedAt), { width: metaColW - 20 });
    labelValue(doc, metaX, metaY + 34, 'Billing Period', period, { width: metaColW });
    labelValue(doc, metaX + metaColW, metaY + 34, 'Payment Terms', 'Due on receipt', { width: metaColW - 20 });
    y = metaY + 74;

    // ===== 3. Bill to / Deliver to =====
    const boxW = (CONTENT_W - 12) / 2; const boxH = 108;
    const party = (x, title, lines) => {
      doc.save().roundedRect(x, y, boxW, boxH, 8).fill(C.light).restore();
      doc.save().rect(x, y, 4, boxH).fill(C.accent).restore();
      doc.font('S').fontSize(7.5).fillColor(C.muted).text(title, x + 14, y + 10, { characterSpacing: 0.8, lineBreak: false });
      doc.font('B').fontSize(11.5).fillColor(C.ink).text(inv.CustomerName, x + 14, y + 22, { width: boxW - 28, lineBreak: false });
      let ly = y + 40;
      lines.forEach(([icon, val]) => {
        if (!val) return;
        doc.font('S').fontSize(8).fillColor(C.muted).text(icon, x + 14, ly, { width: 40, lineBreak: false });
        doc.font('R').fontSize(8.8).fillColor(C.text).text(val, x + 54, ly, { width: boxW - 68 });
        ly += Math.max(12, doc.heightOfString(val, { width: boxW - 68 }) + 2);
      });
    };
    party(left, 'BILL TO', [['Mobile', customer.Mobile], ['Email', customer.Email], ['Cust. ID', String(inv.CustomerId || '').slice(-6).toUpperCase()]]);
    const dq = num(customer.DailyQuantity) || num(inv.DailyQuantity);
    const split = (num(customer.MorningQuantity) || num(customer.EveningQuantity))
      ? `Morning ${num(customer.MorningQuantity)} L • Evening ${num(customer.EveningQuantity)} L` : '';
    party(left + boxW + 12, 'DELIVER TO', [['Address', customer.Address || '—'], ['Mobile', customer.Mobile], ['Milk', `${milkType} • ${dq} L/day`], ['Schedule', split]]);
    y += boxH + 18;

    // ===== 4. Line items =====
    const cols = [
      { key: 'no', label: '#', w: 26, align: 'center' },
      { key: 'desc', label: 'DESCRIPTION', w: 251, align: 'left' },
      { key: 'qty', label: 'QTY', w: 78, align: 'right' },
      { key: 'rate', label: 'RATE', w: 78, align: 'right' },
      { key: 'amt', label: 'AMOUNT', w: 90, align: 'right' },
    ];
    const colX = (i) => left + cols.slice(0, i).reduce((s, c) => s + c.w, 0);
    const headerRow = (fill, fg, labels) => {
      doc.save().rect(left, y, CONTENT_W, 20).fill(fill).restore();
      labels.forEach((c, i) => doc.font('S').fontSize(8).fillColor(fg).text(c.label, colX(i) + 6, y + 6, { width: c.w - 12, align: c.align, characterSpacing: 0.5, lineBreak: false }));
      y += 20;
    };
    headerRow(C.brand, C.white, cols);

    const items = [
      { desc: `${milkType} — daily doorstep delivery`, sub: `${num(inv.DailyQuantity)} L/day × ${num(inv.DeliveredDays)} delivered day${num(inv.DeliveredDays) === 1 ? '' : 's'} in ${period}${extras.length ? ` (incl. ${extras.length} extra-milk day${extras.length === 1 ? '' : 's'})` : ''}`, qty: qty(totalQty), rate: money(rate), amt: money(milkAmount) },
    ];
    if (deliveryCharge > 0) items.push({ desc: 'Monthly delivery charge', sub: 'Home delivery service for the month', qty: '—', rate: '—', amt: money(deliveryCharge) });
    if (Math.abs(adjustment) >= 0.01) items.push({ desc: adjustment > 0 ? 'Other charges / rounding' : 'Discount / adjustment', sub: '', qty: '—', rate: '—', amt: money(adjustment) });

    items.forEach((it, idx) => {
      const rowH = it.sub ? 34 : 24;
      ensureSpace(rowH);
      if (idx % 2 === 1) doc.save().rect(left, y, CONTENT_W, rowH).fill('#FAFAFA').restore();
      doc.font('R').fontSize(9).fillColor(C.muted).text(String(idx + 1), colX(0) + 6, y + 8, { width: cols[0].w - 12, align: 'center', lineBreak: false });
      doc.font('S').fontSize(9.5).fillColor(C.ink).text(it.desc, colX(1) + 6, y + 7, { width: cols[1].w - 12, lineBreak: false });
      if (it.sub) doc.font('R').fontSize(8).fillColor(C.muted).text(it.sub, colX(1) + 6, y + 20, { width: cols[1].w - 12, lineBreak: false });
      doc.font('R').fontSize(9.5).fillColor(C.text).text(it.qty, colX(2) + 6, y + 8, { width: cols[2].w - 12, align: 'right', lineBreak: false });
      doc.text(it.rate, colX(3) + 6, y + 8, { width: cols[3].w - 12, align: 'right', lineBreak: false });
      doc.font('S').fillColor(C.ink).text(it.amt, colX(4) + 6, y + 8, { width: cols[4].w - 12, align: 'right', lineBreak: false });
      y += rowH;
      doc.save().moveTo(left, y).lineTo(right, y).lineWidth(0.5).stroke(C.line).restore();
    });

    // ===== 5. Totals + amount in words =====
    y += 12;
    ensureSpace(120);
    const totX = left + 300; const totW = right - totX;
    const totalsStartY = y;
    const totRow = (label, val, opts = {}) => {
      if (opts.fill) doc.save().roundedRect(totX, y - 3, totW, 24, 5).fill(opts.fill).restore();
      doc.font(opts.bold ? 'B' : 'R').fontSize(opts.size || 9.5).fillColor(opts.fg || C.muted).text(label, totX + 10, y + 3, { width: totW / 2, lineBreak: false });
      doc.font(opts.bold ? 'B' : 'S').fontSize(opts.size || 9.5).fillColor(opts.fg || C.ink).text(val, totX, y + 3, { width: totW - 10, align: 'right', lineBreak: false });
      y += opts.fill ? 26 : 19;
    };
    totRow('Subtotal', money(milkAmount + (adjustment > 0 ? adjustment : 0)));
    if (adjustment < 0) totRow('Discount', money(adjustment));
    if (deliveryCharge > 0) totRow('Delivery charge', money(deliveryCharge));
    totRow('Grand Total', money(amount), { fill: C.brand, fg: C.white, bold: true, size: 11 });
    if (paid > 0) totRow('Paid', `- ${money(paid)}`, { fg: C.green });
    totRow(balance > 0 ? 'Balance Due' : 'Balance', money(balance), { fill: balance > 0 ? C.redBg : C.greenBg, fg: balance > 0 ? C.red : C.green, bold: true, size: 11 });

    // words + note on the left
    doc.font('S').fontSize(7.5).fillColor(C.muted).text('AMOUNT IN WORDS', left, totalsStartY, { characterSpacing: 0.6, lineBreak: false });
    doc.font('S').fontSize(9).fillColor(C.ink).text(amountInWords(amount), left, totalsStartY + 12, { width: 270 });
    doc.font('S').fontSize(7.5).fillColor(C.muted).text('PAYMENT', left, totalsStartY + 44, { characterSpacing: 0.6, lineBreak: false });
    doc.font('R').fontSize(8.5).fillColor(C.text).text(
      `Cash, UPI or bank transfer. Please quote invoice no. ${inv.InvoiceNumber}. For queries call ${business.phone || 'us'}.`,
      left, totalsStartY + 56, { width: 270 },
    );
    y = Math.max(y, totalsStartY + 92) + 10;

    // ===== 6. Delivery summary strip =====
    ensureSpace(70);
    doc.font('S').fontSize(7.5).fillColor(C.muted).text('DELIVERY SUMMARY', left, y, { characterSpacing: 0.8, lineBreak: false });
    y += 13;
    const stats = [
      ['Days in month', String(totalDays), C.ink],
      ['Delivered', String(num(inv.DeliveredDays)), C.green],
      ['Missed', String(num(inv.MissedDays)), num(inv.MissedDays) > 0 ? C.red : C.ink],
      ['Total milk', qty(totalQty), C.brand],
    ];
    const sw = (CONTENT_W - 3 * 10) / 4;
    stats.forEach(([l, v, col], i) => {
      const sx = left + i * (sw + 10);
      doc.save().roundedRect(sx, y, sw, 44, 7).fill(C.light).restore();
      doc.font('B').fontSize(15).fillColor(col).text(v, sx, y + 8, { width: sw, align: 'center', lineBreak: false });
      doc.font('R').fontSize(7.5).fillColor(C.muted).text(l.toUpperCase(), sx, y + 29, { width: sw, align: 'center', characterSpacing: 0.4, lineBreak: false });
    });
    y += 58;

    // ===== 7. Missed deliveries (full details) =====
    ensureSpace(40);
    doc.font('S').fontSize(7.5).fillColor(C.muted).text(`MISSED DELIVERIES (${missed.length})`, left, y, { characterSpacing: 0.8, lineBreak: false });
    y += 13;
    if (missed.length === 0) {
      doc.save().roundedRect(left, y, CONTENT_W, 26, 6).fill(C.greenBg).restore();
      doc.save().circle(left + 17, y + 13, 4.5).fill(C.green).restore();
      doc.font('S').fontSize(9).fillColor(C.green).text('No missed deliveries — milk was delivered on every day of the month.', left + 28, y + 7, { lineBreak: false });
      y += 34;
    } else {
      const mcols = [
        { label: '#', w: 26, align: 'center' }, { label: 'DATE', w: 96, align: 'left' }, { label: 'DAY', w: 60, align: 'left' },
        { label: 'QTY NOT DELIVERED', w: 110, align: 'right' }, { label: 'REASON', w: CONTENT_W - 292, align: 'left' },
      ];
      const mx = (i) => left + mcols.slice(0, i).reduce((s, c) => s + c.w, 0);
      const mHeader = () => {
        doc.save().rect(left, y, CONTENT_W, 18).fill(C.light).restore();
        mcols.forEach((c, i) => doc.font('S').fontSize(7.5).fillColor(C.muted).text(c.label, mx(i) + 6, y + 5, { width: c.w - 12, align: c.align, characterSpacing: 0.4, lineBreak: false }));
        y += 18;
      };
      mHeader();
      const sorted = [...missed].sort((a, b) => String(a.date).localeCompare(String(b.date)));
      sorted.forEach((m, i) => {
        const reason = m.reason || m.note || '—';
        const rh = Math.max(18, doc.font('R').fontSize(8.5).heightOfString(reason, { width: mcols[4].w - 12 }) + 8);
        if (y + rh > PAGE.h - 70) { ensureSpace(rh + 18); mHeader(); }
        if (i % 2 === 1) doc.save().rect(left, y, CONTENT_W, rh).fill('#FAFAFA').restore();
        doc.font('R').fontSize(8.5).fillColor(C.muted).text(String(i + 1), mx(0) + 6, y + 5, { width: mcols[0].w - 12, align: 'center', lineBreak: false });
        doc.font('S').fillColor(C.ink).text(fmtDate(m.date), mx(1) + 6, y + 5, { lineBreak: false });
        doc.font('R').fillColor(C.text).text(weekday(m.date), mx(2) + 6, y + 5, { lineBreak: false });
        doc.fillColor(C.red).text(qty(m.quantity !== undefined ? m.quantity : inv.DailyQuantity), mx(3) + 6, y + 5, { width: mcols[3].w - 12, align: 'right', lineBreak: false });
        doc.fillColor(C.text).text(reason, mx(4) + 6, y + 5, { width: mcols[4].w - 12 });
        y += rh;
        doc.save().moveTo(left, y).lineTo(right, y).lineWidth(0.5).stroke(C.line).restore();
      });
      const missedQty = sorted.reduce((s, m) => s + (m.quantity !== undefined ? num(m.quantity) : num(inv.DailyQuantity)), 0);
      doc.font('R').fontSize(8).fillColor(C.muted).text(
        `${missed.length} day${missed.length === 1 ? '' : 's'} not delivered (${qty(missedQty)} not billed). Only delivered days are charged above.`,
        left, y + 5, { width: CONTENT_W },
      );
      y += 22;
    }

    // ===== 8. Extra milk (if any) =====
    if (extras.length) {
      y += 6;
      ensureSpace(40);
      doc.font('S').fontSize(7.5).fillColor(C.muted).text(`EXTRA MILK DELIVERED (${extras.length})`, left, y, { characterSpacing: 0.8, lineBreak: false });
      y += 13;
      const exSorted = [...extras].sort((a, b) => String(a.date).localeCompare(String(b.date)));
      exSorted.forEach((e, i) => {
        ensureSpace(18);
        if (i % 2 === 1) doc.save().rect(left, y, CONTENT_W, 18).fill('#FAFAFA').restore();
        doc.font('S').fontSize(8.5).fillColor(C.ink).text(fmtDate(e.date), left + 6, y + 5, { lineBreak: false });
        doc.font('R').fillColor(C.text).text(weekday(e.date), left + 102, y + 5, { lineBreak: false });
        doc.fillColor(C.green).text(`+ ${qty(e.quantity)}`, left + 160, y + 5, { width: 100, lineBreak: false });
        doc.fillColor(C.muted).text(e.reason || e.note || 'Additional milk requested', left + 270, y + 5, { width: CONTENT_W - 276, lineBreak: false });
        y += 18;
        doc.save().moveTo(left, y).lineTo(right, y).lineWidth(0.5).stroke(C.line).restore();
      });
      y += 4;
    }

    // ===== 9. Payments received =====
    if (payments.length) {
      y += 6;
      ensureSpace(40);
      doc.font('S').fontSize(7.5).fillColor(C.muted).text(`PAYMENTS RECEIVED (${payments.length})`, left, y, { characterSpacing: 0.8, lineBreak: false });
      y += 13;
      const sortedP = [...payments].sort((a, b) => String(a.PaymentDate).localeCompare(String(b.PaymentDate)));
      sortedP.forEach((p, i) => {
        ensureSpace(18);
        if (i % 2 === 1) doc.save().rect(left, y, CONTENT_W, 18).fill('#FAFAFA').restore();
        doc.font('S').fontSize(8.5).fillColor(C.ink).text(fmtDate(p.PaymentDate), left + 6, y + 5, { lineBreak: false });
        doc.font('R').fillColor(C.text).text(p.PaymentMode || 'Cash', left + 102, y + 5, { lineBreak: false });
        doc.fillColor(C.muted).text(p.Notes || '', left + 190, y + 5, { width: CONTENT_W - 300, lineBreak: false });
        doc.font('S').fillColor(C.green).text(money(p.AmountPaid), left, y + 5, { width: CONTENT_W - 6, align: 'right', lineBreak: false });
        y += 18;
        doc.save().moveTo(left, y).lineTo(right, y).lineWidth(0.5).stroke(C.line).restore();
      });
    }

    // ===== 10. Footer on every page =====
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const fy = PAGE.h - 54;
      doc.save().moveTo(left, fy).lineTo(right, fy).lineWidth(0.6).stroke(C.line).restore();
      doc.font('S').fontSize(8.5).fillColor(C.brand).text(`Thank you for choosing ${business.name}!`, left, fy + 8, { lineBreak: false });
      doc.font('R').fontSize(7.5).fillColor(C.muted).text('This is a computer-generated invoice and does not require a signature.', left, fy + 21, { lineBreak: false });
      doc.font('R').fontSize(7.5).fillColor(C.muted).text(`Page ${i - range.start + 1} of ${range.count}`, left, fy + 8, { width: CONTENT_W, align: 'right', lineBreak: false });
      const contact = [business.phone, business.email].filter(Boolean).join('  •  ');
      if (contact) doc.text(contact, left, fy + 21, { width: CONTENT_W, align: 'right', lineBreak: false });
    }
    doc.end();
  });
}

/** Loads everything for one invoice and renders it. Returns { buffer, filename, invoice } or null if not found. */
async function buildInvoicePdf(invoiceId) {
  const inv = await queryOne('SELECT * FROM dbo.Invoices WHERE Id=@id', { id: { type: NVarChar(36), value: invoiceId } });
  if (!inv) return null;
  const [customer, paymentsRs, business] = await Promise.all([
    queryOne('SELECT Name, Mobile, Email, Address, MilkType, DailyQuantity, MorningQuantity, EveningQuantity FROM dbo.Customers WHERE Id=@id', { id: { type: NVarChar(36), value: inv.CustomerId } }),
    query('SELECT * FROM dbo.Payments WHERE InvoiceId=@id AND AmountPaid > 0 ORDER BY PaymentDate', { id: { type: NVarChar(36), value: invoiceId } }),
    getBusinessProfile(),
  ]);
  const buffer = await renderInvoicePdf({ invoice: inv, customer: customer || {}, payments: paymentsRs.recordset, business });
  return { buffer, filename: `invoice-${inv.InvoiceNumber}.pdf`, invoice: inv, customer, business };
}

module.exports = { renderInvoicePdf, buildInvoicePdf, getBusinessProfile, amountInWords };
