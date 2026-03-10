
import React, { useState, useEffect } from 'react';
import { getExamQuizWithSearch } from '../services/gemini';
import { GeneratedQuizQuestion } from '../types';
import ReadAloudButton from './ReadAloudButton';

interface ExamQuizViewerProps {
  category: string;
  onClose: () => void;
}

const ExamQuizViewer: React.FC<ExamQuizViewerProps> = ({ category, onClose }) => {
  const [quiz, setQuiz] = useState<GeneratedQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: number}>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      const data = await getExamQuizWithSearch(category);
      if (data) setQuiz(data);
      setLoading(false);
    };
    fetchQuiz();
  }, [category]);

  const handleSelect = (qIdx: number, oIdx: number) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-center">
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Google से महत्वपूर्ण प्रश्न खोज रहे हैं...</h3>
           <p className="text-xs text-slate-400 font-medium mt-1">2026 परीक्षा के ट्रेंड्स जाँचे जा रहे हैं</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in duration-500 pb-40">
      <div className="bg-slate-900 text-white p-6 rounded-t-[2.5rem] flex items-center justify-between">
        <div>
          <h3 className="font-black text-xl">{category} Special Quiz</h3>
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Most Important Equations & Q's 2026</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">✕</button>
      </div>

      <div className="bg-white border-x border-b border-slate-100 rounded-b-[2.5rem] p-6 space-y-8">
        {quiz.map((q, idx) => (
          <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div className="flex justify-between items-start gap-3 mb-5">
              <h4 className="font-black text-slate-800 text-lg leading-tight flex gap-3">
                <span className="text-blue-600">Q{idx+1}.</span>
                {q.question}
              </h4>
              <ReadAloudButton text={q.question} />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt, oIdx) => {
                const isSelected = userAnswers[idx] === oIdx;
                const isCorrect = q.correctAnswerIndex === oIdx;
                let btnStyle = "bg-white border-slate-200 text-slate-700";
                
                if (submitted) {
                  if (isCorrect) btnStyle = "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20";
                  else if (isSelected) btnStyle = "bg-red-500 text-white border-red-500";
                  else btnStyle = "bg-white border-slate-100 opacity-40";
                } else if (isSelected) {
                  btnStyle = "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20";
                }

                return (
                  <button 
                    key={oIdx}
                    onClick={() => handleSelect(idx, oIdx)}
                    disabled={submitted}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all active:scale-95 ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="mt-5 p-5 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">AI Explanation:</span>
                  <ReadAloudButton text={q.explanation} />
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{q.explanation}</p>
              </div>
            )}
          </div>
        ))}

        {!submitted && (
          <button 
            onClick={() => { setSubmitted(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-2xl active:scale-95 transition-all"
          >
            Sahi Jawab Check Karein ✅
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamQuizViewer;
