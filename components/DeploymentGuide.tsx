
import React from 'react';

export const DeploymentGuide: React.FC = () => {
  const serverCode = `
// api/subscribe.ts
export default async function handler(req, res) {
  const { email, url } = req.body;
  
  // Url destino limpia (ej: https://itnig.substack.com)
  const targetUrl = url.replace(/\\/$/, ""); 
  
  // Endpoint específico del dominio
  const endpoint = \`\${targetUrl}/api/v1/free_signup\`;

  const payload = {
    email,
    first_url: targetUrl,
    first_referrer: "",
    current_url: targetUrl,
    source: "cover_page" // Clave para que Substack acepte la petición
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Engañamos a Substack para que crea que la petición viene de su propia web
      'Origin': targetUrl,
      'Referer': targetUrl + '/'
    },
    body: JSON.stringify(payload)
  });

  return res.json(await response.json());
}
  `.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Despliegue (Método TechTrails)</h1>
        <p className="mt-4 text-lg text-gray-600">
          Esta versión implementa la simulación de "cover_page" para interactuar directamente con el dominio del newsletter.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: '1. Repositorio', desc: 'Sincroniza este código con GitHub.', icon: 'github' },
          { title: '2. Vercel', desc: 'Importa el repositorio en Vercel.', icon: 'vercel' },
          { title: '3. Producción', desc: 'Tu endpoint /api/subscribe estará listo.', icon: 'rocket' },
        ].map((step, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
             <h3 className="font-bold text-gray-900 mb-1 relative z-10">{step.title}</h3>
             <p className="text-sm text-gray-600 relative z-10">{step.desc}</p>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-400 mono">Lógica del Proxy</span>
        </div>
        <div className="p-6 overflow-x-auto bg-gray-900">
          <pre className="text-purple-300 text-sm mono">
            {serverCode}
          </pre>
        </div>
      </section>
    </div>
  );
};
