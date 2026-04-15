import React, { useState, useEffect } from 'react';

export const ApiKeyModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const STORAGE_KEY = 'naikthreads_google_key';

  useEffect(() => {
    const existingKey = localStorage.getItem(STORAGE_KEY);
    if (!existingKey) {
      setIsOpen(true);
    }
  }, []);

  const handleSave = () => {
    const keyValue = apiKey.trim();
    if (keyValue === '') {
      alert('Mohon masukkan kunci akses terlebih dahulu.');
      return;
    }

    localStorage.setItem(STORAGE_KEY, keyValue);
    setIsOpen(false);
    
    setTimeout(() => {
      alert('Kunci Akses Berhasil Disimpan!');
      // Reload the page to ensure the new API key is picked up by the service if needed
      window.location.reload();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-5 transition-opacity duration-400">
      <div className="bg-white w-full max-w-[480px] rounded-[24px] p-10 px-8 shadow-[0_20px_40px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)] text-center transform transition-transform duration-400">
        <h2 className="text-[#1e3a8a] text-2xl font-extrabold mb-3 leading-tight">
          Selamat Datang di Mesin NaikPhoto Creative Studio! 🚀
        </h2>
        <p className="text-[#475569] text-[15px] mb-8 leading-relaxed">
          Sebelum mulai mencetak thread viral, mari hubungkan mesin ini dengan akun Google AI-mu.
        </p>

        <div className="text-left mb-6">
          <label htmlFor="api-key-input" className="block text-[#1e3a8a] text-sm font-bold mb-2.5">
            Masukkan Kunci Akses Google AI Kamu:
          </label>
          <input
            type="text"
            id="api-key-input"
            className="w-full p-4 border-2 border-[#e2e8f0] rounded-[14px] text-[15px] text-[#0f172a] bg-[#f8fafc] transition-all duration-300 outline-none focus:bg-white focus:border-[#0ea5e9] focus:shadow-[0_0_0_4px_rgba(14,165,233,0.15)] placeholder:text-[#94a3b8]"
            placeholder="Tempel kunci akses (AIzaSy...) di sini..."
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />
          <div className="mt-3 bg-[#f1f5f9] p-3 px-3.5 rounded-[10px] border border-[#e2e8f0]">
            <p className="text-[12px] text-[#64748b] leading-relaxed">
              🔒 Aman & Privat: Kunci akses ini disimpan dengan aman di peramban (browser) kamu sendiri (Local Storage) dan tidak akan pernah kami simpan di server kami.
            </p>
          </div>
        </div>

        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[#0ea5e9] text-sm font-semibold no-underline mb-8 transition-colors duration-200 hover:text-[#1e3a8a] hover:underline"
        >
          Belum punya kunci akses? Klik di sini untuk mengambilnya secara gratis.
        </a>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="w-full bg-[#f97316] text-white border-none p-4 rounded-[14px] text-base font-bold cursor-pointer transition-all duration-300 shadow-[0_4px_14px_rgba(249,115,22,0.25)] hover:bg-[#ea580c] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(249,115,22,0.35)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(249,115,22,0.25)]"
          >
            Simpan & Mulai Bikin Konten
          </button>
          <button
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, 'system_default');
              setIsOpen(false);
              window.location.reload();
            }}
            className="w-full bg-slate-200 text-slate-700 border-none p-4 rounded-[14px] text-base font-bold cursor-pointer transition-all duration-300 hover:bg-slate-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            Gunakan Kunci Bawaan Sistem
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
