
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AiTutorSection from './components/AiTutorSection';
import ExamSection from './components/ExamSection';
import QuizGenerator from './components/QuizGenerator';
import ExamQuizViewer from './components/ExamQuizViewer';
import NewsSection from './components/NewsSection';
import EnglishCoach from './components/EnglishCoach';
import MathSolver from './components/MathSolver';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedExamCategory, setSelectedExamCategory] = useState<string | null>(null);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const examCategories = [
    { name: "SSC CGL/CHSL", prompt: "SSC CGL CHSL 2026 Exam Questions", icon: "📄", color: "bg-rose-500", description: "Comprehensive preparation for Central Government officer roles." },
    { name: "रेलवे (RRB)", prompt: "Railway RRB NTPC Group D 2026 Questions", icon: "🚆", color: "bg-orange-500", description: "Strategic guidance for Indian Railways career paths." },
    { name: "10वीं बोर्ड", prompt: "Class 10th Board Exam 2026 Questions", icon: "🎓", color: "bg-blue-500", description: "Foundational support for secondary education excellence." },
    { name: "UPSC (IAS)", prompt: "UPSC IAS Prelims 2026 Most Important Questions", icon: "🏛️", color: "bg-amber-600", description: "Advanced preparation for civil services examinations." },
  ];

  const renderHome = () => (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Header */}
      <header className="bg-[#1a3a8a] text-white pt-12 pb-24 px-6 text-center rounded-b-[4rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/50 to-transparent pointer-events-none"></div>
        <div className="flex justify-center mb-4 relative z-10">
           <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
             <span className="text-3xl">🕉️</span>
           </div>
        </div>
        <h1 className="text-5xl font-black tracking-tighter relative z-10">VidyaGuru AI</h1>
        <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.3em] mt-3 opacity-80 relative z-10">Premium Education & AI Guidance</p>
      </header>

      {/* Main Dashboard Grid */}
      <div className="px-6 -mt-12 space-y-8 pb-32 max-w-4xl mx-auto w-full">
        {/* Featured Hero Card */}
        <section 
          onClick={() => setActiveTab('english-coach')}
          className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[3rem] text-white shadow-2xl flex items-center justify-between cursor-pointer active:scale-95 transition-all overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all"></div>
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-black">English Sheekho</h2>
            <p className="text-sm text-blue-100 font-medium">Practice speaking English voice-to-voice</p>
            <div className="pt-2">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Live Voice AI</span>
            </div>
          </div>
          <div className="relative z-10 w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border border-white/20">
            🗣️
          </div>
        </section>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-5">
          {[
            { 
              id: 'math-solver', 
              label: 'Math Solver', 
              desc: 'Photo Solution', 
              icon: '➗', 
              color: 'text-emerald-600', 
              bg: 'bg-emerald-50', 
              action: () => setActiveTab('math-solver') 
            },
            { 
              id: 'voice-ai', 
              label: 'AI Chat', 
              desc: 'Ask Anything', 
              icon: '✨', 
              color: 'text-teal-600', 
              bg: 'bg-teal-50', 
              action: () => setActiveTab('voice-ai') 
            },
            { 
              id: 'exams', 
              label: 'Study Notes', 
              desc: 'Chapters & PDFs', 
              icon: '📚', 
              color: 'text-orange-600', 
              bg: 'bg-orange-50', 
              action: () => setActiveTab('exams') 
            },
            { 
              id: 'ai-tutor', 
              label: 'Quiz Master', 
              desc: 'Test Skills', 
              icon: '🧠', 
              color: 'text-blue-600', 
              bg: 'bg-blue-50', 
              action: () => setActiveTab('ai-tutor') 
            }
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={item.action} 
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-blue-100 transition-all flex flex-col items-center text-center gap-4 group active:scale-95"
            >
              <div className={`w-16 h-16 ${item.bg} rounded-[1.8rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm`}>
                {item.icon}
              </div>
              <div>
                <span className={`block font-black text-slate-800 text-sm ${item.color}`}>{item.label}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.desc}</span>
              </div>
            </button>
          ))}
        </div>

        {/* News Bar */}
        <section 
          onClick={() => setActiveTab('news')}
          className="bg-slate-900 p-6 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📰</div>
             <div>
                <h4 className="font-black text-sm">Exam Current Affairs</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Verified 2026 Updates</p>
             </div>
          </div>
          <span className="text-blue-500 font-black">➔</span>
        </section>

      </div>

      <footer className="mt-auto pb-32 pt-10 text-center border-t border-slate-50">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">VidyaGuru AI © 2026 • Bharat Edition</p>
      </footer>

      {/* Persistent Floating AI Assistant Button */}
      <div className="fixed bottom-28 right-6 z-[999]">
        <button 
          onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 ${isAiAssistantOpen ? 'bg-rose-500 text-white rotate-[135deg]' : 'bg-emerald-500 text-white shadow-emerald-500/40'}`}
        >
          {isAiAssistantOpen ? '✕' : '🤖'}
        </button>
        {!isAiAssistantOpen && (
           <div className="absolute -top-12 right-0 bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 animate-bounce">
              <div className="absolute -bottom-1 right-6 w-2 h-2 bg-white rotate-45 border-b border-r border-slate-100"></div>
           </div>
        )}
      </div>

      {/* Floating Assistant Drawer - Now Full Screen */}
      {isAiAssistantOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div className="w-full h-full bg-white pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-full relative flex flex-col">
              <div className="absolute top-6 right-6 z-50">
                 <button 
                   onClick={() => setIsAiAssistantOpen(false)} 
                   className="w-12 h-12 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-full flex items-center justify-center text-slate-400 transition-all shadow-lg"
                 >
                   <span className="text-2xl">✕</span>
                 </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <AiTutorSection />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'exams': return <ExamSection />;
      case 'news': return <NewsSection />;
      case 'ai-tutor': return renderQuizTab();
      case 'english-coach': return <div className="p-5 pt-10"><EnglishCoach /></div>;
      case 'math-solver': return <div className="p-5 pt-10"><MathSolver /></div>;
      case 'voice-ai': return <div className="p-5 pt-10"><AiTutorSection /></div>;
      case 'equations': return <ExamSection />;
      default: return renderHome();
    }
  };

  const renderQuizTab = () => (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-40">
      <div className="bg-slate-900 text-white pt-20 pb-28 px-6 text-center rounded-b-[4.5rem] shadow-2xl">
        <h2 className="text-4xl font-black tracking-tight">AI Quiz Center</h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Personalized Exam Prep</p>
      </div>
      <div className="px-5 -mt-16 max-w-2xl mx-auto w-full space-y-12">
        {selectedExamCategory ? (
          <ExamQuizViewer category={selectedExamCategory} onClose={() => setSelectedExamCategory(null)} />
        ) : (
          <>
            <QuizGenerator />
            <div className="grid grid-cols-1 gap-5">
              {examCategories.map((exam, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedExamCategory(exam.prompt)}
                  className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-xl active:scale-95 transition-all border border-slate-50"
                >
                  <div className={`w-14 h-14 ${exam.color} text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0`}>
                    {exam.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="font-black text-slate-800">{exam.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{exam.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen selection:bg-blue-100">
      <main className="transition-all duration-300">
        {renderActiveView()}
      </main>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
