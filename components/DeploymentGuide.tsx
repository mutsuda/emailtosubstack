
import React from 'react';

export const DeploymentGuide: React.FC = () => {
  const serverCode = `
// api/subscribe.ts (Vercel Serverless Function)
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { email, url } = req.body;
  const newsletterName = new URL(url).hostname.split('.')[0];
  const substackApiUrl = \`https://\${newsletterName}.substack.com/api/v1/free_signup\`;

  try {
    const response = await fetch(substackApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        first_url: url,
        first_referrer: "",
        referral_code: "",
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}
  `.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Despliegue en Vercel</h1>
        <p className="mt-4 text-lg text-gray-600">
          Convierte este prototipo en un servicio de producción real en menos de 5 minutos.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: '1. Estructura', desc: 'Crea una carpeta /api en la raíz de tu proyecto.', icon: '📁' },
          { title: '2. Backend', desc: 'Añade el archivo subscribe.ts para manejar el CORS.', icon: '⚡' },
          { title: '3. Deploy', desc: 'Conecta tu GitHub a Vercel y listo.', icon: '🚀' },
        ].map((step, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-3xl mb-3">{step.icon}</div>
            <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.desc}</p>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-gray-400 mono">api/subscribe.ts</span>
        </div>
        <div className="p-6 overflow-x-auto bg-gray-900">
          <pre className="text-blue-300 text-sm mono">
            {serverCode}
          </pre>
        </div>
        <div className="p-6 bg-blue-50 border-t border-blue-100">
          <h4 className="font-bold text-blue-900 mb-2">💡 ¿Por qué usar Serverless?</h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            Substack protege sus formularios con mecanismos que el navegador bloquea si se llaman desde otro dominio (CORS). 
            Al usar una <strong>Serverless Function</strong>, la petición se hace desde el servidor de Vercel directamente a los servidores de Substack, evitando cualquier bloqueo del navegador.
          </p>
        </div>
      </section>

      <div className="flex flex-col items-center space-y-4">
        <p className="text-gray-500 text-sm">¿Listo para empezar?</p>
        <a 
          href="https://vercel.com/new" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
        >
          Desplegar en Vercel Gratis
        </a>
      </div>
    </div>
  );
};
