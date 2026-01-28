
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuración CORS básica para permitir el uso desde el frontend
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, url } = req.body;

    if (!email || !url) {
      return res.status(400).json({ error: 'Faltan parámetros: email o url' });
    }

    // 1. Extraer el subdominio de la URL (ej: itnig.substack.com -> itnig)
    let targetSubdomain = '';
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const parts = urlObj.hostname.split('.');
      // Asumimos estructura standard: [subdominio].substack.com
      if (parts.length >= 2 && urlObj.hostname.includes('substack')) {
        targetSubdomain = parts[0];
      } else {
        // Fallback para dominios custom o estructuras raras
        targetSubdomain = parts[0];
      }
    } catch (e) {
      return res.status(400).json({ error: 'URL inválida' });
    }

    console.log(`Intentando suscribir ${email} al subdominio: ${targetSubdomain}`);

    // 2. Usar la API Central. Esta es la versión que suele funcionar (14:52 version).
    const targetUrl = 'https://substack.com/api/v1/free_signup';

    const payload = {
      email,
      newsletter_subdomain: targetSubdomain, // CLAVE: Decirle a la API central a qué newsletter va
      source: "cover_page",
      first_url: url,
      first_referrer: "https://substack.com/",
      current_url: url,
      referral_code: ""
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Imitamos ser la página principal de Substack
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://substack.com',
        'Referer': 'https://substack.com/'
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    // Substack devuelve 200 OK si todo va bien
    if (!response.ok) {
      console.error('Error respuesta Substack:', data);
      return res.status(response.status).json({
        success: false,
        message: 'Substack rechazó la suscripción',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario suscrito correctamente',
      data: data
    });

  } catch (error: any) {
    console.error('Server Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
