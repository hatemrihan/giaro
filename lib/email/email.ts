import { Resend } from 'resend';

// ─── Resend Client (lazy — avoids build-time crash when env is absent) ────

let _resend: Resend | null = null;
function getResend(): Resend {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}

// The "from" address must be a verified domain in Resend
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Giaro <noreply@giaro.store>';

// ─── Types ────────────────────────────────────────────────────

interface SendNewsletterInput {
    recipients: string[];
    subject: string;
    heading: string;
    message: string;
}

interface SendResult {
    success: boolean;
    message?: string;
    error?: string;
    results?: { sent: number; failed: number };
}

interface OrderEmailData {
    customerEmail: string;
    customerName: string;
    orderId: string;
    orderItems: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    shippingCost: number;
    paymentMethod: string;
    shippingAddress: { country: string; address: string; apartment?: string };
    customerPhone: string;
}

// ─── Newsletter Email ─────────────────────────────────────────

export async function sendNewsletterEmail(input: SendNewsletterInput): Promise<SendResult> {
    const { recipients, subject, heading, message } = input;

    let sent = 0;
    let failed = 0;

    // Resend supports batch sending (up to 100 per call).
    // For larger lists we chunk into batches.
    const BATCH_SIZE = 50;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE);

        try {
            await getResend().batch.send(
                batch.map((email) => ({
                    from: FROM_EMAIL,
                    to: email,
                    subject,
                    html: buildNewsletterHtml(heading, message),
                }))
            );
            sent += batch.length;
        } catch (err) {
            console.error(`❌ Batch send failed (${i}–${i + batch.length}):`, err);
            failed += batch.length;
        }
    }

    if (failed === recipients.length) {
        return { success: false, error: 'All emails failed to send', results: { sent, failed } };
    }

    return {
        success: true,
        message: `Newsletter sent to ${sent} recipients${failed > 0 ? ` (${failed} failed)` : ''}`,
        results: { sent, failed },
    };
}

// ─── Order Confirmation Email ─────────────────────────────────

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        await getResend().emails.send({
            from: FROM_EMAIL,
            to: data.customerEmail,
            subject: `Order Confirmed — ${data.orderId}`,
            html: buildOrderConfirmationHtml(data),
        });
        return { success: true, message: 'Order confirmation email sent' };
    } catch (err) {
        console.error('❌ Order confirmation email failed:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Failed to send email' };
    }
}

// ─── HTML Templates ───────────────────────────────────────────

function buildNewsletterHtml(heading: string, message: string): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <tr>
      <td style="background:#1c1917;padding:32px 40px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px">Giaro</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:40px">
        <h2 style="color:#1c1917;margin:0 0 16px;font-size:20px;font-weight:600">${heading}</h2>
        <div style="color:#44403c;font-size:15px;line-height:1.7">${message.replace(/\n/g, '<br>')}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;background:#fafaf9;text-align:center;border-top:1px solid #e7e5e4">
        <p style="color:#a8a29e;font-size:12px;margin:0">You received this because you subscribed to Giaro updates.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildOrderConfirmationHtml(data: OrderEmailData): string {
    const itemRows = data.orderItems
        .map(
            (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e7e5e4;color:#1c1917;font-size:14px">${item.name}</td>
        <td style="padding:12px 0;border-bottom:1px solid #e7e5e4;color:#78716c;font-size:14px;text-align:center">×${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #e7e5e4;color:#1c1917;font-size:14px;text-align:right;font-weight:600">L.E ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
        )
        .join('');

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <tr>
      <td style="background:#1c1917;padding:32px 40px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700">Giaro</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:40px">
        <h2 style="color:#1c1917;margin:0 0 8px;font-size:20px">Thank you, ${data.customerName}!</h2>
        <p style="color:#78716c;margin:0 0 24px;font-size:14px">Your order <strong style="color:#1c1917">${data.orderId}</strong> has been confirmed.</p>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <th style="text-align:left;padding:8px 0;border-bottom:2px solid #1c1917;color:#1c1917;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Item</th>
            <th style="text-align:center;padding:8px 0;border-bottom:2px solid #1c1917;color:#1c1917;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Qty</th>
            <th style="text-align:right;padding:8px 0;border-bottom:2px solid #1c1917;color:#1c1917;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Price</th>
          </tr>
          ${itemRows}
          <tr>
            <td colspan="2" style="padding:12px 0;color:#78716c;font-size:14px">Shipping</td>
            <td style="padding:12px 0;text-align:right;color:#1c1917;font-size:14px">L.E ${data.shippingCost.toLocaleString()}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:16px 0 0;font-size:16px;font-weight:700;color:#1c1917;border-top:2px solid #1c1917">Total</td>
            <td style="padding:16px 0 0;text-align:right;font-size:16px;font-weight:700;color:#1c1917;border-top:2px solid #1c1917">L.E ${data.totalAmount.toLocaleString()}</td>
          </tr>
        </table>

        <div style="margin-top:32px;padding:20px;background:#fafaf9;border-radius:8px">
          <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#a8a29e;font-weight:600">Delivery Address</p>
          <p style="margin:0;color:#1c1917;font-size:14px">${data.shippingAddress.address}${data.shippingAddress.apartment ? ', ' + data.shippingAddress.apartment : ''}</p>
          <p style="margin:4px 0 0;color:#78716c;font-size:14px">${data.shippingAddress.country}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;background:#fafaf9;text-align:center;border-top:1px solid #e7e5e4">
        <p style="color:#a8a29e;font-size:12px;margin:0">Payment method: ${data.paymentMethod} · Phone: ${data.customerPhone}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
