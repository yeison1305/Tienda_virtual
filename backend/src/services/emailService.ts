import nodemailer from 'nodemailer';

const FROM = process.env.EMAIL_FROM || '"VOID Culture" <noreply@void.co>';

let transporterInstance: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: (process.env.SMTP_SECURE || 'true') === 'true',
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transporterInstance;
}

function hasSmtpConfig() {
  return Boolean((process.env.SMTP_USER || process.env.EMAIL_USER) && (process.env.SMTP_PASS || process.env.EMAIL_PASS));
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shipping: {
    address: string;
    city: string;
    department: string;
    phone: string;
  };
}

function fmtCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

function buildOrderHtml(data: OrderEmailData): string {
  const itemsRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#999;">${item.name}</td>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#999;text-align:center;">${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#fff;text-align:right;">${fmtCOP(item.price * item.quantity)}</td>
        </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="color:#fff;font-size:24px;letter-spacing:0.3em;margin:0;">VOID</h1>
    </div>

    <div style="text-align:center;margin-bottom:40px;">
      <div style="width:60px;height:60px;background:#fff;border-radius:50%;margin:0 auto 20px;line-height:60px;font-size:30px;">✓</div>
      <h2 style="color:#fff;font-size:20px;margin:0 0 8px;">Pedido confirmado</h2>
      <p style="color:#666;font-size:14px;margin:0;">ID: ${data.orderId}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:30px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;color:#444;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Producto</th>
          <th style="text-align:center;padding:8px 0;color:#444;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Cant.</th>
          <th style="text-align:right;padding:8px 0;color:#444;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:16px 0 0;color:#fff;font-size:16px;font-weight:bold;">Total</td>
          <td style="padding:16px 0 0;color:#fff;font-size:16px;font-weight:bold;text-align:right;">${fmtCOP(data.total)}</td>
        </tr>
      </tfoot>
    </table>

    <div style="background:#111;padding:20px;margin-bottom:30px;">
      <p style="color:#444;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;">Dirección de envío</p>
      <p style="color:#999;font-size:14px;margin:0;">${data.customerName}</p>
      <p style="color:#999;font-size:14px;margin:4px 0 0;">${data.shipping.address}</p>
      <p style="color:#999;font-size:14px;margin:4px 0 0;">${data.shipping.city}, ${data.shipping.department}</p>
      <p style="color:#999;font-size:14px;margin:4px 0 0;">Tel: ${data.shipping.phone}</p>
    </div>

    <div style="background:#111;padding:20px;margin-bottom:30px;">
      <p style="color:#444;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;">¿Qué sigue?</p>
      <p style="color:#999;font-size:14px;margin:0 0 8px;">1. Prepararemos tu pedido en 1-2 días hábiles</p>
      <p style="color:#999;font-size:14px;margin:0 0 8px;">2. Te notificaremos cuando esté en camino</p>
      <p style="color:#999;font-size:14px;margin:0;">3. Recibirás tu pedido</p>
    </div>

    <div style="text-align:center;border-top:1px solid #222;padding-top:20px;">
      <p style="color:#333;font-size:12px;margin:0;">© 2026 VOID Culture</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  if (!hasSmtpConfig()) {
    console.log('[Email] Nodemailer no configurado (Faltan variables EMAIL_USER o EMAIL_PASS) — email no enviado a', data.customerEmail);
    return;
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || FROM,
      to: data.customerEmail,
      subject: `Pedido confirmado — VOID #${data.orderId.slice(-8).toUpperCase()}`,
      html: buildOrderHtml(data),
    });
    console.log('[Email] Confirmación enviada a', data.customerEmail);
  } catch (error: any) {
    console.error('[Email] Error enviando confirmación:', error);
  }
}

export async function sendNewsletterWelcome(email: string) {
  if (!hasSmtpConfig()) {
    console.log('[Email] Nodemailer no configurado (Faltan variables EMAIL_USER o EMAIL_PASS) — newsletter no enviado a', email);
    return;
  }

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || FROM,
      to: email,
      subject: 'Bienvenido a VOID Culture',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;text-align:center;">
    <h1 style="color:#fff;font-size:24px;letter-spacing:0.3em;margin:0 0 30px;">VOID</h1>
    <h2 style="color:#fff;font-size:18px;margin:0 0 16px;">Bienvenido a la comunidad</h2>
    <p style="color:#666;font-size:14px;margin:0 0 30px;">Pronto recibirás noticias de nuestros nuevos drops y lanzamientos exclusivos.</p>
    <div style="border-top:1px solid #222;padding-top:20px;">
      <p style="color:#333;font-size:12px;margin:0;">© 2026 VOID Culture</p>
    </div>
  </div>
</body>
</html>`,
    });
    console.log('[Email] Newsletter enviado a', email);
  } catch (error) {
    console.error('[Email] Error enviando newsletter:', error);
  }
}

export interface NewsletterContent {
  subject: string;
  title: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
}

function buildNewsletterHtml(content: NewsletterContent): string {
  const { subject, title, message, ctaText, ctaLink, imageUrl } = content;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080808;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="color:#fff;font-size:24px;letter-spacing:0.3em;margin:0;">VOID</h1>
    </div>

    ${imageUrl ? `
    <div style="margin-bottom:30px;border-radius:8px;overflow:hidden;">
      <img src="${imageUrl}" alt="${title}" style="width:100%;height:auto;display:block;" />
    </div>
    ` : ''}

    <div style="background:#111;padding:30px;border-radius:8px;margin-bottom:30px;">
      <h2 style="color:#fff;font-size:22px;margin:0 0 16px;">${title}</h2>
      <p style="color:#999;font-size:15px;line-height:1.7;margin:0;">${message.replace(/\n/g, '<br>')}</p>
    </div>

    ${ctaText && ctaLink ? `
    <div style="text-align:center;margin-bottom:40px;">
      <a href="${ctaLink}" style="display:inline-block;background:#fff;color:#000;padding:16px 40px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;font-weight:bold;border-radius:4px;">
        ${ctaText}
      </a>
    </div>
    ` : ''}

    <div style="text-align:center;border-top:1px solid #222;padding-top:20px;">
      <p style="color:#333;font-size:12px;margin:0 0 8px;">© 2026 VOID Culture</p>
      <p style="color:#333;font-size:11px;margin:0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/newsletter/unsubscribe" style="color:#555;text-decoration:underline;">Cancelar suscripción</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendBulkNewsletter(emails: string[], content: NewsletterContent) {
  if (!hasSmtpConfig()) {
    console.log('[Email] Nodemailer no configurado — newsletter no enviado');
    return { sent: 0, failed: emails.length };
  }

  const html = buildNewsletterHtml(content);
  let sent = 0;
  let failed = 0;

  // Send in batches to avoid rate limits
  const batchSize = 50;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    await Promise.all(batch.map(async (email) => {
      try {
        await getTransporter().sendMail({
          from: process.env.EMAIL_FROM || FROM,
          to: email,
          subject: content.subject,
          html,
        });
        sent++;
      } catch (error) {
        console.error(`[Email] Error enviando a ${email}:`, error);
        failed++;
      }
    }));

    // Small delay between batches
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`[Email] Newsletter enviado: ${sent} exitosos, ${failed} fallidos`);
  return { sent, failed };
}