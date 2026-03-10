
import React, { useState, useRef, useEffect } from 'react';
import { connectLiveAssistant, encodeAudio, decodeAudio, decodeAudioData } from '../services/gemini';
import { Modality } from '@google/genai';

const EnglishCoach: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // High-quality white female humanoid robot teacher image
  const TEACHER_IMAGE = "https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&q=80&w=1000"; 

  const cleanup = () => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (inputAudioContextRef.current) { inputAudioContextRef.current.close(); inputAudioContextRef.current = null; }
    if (outputAudioContextRef.current) { outputAudioContextRef.current.close(); outputAudioContextRef.current = null; }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setIsSpeaking(false);
    setTranscription('');
  };

  const startLiveCoach = async () => {
    try {
      cleanup();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = connectLiveAssistant(
        {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        {
          onopen: () => {
            setIsActive(true);
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
              setTranscription(message.serverContent.outputTranscription.text);
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
          onclose: () => cleanup(),
          onerror: () => cleanup()
        },
        true // Enable Vidya Guru AI Persona
      );
      sessionRef.current = await sessionPromise;
    } catch (err) { alert("Mic access required to talk to Vidya Guru AI."); }
  };

  return (
    <div className="w-full flex flex-col bg-black rounded-[3rem] overflow-hidden shadow-2xl relative min-h-[85vh]">
      {/* Immersive Visual Experience */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-[#050a1b]">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#2a3e66 1px, transparent 1px), linear-gradient(90deg, #2a3e66 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
        
        <div className={`relative transition-all duration-1000 z-20 ${isActive ? 'scale-110' : 'scale-105 opacity-80'}`}>
          <div className="relative w-full max-w-lg aspect-[3/4] flex items-center justify-center">
             <img 
               src={TEACHER_IMAGE} 
               alt="Vidya Guru AI" 
               className={`w-full h-full object-contain transition-all duration-700 ${isSpeaking ? 'brightness-110 drop-shadow-[0_0_50px_rgba(0,191,255,0.3)]' : 'brightness-90 grayscale-[10%]'}`}
               onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=1000"; }}
             />
             
             {/* Lips Action Animation */}
             {isActive && (
               <div className="absolute top-[33.5%] left-1/2 -translate-x-1/2 w-16 h-8 flex items-end justify-center gap-1 z-30">
                  {[1,2,3,4,5,6].map(n => (
                    <div 
                     key={n} 
                     className={`w-1 bg-cyan-400 rounded-full transition-all duration-75 ${isSpeaking ? 'animate-lips' : 'h-1 opacity-20'}`} 
                     style={{ 
                       height: isSpeaking ? `${Math.random() * 22 + 4}px` : '2px', 
                       animationDelay: `${n * 0.04}s`,
                     }}
                    ></div>
                  ))}
               </div>
             )}

             <div className={`absolute top-[26.2%] left-[44.2%] w-3 h-3 bg-cyan-400 rounded-full blur-[3px] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
             <div className={`absolute top-[26.2%] left-[55.8%] w-3 h-3 bg-cyan-400 rounded-full blur-[3px] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
             <div className={`absolute top-[44%] left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] transition-opacity duration-1000 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
          </div>
        </div>

        {/* HUD - Transcription Box */}
        {isActive && (
           <div className="absolute bottom-16 left-8 right-8 z-40 flex flex-col items-center animate-in fade-in slide-in-from-bottom-5">
              <div className="bg-black/60 backdrop-blur-2xl border border-white/10 px-10 py-8 rounded-[3rem] shadow-2xl max-w-2xl w-full text-center">
                 <div className="flex items-center justify-center gap-3 mb-4">
                    <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`}></div>
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] opacity-80">Smart Study AI - Live Session</p>
                 </div>
                 <h4 className="text-white text-xl md:text-2xl font-medium leading-relaxed font-serif italic selection:bg-cyan-500/30">
                   {isSpeaking ? (transcription || "Listening...") : "Welcome! I am your AI English Coach. How can I help you improve your language skills today?"}
                 </h4>
              </div>
           </div>
        )}
      </div>

      <div className="p-10 bg-black/40 backdrop-blur-md border-t border-white/5 flex flex-col items-center gap-8 absolute bottom-0 left-0 right-0 z-50">
        {!isActive ? (
          <div className="text-center space-y-6 animate-in fade-in duration-700">
             <button 
                onClick={startLiveCoach}
                className="group bg-blue-600 hover:bg-blue-500 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] active:scale-90 transition-all duration-300 border-4 border-white/10"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform">🎙️</span>
              </button>
              <div className="space-y-1 text-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] animate-pulse">Start English Session</p>
                <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-1">Professional Coaching Mode Active</p>
              </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <button 
              onClick={cleanup}
              className="bg-rose-500 hover:bg-rose-600 text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3 border-2 border-white/5"
            >
              <span>Session Active</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes lips {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(3.5); }
        }
        .animate-lips {
          animation: lips 0.18s ease-in-out infinite;
          transform-origin: bottom;
        }
        .font-serif {
          font-family: 'Lora', serif;
        }
      `}</style>
    </div>
  );
};

export default EnglishCoach;
