import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    const checkKey = () => {
      const storedKey = localStorage.getItem('naikthreads_google_key');
      const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY;
      const key = (storedKey && storedKey !== 'system_default') ? storedKey : envKey;
      
      if (key && key.length > 10 && key !== 'undefined' && key !== 'null') {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    };

    checkKey();
    window.addEventListener('storage', checkKey);
    return () => window.removeEventListener('storage', checkKey);
  }, []);

  return (
    <header className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 14H8V20H2V14ZM16 2H22V8H16V2ZM8 2C8 8 12 12 18 12V20C10 20 4 14 4 6V2H8Z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Naik<span className="text-blue-600">Photo</span>
                </h1>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  apiStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                  {apiStatus === 'connected' ? 'API Aktif' : 'API Belum Terhubung'}
                </div>
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Creative Studio</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm sm:text-base text-slate-600 font-medium">
                Bikin Konten Video Makanan <span className="text-blue-600">Cepat & Lezat.</span>
              </p>
            </div>
            <button 
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mengatur ulang (reset) API Key?')) {
                  localStorage.removeItem('naikthreads_google_key');
                  window.location.reload();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              RESET API KEY
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;