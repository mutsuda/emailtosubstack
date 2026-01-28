
import React from 'react';

export const DeploymentGuide: React.FC = () => {
  const serverCode = `
// api/subscribe.ts (Vercel Node.js Function)
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { email, url } = req.body;
  const host = new URL(url).hostname;
  const apiUrl = \`https://\${host}/api/v1/free_signup\`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': \`https://\${host}\`,
        'Referer': \`https://\${host}/\`,
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({ email, first_url: url })
    });

    const data = await response.json().catch(() => ({ success: true }));
    return res.status(200).json({ success: response.ok, data });
  } catch (error) {
    return res.status(500).json({ error: 'Proxy failed' });
  }
}
  `.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Guía de Despliegue Real</h1>
        <p className="mt-4 text-lg text-gray-600">
          Para que el botón "Ejecutar Suscripción" funcione de verdad, el código debe correr en Vercel.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: '1. Repositorio', desc: 'Sube estos archivos a un repo de GitHub.', icon: '📁' },
          { title: '2. Vercel', desc: 'Importa el proyecto en vercel.com.', icon: '⚡' },
          { title: '3. /api folder', desc: 'Vercel activará automáticamente la ruta /api/subscribe.', icon: '🚀' },
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
          <span className="text-xs text-gray-400 mono">Lógica del Servidor</span>
        </div>
        <div className="p-6 overflow-x-auto bg-gray-900">
          <pre className="text-blue-300 text-sm mono">
            {serverCode}
          </pre>
        </div>
      </section>

      <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-start space-x-4">
        <div className="text-2xl">⚠️</div>
        <div>
          <h4 className="font-bold text-orange-900">¿Por qué ves errores 404 ahora mismo?</h4>
          <p className="text-sm text-orange-800 leading-relaxed">
            Las funciones de servidor (carpeta <code className="bg-orange-200 px-1 rounded">/api</code>) solo funcionan cuando el código está desplegado en Vercel o usando el comando <code className="bg-orange-200 px-1 rounded">vercel dev</code> localmente. En este entorno de previsualización web, las funciones de servidor no están activas.
          </p>
        </div>
      </div>
    </div>
  );
};
