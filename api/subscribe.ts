
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuración CORS
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
      return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
    }

    // 1. Preparar URL base (ej: https://itnig.substack.com)
    let targetBaseUrl = url.trim();
    if (!targetBaseUrl.startsWith('http')) {
      targetBaseUrl = `https://${targetBaseUrl}`;
    }
    // Eliminar slash final si existe para consistencia
    targetBaseUrl = targetBaseUrl.replace(/\/$/, "");

    // 2. Construir endpoint específico del newsletter
    const endpoint = `${targetBaseUrl}/api/v1/free_signup`;

    console.log(`[Proxy] Target: ${endpoint} | Email: ${email}`);

    // 3. Payload según especificación de ingeniería inversa (TechTrails)
    const payload = {
      email: email,
      first_url: targetBaseUrl,
      first_referrer: "", // Dejar vacío ayuda a evitar comprobaciones estrictas de referer externo
      current_url: targetBaseUrl,
      referral_code: "",
      source: "cover_page", // CRÍTICO: Indica que viene de la página principal del newsletter
      saved_attribution_history: "[]"
    };

    // 4. Petición simulando ser el navegador en el propio dominio
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // User Agent moderno para pasar filtros de bot simples
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        // Origin y Referer deben coincidir con el dominio destino para evitar CSRF/CORS check fallido
        'Origin': targetBaseUrl,
        'Referer': `${targetBaseUrl}/`
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Proxy] Error de Substack:', response.status, data);
      return res.status(response.status).json({
        success: false,
        message: 'Substack rechazó la solicitud',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Suscripción enviada correctamente',
      data: data
    });

  } catch (error: any) {
    console.error('[Proxy] Error Interno:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
