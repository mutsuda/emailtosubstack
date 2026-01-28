
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SubstackForm } from './components/SubstackForm';
import { LogViewer } from './components/LogViewer';
import { DeploymentGuide } from './components/DeploymentGuide';
import { Subscription, ApiLog } from './types';

const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [view, setView] = useState<'service' | 'deploy'>('service');

  const handleNewSubscription = useCallback(async (email: string, url: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newSub: Subscription = {
      id,
      email,
      url,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    setSubscriptions(prev => [newSub, ...prev]);

    // Detección de entorno local/preview que no tiene backend
    const isLocal = window.location.hostname.includes('web-platform') || 
                    window.location.hostname.includes('stackblitz') ||
                    window.location.hostname.includes('localhost');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, url }),
      });

      if (response.status === 404) {
        throw new Error("Ruta /api/subscribe no encontrada (404). Asegúrate de que estás en un despliegue de Vercel con funciones habilitadas.");
      }

      const result = await response.json();
      const isActuallySuccess = result.success === true;
      
      setSubscriptions(prev => 
        prev.map(s => s.id === id ? { 
          ...s, 
          status: isActuallySuccess ? 'success' : 'failed', 
          responseBody: result 
        } : s)
      );

      setLogs(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        method: 'POST',
        endpoint: '/api/subscribe',
        requestBody: { email, url },
        responseBody: result,
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      }, ...prev]);

    } catch (error: any) {
      console.error('Error in request:', error);
      
      const errorResponse = { 
        error: "Error de comunicación", 
        message: error.message,
        tip: isLocal ? "Estás en modo previsualización local. Para que la API funcione de verdad, debes desplegar este código en Vercel." : "Verifica los logs de Vercel."
      };

      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'failed', responseBody: errorResponse } : s));
      setLogs(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        method: 'POST',
        endpoint: '/api/subscribe',
        requestBody: { email, url },
        responseBody: errorResponse,
        statusCode: 500,
        timestamp: new Date().toISOString(),
      }, ...prev]);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header setView={setView} currentView={view} />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {view === 'service' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <section>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">API Proxy Substack</h2>
                  <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">v1.2 Stable</span>
                </div>
                <p className="text-gray-600 mb-6 text-sm">Usa este endpoint para suscribir usuarios programáticamente sin problemas de CORS.</p>
                <SubstackForm onSubmit={handleNewSubscription} />
              </section>
              
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Uso desde CURL / App Externa</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto border-l-4 border-orange-500 shadow-inner">
                  <code className="text-gray-300 text-xs mono block leading-relaxed">
                    <span className="text-pink-400">curl</span> -X POST https://tu-app.vercel.app/api/subscribe \<br/>
                    &nbsp;&nbsp;-H <span className="text-green-400">"Content-Type: application/json"</span> \<br/>
                    &nbsp;&nbsp;-d '<span className="text-yellow-400">{"{"} "email": "test@mail.com", "url": "https://itnig.substack.com" {"}"}</span>'
                  </code>
                </div>
              </section>
            </div>
            
            <div className="space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Monitor de Tráfico</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Edge Runtime</span>
                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  </div>
                </div>
                <LogViewer logs={logs} subscriptions={subscriptions} />
              </section>
            </div>
          </div>
        ) : (
          <DeploymentGuide />
        )}
      </main>
      <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-400 text-[10px] uppercase tracking-widest">
          Substack Automator &bull; Bridge Service &bull; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default App;
