import React, { useState } from 'react';
import Header from './components/Header';
import StyleSelector from './components/StyleSelector';
import InputForm from './components/InputForm';
import RatioModal from './components/RatioModal';
import ResultsDisplay from './components/ResultsDisplay';
import ApiKeyModal from './components/ApiKeyModal';
import { ContentStyle, UploadedFile, AspectRatio, GeneratedContent } from './types';
import { generateCreativePlan, generateImage, generateVideoPrompt } from './services/geminiService';
import { cropImageToRatio } from './utils/fileUtils';

const App: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState<ContentStyle | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const [descriptions, setDescriptions] = useState({ product: '', mood: '' });
  const [isRatioModalOpen, setIsRatioModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.Square);

  const handleStyleSelect = (style: ContentStyle) => {
    if (selectedStyle === style) return; // No op if same
    setSelectedStyle(style);
    // Reset form when style changes
    setUploadedFiles({});
    setDescriptions({ product: '', mood: '' });
    setResult(null);
  };

  const handleGenerateClick = () => {
    if (selectedStyle === ContentStyle.DramaticPoster) {
      setRatio(AspectRatio.Square); // Default poster to square
      startGeneration(AspectRatio.Square);
    } else {
      setIsRatioModalOpen(true);
    }
  };

  const startGeneration = async (selectedRatio: AspectRatio) => {
    setIsRatioModalOpen(false);
    setRatio(selectedRatio);
    setIsLoading(true);
    setLoadingMsg('Merancang konsep kreatif...');

    try {
      if (!selectedStyle) throw new Error("Style not selected");

      // 1. Generate Creative Plan
      const plan = await generateCreativePlan(
        selectedStyle, 
        descriptions.product, 
        descriptions.mood, 
        selectedRatio, 
        uploadedFiles
      );

      // 2. Generate Images
      const images = [];
      const prompts = plan.shotPrompts;
      const total = selectedStyle === ContentStyle.DramaticPoster ? 1 : prompts.length;
      
      for (let i = 0; i < total; i++) {
        setLoadingMsg(`Membuat visual adegan ${i + 1}/${total}...`);
        
        // Retry logic for image gen
        let imageBase64 = null;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const rawBase64Data = await generateImage(prompts[i], uploadedFiles);
                // Crop
                imageBase64 = await cropImageToRatio(rawBase64Data, selectedRatio);
                break;
            } catch (e: any) {
                console.warn(`Attempt ${attempt + 1} failed for image ${i}`, e);
                const errorMessage = e?.message || '';
                
                if (errorMessage.includes('403') || errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('limit')) {
                    throw new Error("KUOTA HABIS/LIMIT 0: Google membatasi pembuatan gambar untuk API Key gratis tanpa Billing. Solusi: 1. Gunakan API Key lain, 2. Hubungkan Billing di Google Cloud (tetap gratis di bawah limit), atau 3. Klik RESET API KEY di atas.");
                }
                
                if (errorMessage.includes('API key not valid')) {
                    throw new Error("API KEY TIDAK VALID: Kunci yang dimasukkan salah. Silakan klik RESET API KEY di bagian atas.");
                }
            }
        }

        if (!imageBase64) {
            throw new Error(`Gagal membuat gambar untuk adegan ${i + 1} setelah 3 percobaan. Silakan coba lagi.`);
        }

        if (imageBase64) {
             let vidPrompt = '';
             if (selectedStyle !== ContentStyle.DramaticPoster) {
                 try {
                     vidPrompt = await generateVideoPrompt(imageBase64);
                 } catch (e) { console.error("Video prompt failed", e); }
             }

             images.push({
                 base64: imageBase64,
                 prompt: prompts[i],
                 label: selectedStyle === ContentStyle.DramaticPoster ? 'Poster Utama' : `Adegan ${i + 1}`,
                 videoPrompt: vidPrompt
             });
        }
      }

      setResult({
        plan,
        images,
        audioBlob: null
      });

    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message || 'Something went wrong'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Controls */}
          <div className="space-y-8">
            <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white text-xs font-bold shadow-sm">1</span>
                <h2 className="text-xl font-semibold text-slate-900">Pilih Gaya Konten</h2>
              </div>
              <p className="text-slate-500 mb-6 text-sm">Pilih template visual untuk menentukan fokus konten Anda.</p>
              
              <StyleSelector selectedStyle={selectedStyle} onSelect={handleStyleSelect} />

              {selectedStyle && (
                <div className="mt-10 pt-10 border-t border-slate-100 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white text-xs font-bold shadow-sm">2</span>
                    <h2 className="text-xl font-semibold text-slate-900">Input Data</h2>
                  </div>
                  <InputForm 
                      selectedStyle={selectedStyle}
                      uploadedFiles={uploadedFiles}
                      setUploadedFiles={setUploadedFiles}
                      descriptions={descriptions}
                      setDescriptions={setDescriptions}
                      onGenerate={handleGenerateClick}
                  />
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-2">
            <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white text-xs font-bold shadow-sm">3</span>
                <h2 className="text-xl font-semibold text-slate-900">Hasil Kreatif</h2>
              </div>
              
              <div className="flex-grow">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center py-20">
                    <div className="loader h-12 w-12 border-4 border-slate-100 rounded-full mb-6"></div>
                    <p className="text-slate-600 font-medium animate-pulse">{loadingMsg}</p>
                  </div>
                ) : result && selectedStyle ? (
                  <ResultsDisplay 
                      content={result} 
                      style={selectedStyle} 
                      aspectRatio={ratio} 
                      onReset={() => setResult(null)} 
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-20 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                      <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="max-w-xs text-sm">Pilih gaya konten dan lengkapi data di sebelah kiri untuk melihat hasil ajaib di sini.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

        </div>
      </main>

      <RatioModal 
        isOpen={isRatioModalOpen} 
        onClose={() => setIsRatioModalOpen(false)} 
        onConfirm={(r) => startGeneration(r)} 
      />
      <ApiKeyModal />
    </div>
  );
};

export default App;