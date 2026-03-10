
import React, { useState, useRef, useEffect } from 'react';
import { generateQuizFromContent, generateSpeech } from '../services/gemini';
import { GeneratedQuizQuestion, Language } from '../types';

interface FilePreview {
  name: string;
  type: string;
  data: string; // base64
}

// Helper to decode and play audio
const playAudio = async (base64Data: string) => {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const dataInt16 = new Int16Array(bytes.buffer);
  const numChannels = 1;
  const frameCount = dataInt16.length / numChannels;
  const buffer = audioContext.createBuffer(numChannels, frameCount, 24000);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
};

const QuizGenerator: React.FC = () => {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState<Language>('hindi');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<GeneratedQuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: number}>({});
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [speakingIdx, setSpeakingIdx] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "Analyzing your content...",
    "Extracting key concepts...",
    "Generating professional questions...",
    "Drafting accurate explanations...",
    "Finalizing your personalized quiz..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = (event.target.result as string).split(',')[1];
          setFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            data: base64
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!content.trim() && files.length === 0) {
      alert("Kripya kuch text likhein ya photo upload karein.");
      return;
    }
    
    setIsGenerating(true);
    setQuiz([]);
    setSubmitted(false);
    setUserAnswers({});
    
    const filePayload = files.map(f => ({ data: f.data, mimeType: f.type }));
    const result = await generateQuizFromContent(content, language, filePayload);
    
    if (result) {
      setQuiz(result);
      // Smooth scroll to the quiz start
      setTimeout(() => {
        const quizElement = document.getElementById('quiz-results');
        quizElement?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      alert("Quiz banane mein error aaya. Kripya phir se koshish karein.");
    }
    
    setIsGenerating(false);
  };

  const handleSelect = (qIdx: number, oIdx: number) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSpeak = async (text: string, id: string) => {
    if (speakingIdx) return;
    setSpeakingIdx(id);
    const audioData = await generateSpeech(text);
    if (audioData) {
      await playAudio(audioData);
    }
    setSpeakingIdx(null);
  };

  return (
    <div className="w-full">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8 relative overflow-hidden">
        {/* Visual Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
            <div className="w-full max-w-xs space-y-8 flex flex-col items-center">
               <div className="relative">
                  <div className="w-24 h-24 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl animate-pulse">🧠</span>
                  </div>
               </div>
               
               <div className="text-center space-y-4 w-full">
                  <div className="space-y-1">
                    <h4 className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Vidya Guru AI Thinking</h4>
                    <p className="text-slate-800 font-bold text-lg min-h-[1.5em] transition-all duration-500">
                      {loadingMessages[loadingStep]}
                    </p>
                  </div>
                  
                  {/* Progress segments */}
                  <div className="flex justify-center gap-1.5 h-1.5 w-full max-w-[200px] mx-auto">
                    {loadingMessages.map((_, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-full transition-all duration-1000 ${i <= loadingStep ? 'bg-blue-600' : 'bg-slate-200'}`}
                      ></div>
                    ))}
                  </div>
               </div>

               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center mt-4">
                 Generating high-quality exam patterns...
               </p>
            </div>
          </div>
        )}

        {/* Language Selector */}
        <div className="space-y-3">
          <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Language / भाषा चुनें</label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
            {(['hindi', 'english', 'both'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
                  language === l 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                {l === 'both' ? 'Hindi + Eng' : l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-3">
            <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Topic ya Notes likhein</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Topic ka naam ya notes yahan likhein..."
              className="w-full h-40 p-5 border-2 border-slate-100 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none text-base bg-slate-50/50"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Photo Upload (Option)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-4 border-dashed border-blue-50 rounded-3xl flex flex-col items-center justify-center gap-2 bg-blue-50/20 hover:bg-blue-50/40 transition-all cursor-pointer group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">📸</span>
              <span className="text-xs font-bold text-blue-600">Click to upload photo</span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
            </div>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {files.map((file, idx) => (
                  <div key={idx} className="bg-white border border-blue-100 pl-3 pr-2 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-500 truncate max-w-[60px]">{file.name}</span>
                    <button onClick={() => removeFile(idx)} className="text-red-500 font-bold">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
        >
          Banao Quiz ✨
        </button>
      </div>

      {quiz.length > 0 && (
        <div id="quiz-results" className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
             <span className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Quiz Active</span>
             <span className="font-black text-blue-600">{quiz.length} Questions</span>
          </div>

          {quiz.map((q, qIdx) => (
            <div key={qIdx} className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-50 transition-all">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-sm shrink-0">{qIdx + 1}</span>
                  <h4 className="font-extrabold text-xl text-slate-800 leading-tight">{q.question}</h4>
                </div>
                <button 
                  onClick={() => handleSpeak(q.question, `q-${qIdx}`)}
                  className={`p-2 rounded-full bg-slate-100 hover:bg-blue-100 transition-colors ${speakingIdx === `q-${qIdx}` ? 'animate-pulse text-blue-600' : 'text-slate-500'}`}
                >
                  🔊
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[qIdx] === oIdx;
                  const isCorrect = q.correctAnswerIndex === oIdx;
                  
                  let colorClass = "bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30";
                  if (submitted) {
                    if (isCorrect) colorClass = "bg-green-100 border-green-500 text-green-800 font-bold ring-2 ring-green-100";
                    else if (isSelected) colorClass = "bg-red-100 border-red-500 text-red-800";
                    else colorClass = "opacity-40";
                  } else if (isSelected) {
                    colorClass = "border-blue-500 bg-blue-50 text-blue-800 font-bold ring-2 ring-blue-50";
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all text-sm flex items-center gap-3 ${colorClass}`}
                    >
                      <span className="w-6 h-6 rounded-md bg-white/50 border border-black/5 flex items-center justify-center text-[10px] font-black shrink-0">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-6 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 animate-in slide-in-from-top-2 duration-300 relative">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">Samajhte hain:</span>
                    <button 
                      onClick={() => handleSpeak(q.explanation, `e-${qIdx}`)}
                      className={`p-2 rounded-full bg-indigo-100/50 hover:bg-indigo-200 transition-colors ${speakingIdx === `e-${qIdx}` ? 'animate-pulse text-indigo-700' : 'text-indigo-500'}`}
                    >
                      🔊
                    </button>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}

          {!submitted && (
            <div className="fixed bottom-24 left-4 right-4 z-[90] flex justify-center">
               <button 
                onClick={() => { setSubmitted(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full max-w-md bg-slate-900 text-white py-5 rounded-full font-black text-lg shadow-2xl hover:bg-black transition-all active:scale-95 border-4 border-white"
              >
                CHECK RESULTS ✅
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
