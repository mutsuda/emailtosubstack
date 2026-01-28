
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

      // Si el proxy mismo falla (ej: no desplegado)
      if (response.status === 404) {
        throw new Error("El endpoint /api/subscribe no existe. ¿Has desplegado en Vercel?");
      }

      const result = await response.json();
      
      // Consideramos éxito si la API del proxy devolvió success: true
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
      console.error('Request Execution Error:', error);
      
      const errorResponse = { 
        success: false,
        error: "Error Crítico", 
        message: error.message,
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
                  <h2 className="text-2xl font-bold text-gray-800">Bridge para Substack</h2>
                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">v1.4 Fix</span>
                </div>
                <p className="text-gray-600 mb-6 text-sm">Esta versión usa la API central de Substack para evitar errores 404 en subdominios.</p>
                <SubstackForm onSubmit={handleNewSubscription} />
              </section>
              
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Referencia del API</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto border-l-4 border-green-500 shadow-inner">
                  <code className="text-gray-300 text-xs mono block leading-relaxed">
                    <span className="text-pink-400">POST</span> /api/subscribe<br/>
                    <span className="text-gray-500">{"{"}</span><br/>
                    &nbsp;&nbsp;"email": <span className="text-yellow-400">"..."</span>,<br/>
                    &nbsp;&nbsp;"url": <span className="text-yellow-400">"https://itnig.substack.com"</span><br/>
                    <span className="text-gray-500">{"}"}</span>
                  </code>
                </div>
              </section>
            </div>
            
            <div className="space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Monitor de Logs</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
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
        <div className="container mx-auto px-4 text-center text-gray-400 text-[10px] uppercase">
          Substack API Bridge &bull; Optimizado para el nuevo API central
        </div>
      </footer>
    </div>
  );
};

export default App;
