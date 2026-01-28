
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, url } = req.body;

    if (!email || !url) {
      return res.status(400).json({ error: 'Faltan campos: email y url.' });
    }

    // 1. Normalizar URL y extraer subdominio
    let cleanUrl = url.trim().replace(/\/$/, "");
    if (!cleanUrl.startsWith('http')) cleanUrl = `https://${cleanUrl}`;
    
    const urlObj = new URL(cleanUrl);
    const hostname = urlObj.hostname;
    
    // El endpoint real al que el navegador envía los datos
    const targetUrl = `https://${hostname}/api/v1/free_signup`;

    console.log(`Intentando suscribir a ${email} en ${targetUrl}`);

    // 2. Realizar la petición con cabeceras "Stealth"
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Origin': `https://${hostname}`,
        'Referer': `https://${hostname}/`,
        'X-Requested-With': 'XMLHttpRequest',
        'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"'
      },
      body: JSON.stringify({
        email: email,
        first_url: cleanUrl,
        first_referrer: "",
        referral_code: "",
        source: "embed" // Muy importante: le dice a Substack que viene de un iframe/embed
      }),
    });

    const status = response.status;
    const text = await response.text();
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      result = { raw: text };
    }

    // 3. Responder al frontend con el detalle de lo que dijo Substack
    return res.status(200).json({
      success: response.ok,
      status: status,
      message: response.ok ? '¡Suscripción enviada con éxito!' : 'Error en la API de Substack',
      debug: {
        target: targetUrl,
        response: result
      }
    });

  } catch (error: any) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno en el Bridge', 
      details: error.message 
    });
  }
}
