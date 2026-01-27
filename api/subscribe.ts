
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

    // Extraer el subdominio de la URL de Substack
    const hostname = new URL(url).hostname;
    const newsletterSubdomain = hostname.split('.')[0];
    const substackApiUrl = `https://${newsletterSubdomain}.substack.com/api/v1/free_signup`;

    const substackResponse = await fetch(substackApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
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
    return new Response(JSON.stringify({ error: 'Error interno', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
