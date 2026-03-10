
import React, { useState, useEffect } from 'react';
import { generateStudyPdfWithSearch } from '../services/gemini';
import ReadAloudButton from './ReadAloudButton';

const ExamSection: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [notesData, setNotesData] = useState<{ text: string, sources: any[] } | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchNotes = async (subject: string) => {
    setSelectedSubject(subject);
    setIsLoadingNotes(true);
    setErrorMsg("");
    setNotesData(null);
    setDisplayText("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      const data = await generateStudyPdfWithSearch(subject);
      if (data) {
        setNotesData(data);
        if (data.text.includes("Limit Exceeded")) {
           setErrorMsg(data.text);
           setDisplayText(data.text);
           setIsLoadingNotes(false);
           return;
        }
        
        // Rapid Typing effect logic
        let i = 0;
        const speed = 5; // even faster
        const charsPerTick = 20; // chunkier typing for speed
        const timer = setInterval(() => {
          setDisplayText(data.text.substring(0, i));
          i += charsPerTick;
          if (i >= data.text.length + charsPerTick) {
            clearInterval(timer);
            setDisplayText(data.text); // ensure full text is set
          }
        }, speed);
      } else {
        setErrorMsg("Notes generate nahi ho paye. Kripya dobara koshish karein.");
      }
    } catch (e) {
      setErrorMsg("Kshama karein, API limit reach ho gayi hai. 1 minute rukiye.");
    }
    setIsLoadingNotes(false);
  };

  const subjects = [
    { title: "Hindi Grammar Notes", icon: "✍️" },
    { title: "कक्षा 10 हिन्दी (Hindi Class 10)", icon: "📖" },
    { title: "कक्षा 12 हिन्दी (Hindi Class 12)", icon: "📔" },
    { title: "भौतिक विज्ञान (Physics)", icon: "⚛️" },
    { title: "रसायन विज्ञान (Chemistry)", icon: "🧪" },
    { title: "हिन्दी व्याकरण (Grammar)", icon: "🖋️" },
    { title: "गणित (Mathematics)", icon: "📐" },
    { title: "SSC Notes", icon: "📄" },
    { title: "Railway RRB", icon: "🚆" },
  ];

  const renderFormattedContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-4" />;

      // Header detection
      if (trimmed.startsWith('# ') || trimmed.includes('[TITLE]')) {
        return <h2 key={i} className="text-3xl font-black text-red-600 text-center border-b-4 border-red-100 pb-4 mb-8 uppercase">{trimmed.replace('[TITLE]', '').replace('# ', '')}</h2>;
      }

      // Equation detection (Dual language)
      if (trimmed.includes('=') || (trimmed.startsWith('[EQUATION]') || trimmed.match(/^[0-9]+\. [A-Z]/))) {
        return (
          <div key={i} className="my-4 p-5 bg-slate-50 border-l-8 border-indigo-600 rounded-r-3xl shadow-sm">
            <code className="text-xl font-black text-slate-900 block font-sans">{trimmed}</code>
          </div>
        );
      }

      // Link detection logic
      if (trimmed.toLowerCase().includes('http') || trimmed.toLowerCase().includes('notes link')) {
        const linkMatch = trimmed.match(/https?:\/\/[^\s]+/);
        const url = linkMatch ? linkMatch[0] : "#";
        return (
          <a key={i} href={url} target="_blank" className="inline-flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all my-2">
            <span>Download Notes</span> 📥
          </a>
        );
      }

      // Bullet points
      if (trimmed.startsWith('*') || trimmed.startsWith('✦') || trimmed.startsWith('-')) {
        return <div key={i} className="flex gap-4 mb-3 items-start pl-6"><span className="text-red-500 font-black mt-1">✦</span><span className="text-slate-800 font-bold text-lg font-serif">{trimmed.replace(/^[✦|*|-]\s*/, '')}</span></div>;
      }

      return <p key={i} className="text-slate-700 leading-relaxed mb-4 text-lg font-serif">{trimmed}</p>;
    });
  };

  const [customTopic, setCustomTopic] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-[#1a3a8a] via-[#1e40af] to-[#2563eb] text-white py-20 text-center shadow-2xl shrink-0 print:hidden relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">VidyaGuru Smart Study</h2>
          <p className="text-blue-200 text-xs font-black uppercase tracking-[0.5em] max-w-xl mx-auto leading-relaxed">AI Powered Notes Generator • Real-time Google Search Grounding</p>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-12 pb-40 max-w-5xl mx-auto w-full relative z-20 -mt-10">
        {selectedSubject ? (
          <div className="animate-in fade-in zoom-in duration-300 bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden print:shadow-none print:border-none print:m-0">
            <div className="bg-slate-50 border-b-4 border-red-600 p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 print:p-5">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">V</div>
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Official Study Material</p>
                </div>
                <h3 className="font-black text-3xl text-slate-900 tracking-tight">{selectedSubject}</h3>
              </div>
              <div className="flex items-center gap-4 print:hidden">
                <ReadAloudButton text={notesData?.text || ""} className="bg-white border border-slate-200 shadow-sm p-4" />
                <button onClick={() => window.print()} className="bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95">
                   Download PDF 📥
                </button>
                <button onClick={() => setSelectedSubject(null)} className="w-14 h-14 bg-slate-200 hover:bg-red-100 hover:text-red-600 rounded-full flex items-center justify-center transition-all font-black text-2xl shadow-sm">✕</button>
              </div>
            </div>
            
            <div className="p-10 md:p-24 bg-white relative min-h-[800px]">
               {isLoadingNotes && displayText === "" ? (
                <div className="flex flex-col items-center justify-center py-40 gap-8">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-red-600 font-black text-xs">AI</div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Searching Knowledge Base...</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fetching latest info from Google Search...</p>
                  </div>
                </div>
              ) : errorMsg ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
                  <span className="text-6xl">⚠️</span>
                  <h3 className="font-black text-2xl text-red-600 uppercase tracking-tighter">LIMIT EXCEEDED</h3>
                  <p className="text-slate-500 max-w-sm font-medium">{errorMsg}</p>
                  <button onClick={() => fetchNotes(selectedSubject)} className="mt-6 bg-slate-900 text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition-all">Try Again</button>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                   <div className="fixed inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0 print:opacity-[0.05]">
                      <span className="text-[160px] font-black -rotate-45 text-red-900 tracking-tighter">VIDYAGURU AI</span>
                   </div>
                   <article className="relative z-10 prose prose-2xl prose-slate max-w-none">
                      {renderFormattedContent(displayText)}
                   </article>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-20 py-10">
             <div className="text-center space-y-8">
               <div className="inline-block bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">Topic Based Learning</div>
               <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">Smart Study Search</h1>
               <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs max-w-2xl mx-auto leading-relaxed">
                 Type any topic (e.g., "Photosynthesis", "SSC CGL History", "Newton's Laws") and get professional, easy-to-memorize notes instantly.
               </p>
             </div>
             
             <div className="max-w-3xl mx-auto space-y-10">
                <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.08)] border-8 border-slate-50 overflow-hidden group focus-within:border-blue-100 transition-all">
                   <input 
                     type="text" 
                     value={customTopic}
                     onChange={(e) => setCustomTopic(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && customTopic.trim() && fetchNotes(customTopic)}
                     placeholder="Enter any topic name..."
                     className="w-full bg-transparent px-12 py-10 text-3xl font-black outline-none placeholder:text-slate-200 text-slate-800"
                   />
                </div>
                <div className="flex justify-center">
                   <button 
                     onClick={() => customTopic.trim() && fetchNotes(customTopic)}
                     disabled={!customTopic.trim()}
                     className="group relative bg-gradient-to-r from-[#1a3a8a] to-blue-600 text-white px-20 py-8 rounded-[3rem] font-black text-lg uppercase tracking-[0.2em] shadow-[0_30px_60px_rgba(26,58,138,0.4)] hover:shadow-[0_40px_80px_rgba(26,58,138,0.6)] transition-all hover:-translate-y-2 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                   >
                     <span className="relative z-10 flex items-center gap-4">
                        नोट्स तैयार करें
                        <span className="text-2xl group-hover:translate-x-3 transition-transform">➔</span>
                     </span>
                     <div className="absolute inset-0 bg-white/10 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSection;
