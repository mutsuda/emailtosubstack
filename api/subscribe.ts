
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const { email, url } = req.body;

    if (!email || !url) {
      return res.status(400).json({ error: 'Email y URL son obligatorios.' });
    }

    const cleanUrl = url.trim().replace(/\/$/, "");
    let hostname = '';
    let subdomain = '';
    
    try {
      const urlObj = new URL(cleanUrl);
      hostname = urlObj.hostname;
      // Extraer itnig de itnig.substack.com
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        subdomain = parts[0];
      }
    } catch (e) {
      return res.status(400).json({ error: 'La URL proporcionada no es válida.' });
    }
    
    // Usamos el endpoint central de Substack que es más estable
    const substackApiUrl = `https://substack.com/api/v1/free_signup`;

    const substackResponse = await fetch(substackApiUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Origin': 'https://substack.com',
        'Referer': 'https://substack.com/',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        email,
        first_url: cleanUrl,
        first_referrer: "",
        referral_code: "",
        source: "newsletter_signup",
        newsletter_subdomain: subdomain, // CAMBIO CLAVE: Enviamos el subdominio aquí
        reserved_address: null
      }),
    });

    clearTimeout(timeoutId);

    const text = await substackResponse.text();
    let data;
    try {
      data = text ? JSON.parse(text) : { success: true };
    } catch (e) {
      data = { raw: text };
    }

    // Substack a veces devuelve 400 si el email ya existe o el subdominio es inválido
    return res.status(200).json({
      success: substackResponse.ok,
      status: substackResponse.status,
      message: substackResponse.ok ? 'Suscripción exitosa' : 'Substack rechazó la petición',
      subdomain_detected: subdomain,
      data: data
    });

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('API Proxy Error:', error);
    
    const isTimeout = error.name === 'AbortError';
    return res.status(isTimeout ? 504 : 500).json({ 
      success: false, 
      error: isTimeout ? 'Timeout con Substack' : 'Error en el servidor', 
      details: error.message 
    });
  }
}
