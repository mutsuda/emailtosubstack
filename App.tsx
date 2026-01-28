
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

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, url }),
      });

      if (response.status === 404) {
        throw new Error("Backend no disponible (404). Despliega en Vercel para activar la API.");
      }

      const result = await response.json();
      
      const isSuccess = response.ok && result.success;
      
      setSubscriptions(prev => 
        prev.map(s => s.id === id ? { 
          ...s, 
          status: isSuccess ? 'success' : 'failed', 
          responseBody: result 
        } : s)
      );

      setLogs(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        method: 'POST',
        endpoint: '/api/subscribe',
        requestBody: { email, url, method: 'Direct Endpoint Spoofing' },
        responseBody: result,
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      }, ...prev]);

    } catch (error: any) {
      const errorResponse = { success: false, error: "Error de red", message: error.message };
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-2xl font-bold text-gray-900">Suscripción</h2>
                   <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">v2.0 TechTrails</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">Usa tu propia interfaz. El backend se encarga de negociar con Substack simulando ser una visita orgánica.</p>
                <SubstackForm onSubmit={handleNewSubscription} />
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="font-bold mb-2 flex items-center text-sm">
                  <span className="mr-2">🚀</span> Método Directo
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-2">
                  Implementando la estrategia "cover_page". Atacamos directamente al dominio del newsletter inyectando las cabeceras <code>Origin</code> y <code>Referer</code> correctas.
                </p>
                <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-purple-200 mt-2">
                  source: "cover_page"<br/>
                  endpoint: /api/v1/free_signup
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Traza de Ejecución</h2>
              </div>
              <LogViewer logs={logs} subscriptions={subscriptions} />
            </div>
          </div>
        ) : (
          <DeploymentGuide />
        )}
      </main>
      <footer className="py-8 text-center text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">
        Substack API Bridge &bull; TechTrails Method
      </footer>
    </div>
  );
};

export default App;
