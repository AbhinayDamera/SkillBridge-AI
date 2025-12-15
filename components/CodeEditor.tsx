import React, { useState, useEffect, useRef } from 'react';
import { CodeChallenge, ExecutionResult } from '../types';
import { Play, RotateCcw, Terminal, AlertCircle, ChevronDown, CheckCircle2, XCircle, Lightbulb, FileText, LayoutList, List, ChevronRight } from 'lucide-react';
import { runCodeWithAI, getCodeHint } from '../services/gemini';

interface CodeEditorProps {
  challenges: CodeChallenge[];
  onRefresh: () => void;
}

type Language = 'python' | 'javascript' | 'java';
type Tab = 'description' | 'output' | 'hint';

const CodeEditor: React.FC<CodeEditorProps> = ({ challenges, onRefresh }) => {
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [hint, setHint] = useState<string>('');
  const [loadingHint, setLoadingHint] = useState(false);
  
  // Syntax Highlighting Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const challenge = challenges[activeChallengeIdx];

  useEffect(() => {
    if (challenge) {
        setCode(challenge.starterCode[language]);
        setResult(null);
        setHint('');
        setActiveTab('description');
    }
  }, [challenge, language]);

  const handleRun = async () => {
    setIsRunning(true);
    setActiveTab('output');
    
    try {
      const res = await runCodeWithAI(code, language, challenge.description);
      setResult(res);
    } catch (e) {
      setResult({
          status: 'Error',
          summary: 'Failed to connect to execution engine.',
          testCases: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleGetHint = async () => {
      setLoadingHint(true);
      setActiveTab('hint');
      const h = await getCodeHint(code, language, challenge.description);
      setHint(h);
      setLoadingHint(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (preRef.current) {
          preRef.current.scrollTop = e.currentTarget.scrollTop;
          preRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }
  };

  // Syntax highlighting helper
  const getHighlightedCode = () => {
      const prism = (window as any).Prism;
      if (prism) {
          const langMap: Record<string, string> = {
              python: 'python',
              javascript: 'javascript',
              java: 'java'
          };
          const grammar = prism.languages[langMap[language]];
          if (grammar) {
              return prism.highlight(code, grammar, langMap[language]);
          }
      }
      return code.replace(/[&<>"']/g, (m: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] || m));
  };

  if (!challenges || challenges.length === 0) return <div>Loading...</div>;

  const lineCount = code.split('\n').length;

  return (
    <div className="flex h-[750px] bg-[#0d0d0d] rounded-xl shadow-2xl overflow-hidden text-white border border-[#333]">
      
      {/* Sidebar - Problems List */}
      <div className="w-64 bg-[#161616] border-r border-[#333] flex flex-col">
          <div className="p-4 border-b border-[#333] flex items-center justify-between">
              <span className="font-bold text-gray-300 text-sm flex items-center gap-2">
                  <List className="w-4 h-4" /> Problem List
              </span>
              <button onClick={onRefresh} className="p-1.5 hover:bg-[#333] rounded text-gray-400 transition-colors" title="Load New Problems">
                  <RotateCcw className="w-3.5 h-3.5" />
              </button>
          </div>
          <div className="flex-1 overflow-y-auto">
              {challenges.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveChallengeIdx(idx)}
                    className={`w-full text-left p-4 border-b border-[#252526] hover:bg-[#1f1f1f] transition-colors flex flex-col gap-1.5 ${activeChallengeIdx === idx ? 'bg-[#1f1f1f] border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
                  >
                      <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-gray-300 truncate w-32">{c.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              c.difficulty === 'Easy' ? 'bg-green-900/40 text-green-400' :
                              c.difficulty === 'Medium' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-red-900/40 text-red-400'
                          }`}>
                              {c.difficulty}
                          </span>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-2">{c.description}</p>
                  </button>
              ))}
          </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
          
        {/* Top Bar */}
        <div className="bg-[#1e1e1e] p-3 flex justify-between items-center border-b border-[#333]">
            <div className="flex items-center space-x-4">
                <span className="font-mono text-sm text-gray-200 font-bold flex items-center gap-2">
                    <CodeChallengeIcon difficulty={challenge.difficulty} />
                    {challenge.title}
                </span>
                
                <div className="h-4 w-px bg-[#444]"></div>

                {/* Language Selector */}
                <div className="relative group">
                <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="appearance-none bg-[#1e1e1e] hover:bg-[#333] text-blue-400 text-xs font-mono py-1.5 pl-3 pr-8 rounded border border-[#444] outline-none cursor-pointer transition-colors focus:border-blue-500"
                >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                </div>
            </div>
            
            <div className="flex space-x-2">
                <button 
                onClick={handleGetHint}
                className="px-3 py-1.5 bg-yellow-600/10 text-yellow-500 hover:bg-yellow-600/20 rounded border border-yellow-600/20 transition-colors flex items-center gap-2 text-xs font-medium" 
            >
                <Lightbulb className="w-3.5 h-3.5" />
                Hint
            </button>
            
            <button
                onClick={handleRun}
                disabled={isRunning}
                className="px-4 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded font-medium text-xs flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(21,128,61,0.3)] hover:shadow-[0_0_20px_rgba(21,128,61,0.5)]"
            >
                {isRunning ? <span className="animate-pulse">Running...</span> : <><Play className="w-3 h-3 mr-1.5 fill-current" /> Run</>}
            </button>
            </div>
        </div>

        {/* Content Split */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Editor */}
            <div className="flex-1 flex flex-col relative border-r border-[#333] bg-[#1e1e1e]">
                <div className="flex-1 relative flex overflow-hidden">
                    {/* Line Numbers */}
                    <div className="w-10 bg-[#1e1e1e] border-r border-[#333] text-right pr-3 pt-4 text-gray-600 font-mono text-[13px] select-none leading-6">
                        {Array.from({ length: lineCount }).map((_, i) => (
                            <div key={i} className="h-6">{i + 1}</div>
                        ))}
                    </div>

                    {/* Editor Container */}
                    <div className="relative flex-1 h-full font-mono text-[14px]">
                        {/* Syntax Highlight Layer */}
                        <pre 
                            ref={preRef}
                            className="absolute inset-0 p-4 m-0 pointer-events-none overflow-hidden z-0 leading-6"
                            aria-hidden="true"
                        >
                             <code 
                                className={`language-${language === 'python' ? 'python' : language === 'java' ? 'java' : 'javascript'}`}
                                dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
                             />
                        </pre>

                        {/* Input Layer */}
                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onScroll={handleScroll}
                            className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none border-none outline-none z-10 leading-6 overflow-auto custom-scrollbar"
                            spellCheck="false"
                            autoCapitalize="off"
                            autoComplete="off"
                        />
                    </div>
                </div>
            </div>

            {/* Right Panel (Tabs) */}
            <div className="w-[420px] flex flex-col bg-[#161616]">
                
                {/* Tab Headers */}
                <div className="flex border-b border-[#333]">
                    <button 
                        onClick={() => setActiveTab('description')}
                        className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'description' ? 'border-blue-500 text-blue-400 bg-[#1e1e1e]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        <FileText className="w-3.5 h-3.5" /> Problem
                    </button>
                    <button 
                        onClick={() => setActiveTab('output')}
                        className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'output' ? 'border-green-500 text-green-400 bg-[#1e1e1e]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        <Terminal className="w-3.5 h-3.5" /> Output
                    </button>
                    <button 
                        onClick={() => setActiveTab('hint')}
                        className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'hint' ? 'border-yellow-500 text-yellow-400 bg-[#1e1e1e]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        <Lightbulb className="w-3.5 h-3.5" /> Hint
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#161616]">
                    
                    {/* Problem Tab */}
                    {activeTab === 'description' && (
                        <div className="animate-in fade-in duration-300">
                            <h3 className="text-base font-bold text-gray-100 mb-4">{challenge.title}</h3>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                                    {challenge.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Output Tab */}
                    {activeTab === 'output' && (
                        <div className="animate-in fade-in duration-300">
                        {!result && !isRunning && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 pt-10">
                                <div className="p-4 bg-[#252526] rounded-full opacity-50">
                                    <Play className="w-6 h-6" />
                                </div>
                                <p className="text-xs">Run your code to see execution results.</p>
                            </div>
                        )}

                        {isRunning && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3 pt-10">
                                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-xs animate-pulse">Running test cases...</p>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-6">
                                {/* Status Header */}
                                <div className={`p-4 rounded-xl border ${result.status === 'Success' ? 'bg-green-900/10 border-green-500/20' : 'bg-red-900/10 border-red-500/20'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {result.status === 'Success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                            <span className={`text-base font-bold ${result.status === 'Success' ? 'text-green-400' : 'text-red-400'}`}>
                                                {result.status === 'Success' ? 'All Tests Passed' : 'Execution Failed'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">{result.summary}</p>
                                    
                                    {result.errorDetails && (
                                        <div className="mt-3 p-3 bg-black/40 rounded-lg border border-red-500/20">
                                            <p className="text-[10px] uppercase text-red-500 font-bold mb-1">Error Log</p>
                                            <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap break-all">{result.errorDetails}</pre>
                                        </div>
                                    )}
                                </div>

                                {/* Test Cases List */}
                                {result.testCases && result.testCases.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Results</h4>
                                            <span className="text-xs text-gray-600 font-mono">
                                                {result.testCases.filter(t => t.passed).length}/{result.testCases.length} Passed
                                            </span>
                                        </div>
                                        
                                        {result.testCases.map((tc, idx) => (
                                            <div key={idx} className="group">
                                                <div className={`rounded-lg border overflow-hidden transition-colors ${tc.passed ? 'border-[#333] bg-[#222]' : 'border-red-900/30 bg-[#221010]'}`}>
                                                    <div className="px-4 py-2.5 flex items-center justify-between border-b border-black/20">
                                                        <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${tc.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                            Test Case {idx + 1}
                                                        </span>
                                                        {tc.passed ? 
                                                            <span className="text-[10px] font-bold text-green-500 tracking-wider">PASS</span> : 
                                                            <span className="text-[10px] font-bold text-red-500 tracking-wider">FAIL</span>
                                                        }
                                                    </div>
                                                    
                                                    <div className="p-4 grid grid-cols-1 gap-3 text-xs font-mono">
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] text-gray-500 uppercase">Input</span>
                                                            <div className="p-2 bg-black/30 rounded border border-white/5 text-gray-300">
                                                                {tc.input}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] text-gray-500 uppercase">Expected</span>
                                                                <div className="p-2 bg-black/30 rounded border border-white/5 text-green-400/80">
                                                                    {tc.expectedOutput}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] text-gray-500 uppercase">Actual</span>
                                                                <div className={`p-2 bg-black/30 rounded border border-white/5 ${tc.passed ? 'text-gray-300' : 'text-red-400'}`}>
                                                                    {tc.actualOutput}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        </div>
                    )}

                    {/* Hint Tab */}
                    {activeTab === 'hint' && (
                        <div className="animate-in fade-in duration-300">
                            {loadingHint ? (
                                <div className="flex flex-col items-center justify-center py-10 text-yellow-600">
                                    <Lightbulb className="w-8 h-8 animate-pulse mb-2" />
                                    <p className="text-xs">Consulting AI...</p>
                                </div>
                            ) : hint ? (
                                <div className="bg-yellow-900/10 border border-yellow-700/30 rounded-lg p-5">
                                    <div className="flex items-start gap-3">
                                        <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-yellow-500 mb-2">Hint</h4>
                                            <p className="text-sm text-yellow-100/80 leading-relaxed font-sans">
                                                {hint}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-10 px-6">
                                    <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm mb-4">Stuck on the problem? Get a gentle nudge in the right direction.</p>
                                    <button 
                                        onClick={handleGetHint}
                                        className="px-4 py-2 bg-[#252526] hover:bg-[#333] text-gray-200 text-xs font-medium rounded-full transition-colors border border-[#444]"
                                    >
                                        Reveal Hint
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const CodeChallengeIcon = ({ difficulty }: { difficulty: string }) => {
    const color = difficulty === 'Easy' ? 'text-green-500' : difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500';
    return <div className={`w-2 h-2 rounded-full bg-current ${color}`} />;
}

export default CodeEditor;
