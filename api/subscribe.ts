
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, url } = await req.json();

    if (!email || !url) {
      return new Response(JSON.stringify({ error: 'Email y URL son requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validación y parseo seguro de la URL
    let newsletterSubdomain = '';
    try {
      const parsedUrl = new URL(url);
      const hostnameParts = parsedUrl.hostname.split('.');
      // Caso normal: nombre.substack.com -> nombre
      // Caso dominio propio: newsletter.com -> newsletter (esto es más complejo, pero cubrimos lo básico)
      newsletterSubdomain = hostnameParts[0];
      
      if (newsletterSubdomain === 'www' || newsletterSubdomain === 'substack') {
        newsletterSubdomain = hostnameParts[1];
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: 'URL de Substack inválida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const substackApiUrl = `https://${newsletterSubdomain}.substack.com/api/v1/free_signup`;

    const substackResponse = await fetch(substackApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': `https://${newsletterSubdomain}.substack.com`,
        'Referer': url,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        email,
        first_url: url,
        first_referrer: "",
        referral_code: "",
      }),
    });

    const data = await substackResponse.json();
    
    return new Response(JSON.stringify(data), {
      status: substackResponse.status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error: any) {
    console.error('Error en el handler:', error);
    return new Response(JSON.stringify({ 
      error: 'Error interno en el servidor', 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
