
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
      // Llamada al endpoint real en Vercel
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, url }),
      });

      const responseData = await response.json();
      const isSuccess = response.ok;
      
      setSubscriptions(prev => 
        prev.map(s => s.id === id ? { 
          ...s, 
          status: isSuccess ? 'success' : 'failed', 
          responseBody: responseData 
        } : s)
      );

      const newLog: ApiLog = {
        id: Math.random().toString(36).substr(2, 9),
        method: 'POST',
        endpoint: '/api/subscribe',
        requestBody: { email, url },
        responseBody: responseData,
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      };
      setLogs(prev => [newLog, ...prev]);
    } catch (error: any) {
      setSubscriptions(prev => 
        prev.map(s => s.id === id ? { ...s, status: 'failed' } : s)
      );
      
      const errorLog: ApiLog = {
        id: Math.random().toString(36).substr(2, 9),
        method: 'POST',
        endpoint: '/api/subscribe',
        requestBody: { email, url },
        responseBody: { error: 'Error de conexión', message: error.message },
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };
      setLogs(prev => [errorLog, ...prev]);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header setView={setView} currentView={view} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {view === 'service' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Suscripción Automática</h2>
                <p className="text-gray-600 mb-6">
                  Usa esta interfaz para enviar peticiones al endpoint que procesará tus suscripciones.
                </p>
                <SubstackForm onSubmit={handleNewSubscription} />
              </section>

              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Endpoint API (v1)
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-pink-400 text-sm mono">
                    POST /api/subscribe<br/>
                    Content-Type: application/json<br/><br/>
                    &#123;<br/>
                    &nbsp;&nbsp;"email": "user@email.com",<br/>
                    &nbsp;&nbsp;"url": "https://nombre.substack.com"<br/>
                    &#125;
                  </code>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Monitor de Tráfico</h2>
                  <div className="flex items-center text-xs font-bold text-green-500 uppercase">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    En línea
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

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Substack Automator. Herramienta para desarrolladores.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-orange-600">Privacidad</a>
            <a href="#" className="hover:text-orange-600">GitHub</a>
            <a href="#" className="hover:text-orange-600">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
