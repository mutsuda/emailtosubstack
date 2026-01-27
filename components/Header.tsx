
import React from 'react';

interface HeaderProps {
  setView: (view: 'service' | 'deploy') => void;
  currentView: 'service' | 'deploy';
}

export const Header: React.FC<HeaderProps> = ({ setView, currentView }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('service')}>
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
            SubstackAPI
          </span>
        </div>
        
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('service')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentView === 'service' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Servicio
          </button>
          <button 
            onClick={() => setView('deploy')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentView === 'deploy' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ¿Cómo Desplegar?
          </button>
        </nav>

        <div className="hidden sm:block">
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Consola API
          </button>
        </div>
      </div>
    </header>
  );
};
