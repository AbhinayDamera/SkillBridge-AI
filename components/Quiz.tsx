import React, { useState, useMemo } from 'react';
import { QuizQuestion } from '../types';
import { HelpCircle, Check, X, ArrowRight, RefreshCw, BrainCircuit, Code2, Cpu, Briefcase, ChevronLeft } from 'lucide-react';

interface QuizProps {
  questions: QuizQuestion[];
  onRefresh: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onRefresh }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Group questions by category
  const categories = useMemo(() => {
    return ['Aptitude', 'Technical', 'Core CS', 'Domain'];
  }, []);

  // Filter questions for the active category
  const activeQuestions = useMemo(() => {
    if (!activeCategory) return [];
    return questions.filter(q => q.category === activeCategory);
  }, [questions, activeCategory]);

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
  };

  const handleBackToTopics = () => {
    setActiveCategory(null);
  };

  const currentQ = activeQuestions[currentIdx];

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
    setShowResult(true);
    if (idx === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx(p => p + 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const isLastQuestion = currentIdx === activeQuestions.length - 1;

  if (questions.length === 0) return (
    <div className="p-8 text-center bg-white rounded-xl shadow-sm">
        <p className="text-slate-500">Loading assessment...</p>
    </div>
  );

  // --- Category Selection View ---
  if (!activeCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Skill Assessment</h2>
          <button 
             onClick={onRefresh}
             className="text-indigo-600 text-sm font-medium hover:underline flex items-center"
          >
             <RefreshCw className="w-4 h-4 mr-1.5" /> Regenerate
          </button>
        </div>
        <p className="text-slate-500 -mt-4">Select a topic to start practicing.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
             const count = questions.filter(q => q.category === cat).length;
             let Icon = BrainCircuit;
             let color = "bg-blue-100 text-blue-600";
             
             if (cat === 'Technical') { Icon = Code2; color = "bg-purple-100 text-purple-600"; }
             if (cat === 'Core CS') { Icon = Cpu; color = "bg-orange-100 text-orange-600"; }
             if (cat === 'Domain') { Icon = Briefcase; color = "bg-green-100 text-green-600"; }

             return (
               <button
                 key={cat}
                 onClick={() => handleCategorySelect(cat)}
                 className="bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-left flex items-center space-x-4 group"
               >
                 <div className={`p-4 rounded-full ${color} group-hover:scale-110 transition-transform`}>
                   <Icon className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-slate-800">{cat}</h3>
                   <p className="text-slate-500 text-sm">{count} Questions Available</p>
                 </div>
                 <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                 </div>
               </button>
             );
          })}
        </div>
      </div>
    );
  }

  // --- Quiz View ---
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="p-6 bg-slate-800 text-white flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button onClick={handleBackToTopics} className="hover:bg-white/10 p-1 rounded-md transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <h2 className="font-bold text-lg">{activeCategory} Quiz</h2>
            <div className="text-xs text-slate-400">Skill Assessment</div>
          </div>
        </div>
        <div className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
          Question {currentIdx + 1}/{activeQuestions.length}
        </div>
      </div>

      {/* Question Body */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 leading-relaxed">
          {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let btnClass = "w-full p-4 text-left rounded-xl border-2 transition-all flex justify-between items-center ";
            
            if (showResult) {
              if (idx === currentQ.correctAnswer) {
                btnClass += "border-green-500 bg-green-50 text-green-800";
              } else if (idx === selectedOption) {
                btnClass += "border-red-500 bg-red-50 text-red-800";
              } else {
                btnClass += "border-slate-100 text-slate-400 opacity-60";
              }
            } else {
              btnClass += "border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-700";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={btnClass}
                disabled={showResult}
              >
                <span>{opt}</span>
                {showResult && idx === currentQ.correctAnswer && <Check className="w-5 h-5 text-green-600" />}
                {showResult && idx === selectedOption && idx !== currentQ.correctAnswer && <X className="w-5 h-5 text-red-600" />}
              </button>
            );
          })}
        </div>

        {/* Feedback / Explanation */}
        {showResult && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-900 text-sm animate-in fade-in duration-300">
            <span className="font-bold block mb-1">Explanation:</span>
            {currentQ.explanation}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
        <div className="text-sm text-slate-500 font-medium">
          Score: <span className="text-indigo-600 font-bold">{score}</span>/{activeQuestions.length}
        </div>
        
        {showResult ? (
          <button
            onClick={isLastQuestion ? handleBackToTopics : handleNext}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-500/30"
          >
            {isLastQuestion ? (
              <>
                Finish Topic <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next Question <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        ) : (
          <button disabled className="px-6 py-2 bg-slate-200 text-slate-400 rounded-lg font-medium cursor-not-allowed">
            Select an Option
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
