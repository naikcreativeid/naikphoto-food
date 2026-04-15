import React from 'react';

const Header: React.FC = () => {
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
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Naik<span className="text-blue-600">Photo</span>
              </h1>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Creative Studio</p>
            </div>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Bikin Konten Video Makanan <span className="text-blue-600">Cepat & Lezat.</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;