
import React, { useState } from 'react';
import { Subscription, ApiLog } from '../types';

interface LogViewerProps {
  logs: ApiLog[];
  subscriptions: Subscription[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs, subscriptions }) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'history'>('activity');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'activity' ? 'bg-gray-50 text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          JSON Logs (API)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'history' ? 'bg-gray-50 text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Historial UI
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto max-h-[600px] bg-slate-50">
        {activeTab === 'activity' ? (
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Esperando llamadas API...
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.5 rounded ${log.statusCode < 300 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {log.statusCode}
                      </span>
                      <span className="text-gray-900">{log.method}</span>
                      <span className="text-gray-500">{log.endpoint}</span>
                    </div>
                    <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="p-3 text-xs mono space-y-3">
                    <div>
                      <span className="text-gray-400">Request:</span>
                      <pre className="mt-1 p-2 bg-gray-900 text-blue-300 rounded overflow-x-auto">
                        {JSON.stringify(log.requestBody, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-gray-400">Response:</span>
                      <pre className={`mt-1 p-2 bg-gray-900 rounded overflow-x-auto ${log.statusCode < 300 ? 'text-green-300' : 'text-red-300'}`}>
                        {JSON.stringify(log.responseBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.length === 0 ? (
              <div className="text-center py-20 text-gray-400 italic">
                No hay suscripciones recientes.
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div key={sub.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      sub.status === 'success' ? 'bg-green-100' : sub.status === 'failed' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {sub.status === 'success' ? (
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : sub.status === 'failed' ? (
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{sub.email}</h4>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{sub.url}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${
                      sub.status === 'success' ? 'text-green-600' : sub.status === 'failed' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {sub.status}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(sub.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
