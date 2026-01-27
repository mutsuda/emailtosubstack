
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
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

    // Parseo robusto de la URL
    let newsletterSubdomain = '';
    try {
      const parsedUrl = new URL(url);
      const hostParts = parsedUrl.hostname.split('.');
      // itnig.substack.com -> itnig
      // newsletter.itnig.net -> newsletter
      newsletterSubdomain = hostParts[0];
      if (newsletterSubdomain === 'www' && hostParts.length > 1) {
        newsletterSubdomain = hostParts[1];
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: 'URL inválida' }), { status: 400 });
    }

    const substackApiUrl = `https://${newsletterSubdomain}.substack.com/api/v1/free_signup`;

    const substackResponse = await fetch(substackApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Origin': `https://${newsletterSubdomain}.substack.com`,
        'Referer': `${url}/`
      },
      body: JSON.stringify({
        email,
        first_url: url,
        first_referrer: "",
        referral_code: "",
      }),
    });

    // LEER COMO TEXTO PRIMERO PARA EVITAR "Unexpected end of JSON input"
    const responseText = await substackResponse.text();
    let responseData;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : { success: true, message: 'Subscribed (empty response)' };
    } catch (e) {
      responseData = { success: substackResponse.ok, rawResponse: responseText };
    }
    
    return new Response(JSON.stringify(responseData), {
      status: substackResponse.status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Error interno', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
