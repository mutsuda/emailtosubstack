
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
        throw new Error("Ruta /api/subscribe no disponible. Despliega en Vercel para activar el backend.");
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
        statusCode: result.status || response.status,
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header setView={setView} currentView={view} />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {view === 'service' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Suscribir Usuario</h2>
                <p className="text-gray-500 text-sm mb-6">Envía un email a cualquier newsletter de Substack usando tu propia marca.</p>
                <SubstackForm onSubmit={handleNewSubscription} />
              </div>

              <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="font-bold mb-2 flex items-center">
                  <span className="mr-2">💡</span> ¿Cómo funciona esto?
                </h3>
                <p className="text-blue-100 text-xs leading-relaxed">
                  Este puente (Bridge) actúa como un navegador intermedio. 
                  Envía las peticiones a Substack con las cabeceras necesarias 
                  para evitar bloqueos de seguridad, permitiéndote crear 
                  formularios de registro 100% personalizados.
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Inspección de API en Tiempo Real</h2>
                <div className="flex space-x-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Servidor Activo</span>
                </div>
              </div>
              <LogViewer logs={logs} subscriptions={subscriptions} />
            </div>
          </div>
        ) : (
          <DeploymentGuide />
        )}
      </main>
      <footer className="py-8 text-center text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">
        Substack Stealth Bridge &bull; Professional Edition
      </footer>
    </div>
  );
};

export default App;
