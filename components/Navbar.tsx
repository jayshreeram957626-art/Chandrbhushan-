
import React from 'react';
import { Tab } from '../types';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'english-coach', label: 'Voice', icon: '🗣️' },
    { id: 'math-solver', label: 'Solve', icon: '➗' },
    { id: 'exams', label: 'Study', icon: '🎓' },
    { id: 'ai-tutor', label: 'Quiz', icon: '🧠' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-4 flex justify-around items-center z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[3rem]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center space-y-1.5 px-3 py-1 transition-all relative ${
            activeTab === tab.id
              ? 'text-blue-700 scale-110'
              : 'text-slate-400 opacity-60'
          }`}
        >
          {activeTab === tab.id && (
            <div className="absolute -top-4 w-1.5 h-1.5 bg-blue-700 rounded-full"></div>
          )}
          <span className="text-2xl">{tab.icon}</span>
          <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
