
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SubstackForm } from './components/SubstackForm';
import { LogViewer } from './components/LogViewer';
import { Subscription, ApiLog } from './types';

const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [logs, setLogs] = useState<ApiLog[]>([]);

  const handleNewSubscription = useCallback((email: string, url: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newSub: Subscription = {
      id,
      email,
      url,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    setSubscriptions(prev => [newSub, ...prev]);

    // Simulate API logic
    const mockApiCall = async () => {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const isSuccess = url.includes('substack.com');
      const statusCode = isSuccess ? 200 : 400;
      
      const responseData = isSuccess 
        ? { message: `Successfully subscribed ${email} to ${url}`, subscription_id: id }
        : { error: "Invalid Substack URL", code: "INVALID_URL" };

      // Update subscription status
      setSubscriptions(prev => 
        prev.map(s => s.id === id ? { 
          ...s, 
          status: isSuccess ? 'success' : 'failed',
          responseBody: responseData 
        } : s)
      );

      // Add to logs
      const newLog: ApiLog = {
        id: Math.random().toString(36).substr(2, 9),
        method: 'POST',
        endpoint: '/api/v1/subscribe',
        requestBody: { email, url },
        responseBody: responseData,
        statusCode,
        timestamp: new Date().toISOString(),
      };
      setLogs(prev => [newLog, ...prev]);
    };

    mockApiCall();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Form and Instructions */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Nueva Suscripción</h2>
              <p className="text-gray-600 mb-6">
                Ingresa el correo electrónico y la URL de Substack para automatizar el proceso de suscripción. 
                Este servicio actúa como un puente API simplificado.
              </p>
              <SubstackForm onSubmit={handleNewSubscription} />
            </section>

            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Ejemplo de Uso API (cURL)</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-pink-400 text-sm mono">
                  curl -X POST https://api.substackservice.com/v1/subscribe \<br/>
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                  &nbsp;&nbsp;-d '&#123;"email": "user@example.com", "url": "https://nombre.substack.com"&#125;'
                </code>
              </div>
            </section>
          </div>

          {/* Right Column: Logs and Activity */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Logs de Actividad</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wider">Live</span>
              </div>
              <LogViewer logs={logs} subscriptions={subscriptions} />
            </section>
          </div>

        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Substack Automator Service - Una herramienta estilo API para desarrolladores.
        </div>
      </footer>
    </div>
  );
};

export default App;
