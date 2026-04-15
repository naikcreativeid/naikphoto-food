import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CreativePlan, ContentStyle, AspectRatio, UploadedFile } from "../types";

const getAIClient = () => {
  const storedKey = localStorage.getItem('naikthreads_google_key');
  const apiKey = (storedKey && storedKey !== 'system_default') ? storedKey : process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key tidak ditemukan. Silakan masukkan API Key Anda.");
  }
  return new GoogleGenAI({ apiKey });
};

// Fungsi untuk memberikan jeda waktu (dalam milidetik)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const STORY_FLOWS: Record<string, { id: string; label: string }[]> = {
  'live-showcase': [
    { id: 'problem', label: 'Antisipasi' },
    { id: 'reveal', label: 'The Food Reveal' },
    { id: 'action', label: 'The Bite' },
    { id: 'result', label: 'Satisfied Look' },
    { id: 'presenter', label: 'Call to Action' }
  ],
  'quick-insight': [
    { id: 'ingredients', label: 'Persiapan Bahan (Fresh & Raw)' },
    { id: 'process_action', label: 'Aksi Masak (Dynamic Motion)' },
    { id: 'transformation', label: 'Transformasi Matang (Texture)' },
    { id: 'plating', label: 'Finishing / Garnish' },
    { id: 'final_result', label: 'Hasil Akhir (Hero Shot)' }
  ],
  'editorial-shots': [
    { id: 'flatlay', label: 'Top-Down Flatlay' },
    { id: 'sideview', label: 'Side View Detail' },
    { id: 'handmodel', label: 'Hand Holding' },
    { id: 'focusblur', label: 'Shallow Depth' },
    { id: 'texture', label: 'Texture Focus' }
  ],
  'focus-produk': [
    { id: 'wide', label: 'Wide Shot' },
    { id: 'closeup', label: 'Extreme Close-Up' },
    { id: 'top-down', label: 'Top-Down / Flatlay' },
    { id: 'dynamic-angle', label: 'Dynamic Angle' },
    { id: 'hero-shot', label: 'Hero Shot' }
  ],
  'dramatic-poster': [
    { id: 'hero-shot-dramatic', label: 'Poster Utama' }
  ]
};

export const generateCreativePlan = async (
  style: ContentStyle,
  description: string,
  mood: string | undefined,
  aspectRatio: AspectRatio,
  files: Record<string, UploadedFile>
): Promise<CreativePlan> => {
  
  const storyFlow = STORY_FLOWS[style] || [];
  const isPoster = style === ContentStyle.DramaticPoster;
  
  let locationInstruction = "Deskripsi satu lokasi/latar yang spesifik dan konsisten (contoh: 'di atas meja kayu dengan pencahayaan alami yang lembut').";
  if (files.backgroundImage) {
      locationInstruction = "Gunakan gambar latar yang diunggah sebagai dasar untuk deskripsi lokasi. Deskripsikan adegan seolah-olah makanan berada di dalam lokasi tersebut (photocompositing).";
  }
  
  let modelInstruction = "Tidak ada model/karakter, fokus hanya pada makanan dan props.";
  if (style === ContentStyle.LiveShowcase) {
      modelInstruction = "Deskripsikan SATU karakter model/tangan (misal: 'seorang wanita muda dengan kemeja denim, hanya fokus pada wajah/ekspresi atau tangan yang rapi') yang akan terlihat di semua adegan.";
  } else if (isPoster) {
       modelInstruction = "Jika model/tangan diunggah, deskripsikan penggunaannya untuk memberikan skala atau interaksi dramatis. Jika tidak, fokus pada food styling dramatis.";
  }

  const outputSchema = {
    type: Type.OBJECT,
    properties: {
      masterScene: {
        type: Type.OBJECT,
        properties: {
          character: { type: Type.STRING },
          props: { type: Type.STRING },
          location: { type: Type.STRING },
          tiktokScript: { type: Type.STRING, description: "Max 100 words" }
        },
        required: ["character", "props", "location", "tiktokScript"]
      },
      shotPrompts: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["masterScene", "shotPrompts"]
  };

  let shotInstruction;
  if (isPoster) {
    const moodDesc = mood || 'pencahayaan dramatis, bayangan tebal, kontras tinggi';
    shotInstruction = `Buat SATU prompt gambar utama yang sangat detail untuk poster. Prompt harus menggabungkan semua detail Master Scene DENGAN mood: '${moodDesc}'. Gunakan teknik visual sinematik tingkat tinggi, pastikan background mendukung mood dengan elemen artistik yang tidak membosankan dan detail yang kaya. Gunakan Bahasa Indonesia yang deskriptif.`;
  } else {
    const storyFlowString = JSON.stringify(storyFlow.map(s => s.label));
    
    let specificStyleInstruction = "";
    if (style === ContentStyle.QuickInsight) {
        specificStyleInstruction = `
        INSTRUKSI KHUSUS "RESEP CEPAT" (Quick Insight):
        Tujuannya adalah video resep singkat (short-form) yang padat.
        1. Shot 1 (Bahan): Tampilkan bahan mentah utama dalam tatanan estetik atau aksi persiapan (misal: chopping).
        2. Shot 2 (Aksi Masak): Close-up dinamis proses memasak (sizzling, boiling, frying). Fokus pada gerakan dan suara visual.
        3. Shot 3 (Transformasi): Makanan hampir matang, perubahan warna dan tekstur yang menggugah selera.
        4. Shot 4 (Plating): Sentuhan akhir (menuang saus, tabur garnish).
        5. Shot 5 (Result): HASIL AKHIR yang sempurna. Wajib terlihat lezat, lighting komersial, dan konsisten dengan produk yang diupload user.
        `;
    }

    // Enhanced instruction for visual variety
    shotInstruction = `Berdasarkan "Master Scene" dan alur cerita: ${storyFlowString}, tulis LIMA prompt gambar yang siap pakai dalam BAHASA INDONESIA.
    ${specificStyleInstruction}
    
    INSTRUKSI KRUSIAL UNTUK VARIASI VISUAL:
    Walaupun lokasi konsisten (Master Scene), pastikan SETIAP prompt memiliki variasi visual yang jelas, terutama pada Background dan Angle:
    1. JANGAN gunakan deskripsi background yang persis sama berulang-ulang (repetitif).
    2. Variasikan Depth of Field: Gunakan bokeh creamy untuk close-up, dan background yang lebih terlihat konteksnya untuk wide shot.
    3. Variasikan Elemen Latar: 
       - Shot 1 mungkin fokus pada tekstur permukaan (meja/kain).
       - Shot 2 menampilkan ambience ruangan yang buram di kejauhan.
       - Shot 3 menampilkan props pendukung di background yang berbeda dari shot sebelumnya.
    4. Pastikan setiap shot terasa 'fresh' namun tetap dalam satu kesatuan tema gaya "${style}".`;
  }

  const basePrompt = `
  Anda adalah seorang sutradara AI kuliner kelas dunia yang fasih berbahasa Indonesia.
  
  INPUT:
  - Gaya Konten: "${style}"
  - Deskripsi Makanan: "${description}"

  TUGAS:
  1. Buat Master Scene (Detail karakter, props, lokasi).
     ${locationInstruction}
     ${modelInstruction}
     TAMBAHAN: Tentukan palet warna dan nuansa pencahayaan yang spesifik untuk gaya ${style} agar background terasa hidup dan berdimensi.
  2. Tulis naskah TikTok (100 kata) yang menarik dalam Bahasa Indonesia.
  3. Rancang Prompt Gambar: ${shotInstruction}
     
  ATURAN BAHASA:
  - Gunakan BAHASA INDONESIA sepenuhnya untuk mendeskripsikan adegan, subjek, dan pencahayaan dalam 'shotPrompts' dan 'masterScene'.
  - Hindari penggunaan kalimat bahasa Inggris di tengah deskripsi (kecuali istilah teknis yang sulit diterjemahkan).
  - Di akhir setiap prompt, WAJIB tambahkan parameter teknis standar ini (biarkan dalam Inggris): ', food photography, cinematic, 4K, ${aspectRatio === AspectRatio.Square ? '1:1' : aspectRatio === AspectRatio.Vertical ? '9:16' : '16:9'}'.
  `;

  const parts: any[] = [{ text: basePrompt }];
  
  if (files.productImage) {
    parts.push({ inlineData: { mimeType: files.productImage.type, data: files.productImage.base64 } });
  }
  if (files.modelImage) {
    parts.push({ inlineData: { mimeType: files.modelImage.type, data: files.modelImage.base64 } });
  }
  if (files.backgroundImage) {
    parts.push({ inlineData: { mimeType: files.backgroundImage.type, data: files.backgroundImage.base64 } });
  }

let retries = 3; // Maksimal akan diulang 3 kali
  
  while (retries > 0) {
    try {
      const response = await getAIClient().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: outputSchema,
          systemInstruction: "You are a creative director for food commercials. You generate creative plans in Indonesian language."
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      return JSON.parse(text) as CreativePlan;

    } catch (error: any) {
      // Cek apakah errornya karena kuota habis (429)
      if (error.message?.includes('quota') || error.message?.includes('429') || error.status === 429) {
        console.warn(`Mohon Menunggu 5 detik sebelum coba lagi. Sisa percobaan: ${retries - 1}`);
        retries--;
        
        // Jika sudah 3x gagal, baru lemparkan error ke tampilan
        if (retries === 0) {
          throw new Error("Server AI sedang sibuk karena limit kuota gratis. Mohon tunggu sekitar 1 menit dan klik Generate lagi.");
        }
        
        await delay(5000); // Istirahat 5 detik sebelum loop mencoba lagi
      } else {
        // Lemparkan error jika errornya bukan karena limit kuota
        throw error;
      }
    }
  }
  
  throw new Error("Gagal memproses setelah beberapa kali percobaan.");
};

export const generateImage = async (
  prompt: string, 
  files: Record<string, UploadedFile>
): Promise<string> => {
  const parts: any[] = [{ text: prompt }];

  // Context injection for image editing/variation
  if (files.productImage) {
    parts.push({ inlineData: { mimeType: files.productImage.type, data: files.productImage.base64 } });
  }
  // We can add model/bg if needed, but usually product is the key for variation
  if (files.modelImage) {
     parts.push({ inlineData: { mimeType: files.modelImage.type, data: files.modelImage.base64 } });
  }

  const response = await getAIClient().models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts }
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!imagePart || !imagePart.inlineData?.data) {
    throw new Error("Failed to generate image");
  }

  return `data:image/png;base64,${imagePart.inlineData.data}`;
};

export const generateVideoPrompt = async (imageBase64: string): Promise<string> => {
  const promptText = `Lihat gambar makanan ini. Buat satu saran prompt video singkat (video motion prompt) untuk tools seperti Kling/Luma/Runway. Gabungkan satu gerakan kamera dan satu gerakan objek. Gunakan Bahasa Indonesia.`;
  
  const response = await getAIClient().models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: promptText },
        { inlineData: { mimeType: 'image/png', data: imageBase64.split(',')[1] } }
      ]
    },
    config: {
       responseMimeType: 'application/json',
       responseSchema: {
         type: Type.OBJECT,
         properties: { videoPrompt: { type: Type.STRING } }
       }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return data.videoPrompt || "Kamera dolly in perlahan.";
};

export const generateTTS = async (text: string, voiceName: string): Promise<{ data: string, sampleRate: number }> => {
  const response = await getAIClient().models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  });

  const audioPart = response.candidates?.[0]?.content?.parts?.[0];
  if (!audioPart || !audioPart.inlineData?.data) {
    throw new Error("No audio generated");
  }

  // Extract sample rate from mimeType "audio/pcm; rate=24000"
  const mimeType = audioPart.inlineData.mimeType || "";
  const match = mimeType.match(/rate=(\d+)/);
  const sampleRate = match ? parseInt(match[1], 10) : 24000;

  return {
    data: audioPart.inlineData.data,
    sampleRate
  };
};