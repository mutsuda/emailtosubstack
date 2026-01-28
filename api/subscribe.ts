
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, url } = req.body;

    if (!email || !url) {
      return res.status(400).json({ error: 'Faltan parámetros: email y url son obligatorios.' });
    }

    // 1. Limpiar y validar la URL
    let cleanUrl = url.trim().replace(/\/$/, "");
    if (!cleanUrl.startsWith('http')) cleanUrl = `https://${cleanUrl}`;
    
    const parsedUrl = new URL(cleanUrl);
    const hostname = parsedUrl.hostname;
    
    // 2. Determinar el subdominio para la API
    // itnig.substack.com -> itnig
    // newsletter.itnig.net -> newsletter.itnig.net (usar el host directamente)
    let apiHostname = hostname;
    if (hostname.endsWith('.substack.com')) {
      apiHostname = hostname;
    } else {
      // Si es dominio personalizado, Substack suele preferir su subdominio interno
      // pero probamos con el host actual primero que es lo que hacen los proxies.
      apiHostname = hostname;
    }

    const substackApiUrl = `https://${apiHostname}/api/v1/free_signup`;

    // 3. Petición con cabeceras que imitan a un navegador real
    const substackResponse = await fetch(substackApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Origin': `https://${apiHostname}`,
        'Referer': `https://${apiHostname}/`,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        email: email,
        first_url: cleanUrl,
        first_referrer: "",
        referral_code: "",
        source: "embed" // Algunas versiones de la API lo requieren
      }),
    });

    // 4. Procesar respuesta de forma segura
    const text = await substackResponse.text();
    let data;
    try {
      data = text ? JSON.parse(text) : { success: true };
    } catch (e) {
      data = { raw: text };
    }

    // 5. Responder al frontend
    return res.status(200).json({
      success: substackResponse.ok,
      status: substackResponse.status,
      message: substackResponse.ok ? 'Suscrito con éxito' : 'Substack rechazó la petición',
      data: data
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno en el proxy', 
      details: error.message 
    });
  }
}
