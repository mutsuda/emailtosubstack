
import React, { useState } from 'react';

interface SubstackFormProps {
  onSubmit: (email: string, url: string) => void;
}

export const SubstackForm: React.FC<SubstackFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('https://itnig.substack.com');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !url) return;

    setIsSubmitting(true);
    onSubmit(email, url);
    
    // Simular feedback de carga
    setTimeout(() => {
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
          Newsletter URL
        </label>
        <div className="relative">
          <input
            type="url"
            required
            placeholder="https://itnig.substack.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
          />
          <div className="absolute left-3 top-3.5 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          </div>
        </div>
      </div>
      
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
          Email del Usuario
        </label>
        <div className="relative">
          <input
            type="email"
            required
            placeholder="cliente@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
          />
          <div className="absolute left-3 top-3.5 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2 ${
          isSubmitting ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black hover:shadow-xl'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Enviando...</span>
          </>
        ) : (
          <span>Suscribir ahora</span>
        )}
      </button>
    </form>
  );
};
