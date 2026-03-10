
import React, { useState, useRef } from 'react';
import { solveMathEquationFromImage } from '../services/gemini';
import ReadAloudButton from './ReadAloudButton';

const MathSolver: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setSolution('');
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const solveEquation = async () => {
    if (!image) return;
    
    setIsSolving(true);
    setError(null);
    setSolution('');

    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];

    try {
      const result = await solveMathEquationFromImage(base64Data, mimeType);
      
      // Dynamic typing effect for a "Blackboard" feel
      let i = 0;
      const speed = 8;
      const timer = setInterval(() => {
        setSolution(result.text.substring(0, i));
        i += 18;
        if (i >= result.text.length + 18) {
          clearInterval(timer);
          setSolution(result.text);
          setIsSolving(false);
        }
      }, speed);
    } catch (err) {
      setError("Solution generate karne mein error aaya. Kripya phir se koshish karein.");
      setIsSolving(false);
    }
  };

  const clear = () => {
    setImage(null);
    setSolution('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="w-full bg-slate-50 rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col min-h-[600px] animate-in fade-in duration-500">
      {/* Premium Lab Header */}
      <div className="bg-[#0f172a] px-8 py-6 flex items-center justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/10 opacity-30 pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-emerald-500/20">
            ♾️
          </div>
          <div>
            <h3 className="font-black text-lg uppercase tracking-tight leading-tight">Super-Professor Math AI</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.3em]">IIT-JEE / BOARD EXPERT</p>
          </div>
        </div>
        {image && !isSolving && (
          <button 
            onClick={clear} 
            className="relative z-10 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            ✕ Reset
          </button>
        )}
      </div>

      <div className="p-8 space-y-8 flex-1 flex flex-col">
        {!image ? (
          <div className="flex-1 flex flex-col gap-6 justify-center">
            <div className="text-center space-y-2 mb-4">
               <h4 className="text-2xl font-black text-slate-800">Solve with one photo!</h4>
               <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Supports 10th, 12th, and IIT-JEE Entrance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Direct Camera Button */}
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="group relative bg-white border-4 border-slate-100 p-10 rounded-[3rem] shadow-xl hover:border-emerald-500 hover:shadow-emerald-500/10 transition-all flex flex-col items-center gap-4 active:scale-95"
              >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">📸</div>
                <div className="text-center">
                  <span className="block font-black text-slate-800 text-sm uppercase">Open Camera</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Click photo now</span>
                </div>
                <input 
                  type="file" 
                  ref={cameraInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                />
              </button>

              {/* Gallery Button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="group relative bg-white border-4 border-slate-100 p-10 rounded-[3rem] shadow-xl hover:border-blue-500 hover:shadow-blue-500/10 transition-all flex flex-col items-center gap-4 active:scale-95"
              >
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">📁</div>
                <div className="text-center">
                  <span className="block font-black text-slate-800 text-sm uppercase">Select Gallery</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Choose clear screenshot</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </button>
            </div>

            <div className="bg-white/50 border border-slate-200 p-6 rounded-[2rem] text-center">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
                 Expert solutions for: Calculus, Algebra, Trigonometry, Chemistry Bonding, Physics Mechanics, and more.
               </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-5">
            <div className="relative group max-w-md mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white p-3 rounded-[2.5rem] border border-slate-200 overflow-hidden">
                <img src={image} alt="Equation" className="w-full h-56 object-contain rounded-3xl" />
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                   Input Scan
                </div>
              </div>
            </div>

            {!solution && !isSolving && (
              <button 
                onClick={solveEquation}
                className="w-full bg-slate-900 text-white py-6 rounded-full font-black text-xl shadow-2xl shadow-slate-900/20 hover:bg-black active:scale-95 transition-all border-4 border-white flex items-center justify-center gap-3"
              >
                <span>समाधान निकालें ✨</span>
              </button>
            )}

            {isSolving && !solution && (
              <div className="flex flex-col items-center justify-center py-20 gap-8">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center text-emerald-600 font-black text-xs">AI</div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Deep Analyzing Steps...</p>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Precision Calibration Active</p>
                </div>
              </div>
            )}

            {solution && (
              <div className="bg-white rounded-[2.5rem] p-1 shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in duration-500">
                <div className="bg-emerald-600 px-8 py-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <span className="text-white font-black text-xs uppercase tracking-[0.2em]">Verified Professional Solution</span>
                     <ReadAloudButton text={solution} className="bg-white/20 text-white hover:bg-white/30 border-white/10" />
                   </div>
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                   </div>
                </div>
                <div className="p-8 md:p-12 bg-white relative">
                  <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
                     <div className="text-8xl font-black italic">SOLVED</div>
                  </div>
                  <div className="prose prose-slate max-w-none text-slate-800 text-lg leading-relaxed whitespace-pre-wrap font-sans selection:bg-emerald-100">
                     {solution.split('\n').map((line, idx) => {
                       const trimmed = line.trim();
                       if (trimmed.startsWith('Step') || trimmed.startsWith('चरण')) {
                         return <div key={idx} className="text-emerald-600 font-black text-xl mt-6 mb-2 uppercase tracking-tight">{line}</div>;
                       }
                       if (trimmed.includes('=') || trimmed.match(/^[0-9]/)) {
                         return <div key={idx} className="bg-slate-50 p-4 rounded-xl border-l-4 border-emerald-500 my-2 font-mono text-xl">{line}</div>;
                       }
                       return <div key={idx} className="mb-2">{line}</div>;
                     })}
                  </div>
                  {!isSolving && (
                     <div className="pt-10 flex justify-center gap-4">
                        <button 
                          onClick={clear} 
                          className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
                        >
                          New Solve
                        </button>
                        <button 
                          onClick={() => window.print()}
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-emerald-200"
                        >
                          Print PDF
                        </button>
                     </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-3xl text-xs font-black text-center border-2 border-red-100 animate-bounce">
                ⚠️ {error}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Level Indicators Footer */}
      <div className="bg-slate-100 px-10 py-6 border-t border-slate-200 flex flex-wrap justify-center gap-8">
        {[
          { l: "10th BOARD", c: "text-blue-500" },
          { l: "12th BOARD", c: "text-indigo-500" },
          { l: "IIT-JEE", c: "text-rose-500" },
          { l: "NEET", c: "text-emerald-500" },
          { l: "ADVANCED MATH", c: "text-slate-600" }
        ].map((tag, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full bg-current ${tag.c}`}></div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${tag.c} opacity-70`}>{tag.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MathSolver;
