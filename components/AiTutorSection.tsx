
import React, { useState, useRef, useEffect } from 'react';
import { getAiChatResponse, generateSpeech, connectLiveAssistant, encodeAudio, decodeAudio, decodeAudioData } from '../services/gemini';
import { ChatMessage, AIConfig, UserProfile } from '../types';
import { Modality } from '@google/genai';

import ReadAloudButton from './ReadAloudButton';

const AiTutorSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Namaste! I am VidyaGuru AI, your advanced educational assistant. I am here to help you excel in your studies and competitive exams. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // New States for User Preferences
  const [config, setConfig] = useState<AIConfig>({ preferredLanguage: 'Bhojpuri + Hinglish' });
  
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const TEACHER_IMAGE = "https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&q=80&w=1000"; 

  useEffect(() => {
    // Attempt to get location automatically
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setConfig(prev => ({ 
          ...prev, 
          location: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } 
        }));
      }, (err) => console.warn("Location access denied"));
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, liveTranscription]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const textToSend = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setLoading(true);
    
    const response = await getAiChatResponse(textToSend, config);
    
    setMessages(prev => [...prev, { role: 'ai', text: response.text }]);
    setLoading(false);
    if (isVoiceEnabled) speakResponse(response.text);
  };

  const speakResponse = async (text: string) => {
    const audioData = await generateSpeech(text);
    if (audioData) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = await decodeAudioData(decodeAudio(audioData), audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsSpeaking(false);
      setIsSpeaking(true);
      source.start();
    }
  };

  const cleanupLive = () => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (inputAudioContextRef.current) { inputAudioContextRef.current.close(); inputAudioContextRef.current = null; }
    if (outputAudioContextRef.current) { outputAudioContextRef.current.close(); outputAudioContextRef.current = null; }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsLiveMode(false);
    setIsSpeaking(false);
  };

  const startLiveMode = async () => {
    try {
      if (isLiveMode) {
        cleanupLive();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = connectLiveAssistant(
        {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{ googleSearch: {} }]
        },
        {
          onopen: () => {
            setIsLiveMode(true);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBase64 = encodeAudio(new Uint8Array(int16.buffer));
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: any) => {
            if (message.serverContent?.outputTranscription) {
              setLiveTranscription(message.serverContent.outputTranscription.text);
            }
            const audioBase64 = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioBase64 && outputAudioContextRef.current) {
              setIsSpeaking(true);
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeAudio(audioBase64), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onclose: () => cleanupLive(),
          onerror: () => cleanupLive(),
        },
        false,
        config
      );
      sessionRef.current = await sessionPromise;
    } catch (err) { alert("Mic required for speech-to-speech conversation."); }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Settings Toggle Button */}
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-6 right-24 z-50 bg-white/5 hover:bg-white/10 p-3 rounded-2xl text-white backdrop-blur-xl border border-white/10 transition-all active:scale-90"
      >
        {showSettings ? '💬' : '⚙️'}
      </button>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-[60] bg-slate-900/98 backdrop-blur-2xl p-10 animate-in fade-in zoom-in duration-300 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-white tracking-tighter">AI Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>
            
            <div className="space-y-4">
               <p className="text-xs font-black text-blue-400 uppercase tracking-[0.3em]">Response Language</p>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Hindi', 'English', 'Bhojpuri', 'Hinglish'].map(lang => (
                    <button 
                      key={lang}
                      onClick={() => setConfig({ ...config, preferredLanguage: lang })}
                      className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${config.preferredLanguage === lang ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
                    >
                      {lang}
                    </button>
                  ))}
               </div>
            </div>

            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-4">
               <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">Location Context</p>
               <div className="flex items-center gap-4">
                 <div className={`w-3 h-3 rounded-full ${config.location ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                 <p className="text-sm text-white font-medium">
                   {config.location 
                      ? `Active: ${config.location.latitude.toFixed(4)}, ${config.location.longitude.toFixed(4)}` 
                      : 'Location access disabled'}
                 </p>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed italic">"Hum location se jaan jaib ki tohke kaisa comedy pasand ba aur wahi hisab se samjhaib!"</p>
            </div>

            <button onClick={() => setShowSettings(false)} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 transition-all active:scale-95">Save Changes</button>
          </div>
        </div>
      )}

      {/* Immersive Visualizer Area */}
      <div className="relative h-80 md:h-[400px] w-full overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f172a] z-10"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <div className={`relative transition-all duration-1000 ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
              <div className="w-64 h-80 md:w-80 md:h-[400px] relative flex items-center justify-center">
                 <img 
                   src={TEACHER_IMAGE} 
                   alt="VidyaGuru AI" 
                   className={`w-full h-full object-contain transition-all duration-500 ${isSpeaking ? 'brightness-125 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'brightness-75 opacity-80'}`}
                   onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=1000"; }}
                 />
                 {isSpeaking && (
                   <div className="absolute top-[34%] left-1/2 -translate-x-1/2 w-16 flex items-end justify-center gap-1 z-20">
                     {[1,2,3,4,5,6,7,8].map(n => (
                       <div key={n} className="w-1.5 bg-blue-400 rounded-full animate-lips" style={{ height: `${Math.random() * 20 + 5}px`, animationDelay: `${n * 0.05}s` }}></div>
                     ))}
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="absolute top-8 left-10 z-20">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-blue-600/20">🤖</div>
             <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">VidyaGuru AI</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Smart Assistant Active</span>
                </div>
             </div>
          </div>
        </div>

        <button 
          onClick={startLiveMode}
          className={`absolute top-8 right-10 z-20 w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl border-2 ${isLiveMode ? 'bg-rose-500 border-white animate-pulse shadow-rose-500/40' : 'bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-xl'}`}
        >
          <span className="text-3xl">{isLiveMode ? '⏹️' : '🎙️'}</span>
        </button>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0f172a] relative z-20">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-8 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-5 duration-300`}>
              <div className={`max-w-[85%] md:max-w-[70%] p-6 md:p-8 rounded-[3rem] text-lg leading-relaxed shadow-2xl ${
                m.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none' 
                  : 'bg-white/5 text-white rounded-tl-none border border-white/10 backdrop-blur-xl'
              }`}>
                <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                  {m.text}
                </div>
                {m.role === 'ai' && m.text && (
                  <div className="mt-6 flex justify-start">
                    <ReadAloudButton text={m.text} className="bg-white/10 text-white hover:bg-white/20 border border-white/10 rounded-2xl px-6 py-3" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start px-8 gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
            </div>
          )}
          {isLiveMode && liveTranscription && (
            <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-50">
               <div className="bg-black/60 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 text-white text-center shadow-2xl animate-in fade-in slide-in-from-bottom-10">
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Live Transcription</p>
                  <p className="text-lg font-medium italic">"{liveTranscription}"</p>
               </div>
            </div>
          )}
        </div>

        <div className="px-6 md:px-12 py-8 border-t border-white/5 bg-slate-900/50 backdrop-blur-3xl">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask VidyaGuru AI anything..."
              className="flex-1 bg-white/5 border-2 border-white/5 rounded-[2.5rem] px-10 py-6 text-lg text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-500 font-medium"
            />
            <button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white w-20 h-20 rounded-[2.2rem] flex items-center justify-center hover:bg-blue-500 transition-all disabled:opacity-50 shadow-2xl shadow-blue-600/40 active:scale-90 shrink-0"
            >
              <span className="text-3xl">➔</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes lips-modern {
          0%, 100% { transform: scaleY(1); opacity: 0.8; }
          50% { transform: scaleY(3); opacity: 1; }
        }
        .animate-lips {
          animation: lips-modern 0.15s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>
    </div>
  );
};

export default AiTutorSection;
