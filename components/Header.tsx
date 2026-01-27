
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
            SubstackAPI
          </span>
        </div>
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-orange-600 transition-colors">Documentación</a>
          <a href="#" className="hover:text-orange-600 transition-colors">Endpoints</a>
          <a href="#" className="hover:text-orange-600 transition-colors">Pricing</a>
        </nav>
        <div>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Dashboard
          </button>
        </div>
      </div>
    </header>
  );
};
