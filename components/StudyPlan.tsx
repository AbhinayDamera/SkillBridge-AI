import React from 'react';
import { TrainingPlan } from '../types';
import { ArrowLeft, ExternalLink, BookOpen } from 'lucide-react';

interface StudyPlanPageProps {
  plan: TrainingPlan;
  onBack: () => void;
}

const StudyPlan: React.FC<StudyPlanPageProps> = ({ plan, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors mb-4 md:hidden"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
          <BookOpen size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Weekly Study Plan</h1>
          <p className="text-slate-500">Step-by-step roadmap to master {plan.techStack.slice(0, 3).join(', ')}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {plan.studyPlan.map((module, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="md:w-32 flex-shrink-0 flex flex-col items-center justify-center bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">Timeline</span>
              <span className="text-xl font-black text-indigo-900 text-center leading-tight">{module.week}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{module.topic}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{module.description}</p>
              
              {module.resources && module.resources.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 block">
                    Recommended Search Terms
                    </span>
                    <div className="flex flex-wrap gap-2">
                    {module.resources.map((res, rIdx) => (
                        <a 
                        key={rIdx} 
                        href={`https://www.google.com/search?q=${encodeURIComponent(res + ' tutorial')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-full text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 hover:shadow-sm transition-all flex items-center gap-1.5"
                        >
                        <ExternalLink size={12} />
                        {res}
                        </a>
                    ))}
                    </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyPlan;
