
import React, { useState } from 'react';

interface SubstackFormProps {
  onSubmit: (email: string, url: string) => void;
}

export const SubstackForm: React.FC<SubstackFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !url) return;

    setIsSubmitting(true);
    onSubmit(email, url);
    
    // Clear form after submission start
    setTimeout(() => {
      setEmail('');
      setUrl('');
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email del Suscriptor
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="usuario@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
            URL de Substack
          </label>
          <input
            id="url"
            type="url"
            required
            placeholder="https://ejemplo.substack.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
          />
          <p className="mt-2 text-xs text-gray-500">
            Asegúrate de que incluya el protocolo (http/https).
          </p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-lg font-bold text-white shadow-md transition-all active:scale-[0.98] ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : 'Ejecutar Suscripción'}
        </button>
      </div>
    </form>
  );
};
