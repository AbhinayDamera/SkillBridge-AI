import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, CheckSquare, Code, Settings, Sparkles, LogOut } from 'lucide-react';
import JobAnalyzer from './components/JobAnalyzer';
import Dashboard from './components/Dashboard';
import StudyPlan from './components/StudyPlan';
import Quiz from './components/Quiz';
import CodeEditor from './components/CodeEditor';
import { analyzeJobDescription, generateStudyPlan, generateQuiz, generateCodeChallenges } from './services/gemini';
import { JobAnalysis, TrainingPlan, QuizQuestion, CodeChallenge } from './types';

enum Tab {
  ANALYSIS = 'analysis',
  PLAN = 'plan',
  QUIZ = 'quiz',
  CODE = 'code'
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ANALYSIS);
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState<JobAnalysis | null>(null);
  
  // Data States
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [challenges, setChallenges] = useState<CodeChallenge[]>([]);

  const handleAnalyze = async (text: string, imageBase64?: string, company?: string) => {
    setLoading(true);
    try {
      // 1. Analyze Job first (Blocking)
      const analysis = await analyzeJobDescription(text, imageBase64, company);
      setJobData(analysis);

      // 2. Generate Plan, Quiz, and Code Challenge in PARALLEL
      const [planModules, quizQuestions, codeChallenges] = await Promise.all([
        generateStudyPlan(analysis),
        generateQuiz(analysis),
        generateCodeChallenges(analysis)
      ]);

      setTrainingPlan({
        techStack: analysis.skills,
        studyPlan: planModules
      });
      setQuiz(quizQuestions);
      setChallenges(codeChallenges);

      setActiveTab(Tab.PLAN);
    } catch (error) {
      console.error(error);
      alert("Something went wrong during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshQuiz = async () => {
    if (!jobData) return;
    const newQuiz = await generateQuiz(jobData);
    setQuiz(newQuiz);
  };

  const refreshChallenges = async () => {
    if (!jobData) return;
    const newChallenges = await generateCodeChallenges(jobData);
    setChallenges(newChallenges);
  };

  const isLandingPage = activeTab === Tab.ANALYSIS;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Sidebar Navigation - Only show if NOT on landing page */}
      {!isLandingPage && (
        <aside className="w-20 md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col fixed h-full z-10 transition-all">
          <div className="p-4 md:p-6 flex items-center space-x-3 text-white">
            <Sparkles className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold hidden md:inline">SkillBridge AI</span>
          </div>
          
          <nav className="flex-1 mt-6 px-2 space-y-2">
            <NavButton 
              active={false} 
              onClick={() => setActiveTab(Tab.ANALYSIS)} 
              icon={<LayoutDashboard />} 
              label="Analyzer" 
            />
            <NavButton 
              active={activeTab === Tab.PLAN} 
              onClick={() => setActiveTab(Tab.PLAN)} 
              icon={<BookOpen />} 
              label="Study Plan" 
              disabled={!jobData}
            />
            <NavButton 
              active={activeTab === Tab.QUIZ} 
              onClick={() => setActiveTab(Tab.QUIZ)} 
              icon={<CheckSquare />} 
              label="Assessment" 
              disabled={!jobData}
            />
            <NavButton 
              active={activeTab === Tab.CODE} 
              onClick={() => setActiveTab(Tab.CODE)} 
              icon={<Code />} 
              label="Coding Lab" 
              disabled={!jobData}
            />
          </nav>

          <div className="p-4 border-t border-slate-800">
              <div className="flex items-center space-x-3 text-sm text-slate-500 cursor-pointer hover:text-white transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Reset App</span>
              </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${!isLandingPage ? 'ml-20 md:ml-64' : 'w-full'} p-6 md:p-10 overflow-y-auto transition-all`}>
        
        {/* Landing Page Header */}
        {isLandingPage && (
           <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Sparkles className="w-8 h-8" />
                <span className="text-2xl font-bold text-slate-900">SkillBridge AI</span>
              </div>
              <div className="text-sm text-slate-400">Placement Assistance System</div>
           </div>
        )}

        <div className="max-w-6xl mx-auto">
          
          {/* Internal App Header (Hidden on Landing Page) */}
          {!isLandingPage && (
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {activeTab === Tab.PLAN && "Study Roadmap"}
                  {activeTab === Tab.QUIZ && "Skill Assessment"}
                  {activeTab === Tab.CODE && "Coding Challenge"}
                </h1>
                <p className="text-slate-500 mt-1">
                  {activeTab === Tab.PLAN && "A tailored weekly schedule to crack the interview."}
                  {activeTab === Tab.QUIZ && "Practice questions adapted to the company's pattern."}
                  {activeTab === Tab.CODE && "Write and execute code in a simulated environment."}
                </p>
              </div>
              <div className="text-sm text-slate-400">Placement Assistance System</div>
            </header>
          )}

          {/* Tab Content */}
          <div className="space-y-8">
            
            {/* ANALYSIS TAB */}
            {activeTab === Tab.ANALYSIS && (
              <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                 <JobAnalyzer onAnalyze={handleAnalyze} isLoading={loading} />
                 {jobData && (
                   <div className="pt-8 border-t border-slate-200">
                      <h2 className="text-xl font-bold mb-4 text-slate-800">Last Analysis</h2>
                      <Dashboard analysis={jobData} />
                      <div className="text-center">
                        <button 
                          onClick={() => setActiveTab(Tab.PLAN)}
                          className="text-indigo-600 font-semibold hover:underline"
                        >
                          View Generated Plan &rarr;
                        </button>
                      </div>
                   </div>
                 )}
              </div>
            )}

            {/* PLAN TAB */}
            {activeTab === Tab.PLAN && jobData && trainingPlan && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Dashboard analysis={jobData} />
                <StudyPlan 
                  plan={trainingPlan} 
                  onBack={() => setActiveTab(Tab.ANALYSIS)} 
                />
              </div>
            )}

            {/* QUIZ TAB */}
            {activeTab === Tab.QUIZ && jobData && (
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Quiz questions={quiz} onRefresh={refreshQuiz} />
              </div>
            )}

            {/* CODE TAB */}
            {activeTab === Tab.CODE && jobData && challenges.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CodeEditor challenges={challenges} onRefresh={refreshChallenges} />
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    } ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-slate-400' : ''}`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="hidden md:inline font-medium">{label}</span>
  </button>
);
