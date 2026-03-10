
import React, { useState, useEffect } from 'react';
import { getCurrentAffairsWithSearch } from '../services/gemini';
import ReadAloudButton from './ReadAloudButton';

const NewsSection: React.FC = () => {
  const categories = ['Bharat', 'Vishva', 'Khel'];
  const [selectedCategory, setSelectedCategory] = useState<string>('Bharat');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [newsData, setNewsData] = useState<{ text: string; sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  useEffect(() => {
    if (!selectedMonth) setSelectedMonth(last6Months[0]);
  }, []);

  const fetchNews = async (cat: string, month: string) => {
    setLoading(true);
    setNewsData(null);
    const data = await getCurrentAffairsWithSearch(cat, month);
    setNewsData(data);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedMonth) fetchNews(selectedCategory, selectedMonth);
  }, [selectedCategory, selectedMonth]);

  const renderNewsList = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    return lines.map((line, idx) => {
      const isHeader = line.startsWith('#') || line.match(/^[0-9]+\./);
      if (isHeader) {
        return (
          <div key={idx} className="bg-white border-l-4 border-blue-600 p-5 rounded-r-2xl shadow-sm mb-4 hover:shadow-md transition-shadow">
            <h4 className="font-black text-slate-900 text-lg leading-tight">{line.replace(/^#+\s*/, '')}</h4>
          </div>
        );
      }
      return <p key={idx} className="text-slate-600 text-sm font-medium pl-6 mb-4 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-32">
      <div className="bg-[#1a3a8a] text-white py-12 px-6 text-center shadow-lg rounded-b-[3rem]">
        <h2 className="text-3xl font-black tracking-tight">प्रमुख समाचार (Main List)</h2>
        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-2">Verified by Google Search</p>
      </div>

      <div className="p-5 max-w-2xl mx-auto w-full space-y-8">
        <div className="flex gap-2 p-1 bg-white rounded-3xl shadow-sm border border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'
              }`}
            >
              {cat === 'Bharat' ? '🇮🇳 Bharat' : cat === 'Vishva' ? '🌍 World' : '🏆 Sports'}
            </button>
          ))}
        </div>

        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
          {last6Months.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                selectedMonth === month ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              {month}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Main news list loading...</p>
            </div>
          ) : newsData ? (
            <div>
              <div className="mb-6 flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Headlines</span>
                  <ReadAloudButton text={newsData.text} />
                </div>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[8px] font-black">LIVE NEWS</span>
              </div>
              {renderNewsList(newsData.text)}
              
              {newsData.sources.length > 0 && (
                <div className="mt-10">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Verified Sources</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {newsData.sources.slice(0, 5).map((src, i) => src.web && (
                      <a key={i} href={src.web.uri} target="_blank" className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:bg-blue-50 transition-colors">
                        <span className="text-xs font-bold text-slate-700 truncate">{src.web.title}</span>
                        <span className="text-blue-500">➔</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NewsSection;
