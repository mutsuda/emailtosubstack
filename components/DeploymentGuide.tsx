
import React from 'react';

export const DeploymentGuide: React.FC = () => {
  const serverCode = `
// api/subscribe.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { email, url } = req.body;
  // Extraer "itnig" de "itnig.substack.com"
  const subdomain = new URL(url).hostname.split('.')[0]; 

  const response = await fetch('https://substack.com/api/v1/free_signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://substack.com', // Importante para Central API
    },
    body: JSON.stringify({
      email,
      newsletter_subdomain: subdomain, // Parámetro clave
      source: "cover_page"
    })
  });

  const data = await response.json();
  return res.status(response.status).json(data);
}
  `.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Despliegue del API Bridge</h1>
        <p className="mt-4 text-lg text-gray-600">
          Esta versión utiliza la API central de Substack, que requiere ejecutarse en un entorno de servidor (Node.js).
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: '1. Repositorio', desc: 'Sincroniza este código con GitHub.', icon: 'github' },
          { title: '2. Vercel', desc: 'Importa el repositorio en Vercel.', icon: 'vercel' },
          { title: '3. Producción', desc: 'Usa la URL que Vercel te proporcione.', icon: 'rocket' },
        ].map((step, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
             <h3 className="font-bold text-gray-900 mb-1 relative z-10">{step.title}</h3>
             <p className="text-sm text-gray-600 relative z-10">{step.desc}</p>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-400 mono">Código del Proxy (Simplificado)</span>
        </div>
        <div className="p-6 overflow-x-auto bg-gray-900">
          <pre className="text-blue-300 text-sm mono">
            {serverCode}
          </pre>
        </div>
      </section>
    </div>
  );
};
