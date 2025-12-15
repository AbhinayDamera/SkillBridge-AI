import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, Building2, GraduationCap, Zap, Lightbulb, AlertCircle } from 'lucide-react';

interface JobAnalyzerProps {
  onAnalyze: (text: string, imageBase64?: string, company?: string) => void;
  isLoading: boolean;
}

const JobAnalyzer: React.FC<JobAnalyzerProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setError('');
    if (!companyName.trim()) {
      setError('Please enter a target company name.');
      return;
    }

    if (activeTab === 'text' && !text.trim()) {
      setError('Please paste the job description text.');
      return;
    }
    if (activeTab === 'image' && !image) {
      setError('Please upload a job description image.');
      return;
    }

    // Extract base64 raw string if image exists
    const base64Data = image ? image.split(',')[1] : undefined;
    onAnalyze(text, base64Data, companyName);
  };

  return (
    <div className="w-full mx-auto">
      
      {/* Hero Section */}
      <div className="text-center mb-10 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
          Land Your Dream Job with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Customized Training</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Upload a job description or screenshot. Our AI will analyze the requirements and build a personalized study plan, interview prep, and project ideas just for you.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-w-3xl mx-auto mb-16 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
             <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
             <p className="text-slate-600 font-medium animate-pulse">Analyzing for {companyName}...</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => { setActiveTab('text'); setError(''); }}
            className={`flex-1 py-4 flex items-center justify-center space-x-2 font-medium transition-colors ${
              activeTab === 'text' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Job Description</span>
          </button>
          <button 
             onClick={() => { setActiveTab('image'); setError(''); }}
             className={`flex-1 py-4 flex items-center justify-center space-x-2 font-medium transition-colors ${
              activeTab === 'image' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Screenshot</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8">
           
           {/* Company Input (Mandatory) */}
           <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Target Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); setError(''); }}
                  placeholder="e.g. TCS, Amazon, Google"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none ${
                    error && !companyName.trim() ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5 ml-1">
                We use this to identify the company's specific interview pattern.
              </p>
           </div>

           {activeTab === 'text' ? (
             <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Paste the job requirements here
                </label>
                <textarea
                  className={`w-full p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-700 outline-none h-40 ${
                    error && !text.trim() ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="Paste Job Description, Role details, and Skills required..."
                  value={text}
                  onChange={(e) => { setText(e.target.value); setError(''); }}
                />
             </div>
           ) : (
             <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Upload Screenshot
                </label>
                <div
                  className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all cursor-pointer ${
                    error && !image 
                    ? 'border-red-300 bg-red-50' 
                    : dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  
                  {image ? (
                    <div className="relative w-full h-full flex items-center justify-center group">
                      <img src={image} alt="Preview" className="max-h-full rounded-lg object-contain shadow-sm" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                          Change Image
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 font-medium">Drag & Drop or Click to Upload</p>
                    </>
                  )}
                </div>
             </div>
           )}

            {error && (
              <div className="mb-4 flex items-center text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}

           <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-[0.98] ${
               isLoading
               ? 'bg-indigo-300 cursor-not-allowed shadow-none'
               : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30'
            }`}
           >
             Generate Training Plan
           </button>
           <p className="text-center text-[10px] text-slate-400 mt-3 uppercase tracking-wider">
             Powered by Gemini AI • 100% Personalized to the Role
           </p>
        </div>
      </div>

      {/* Footer Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center px-4">
          <div className="flex flex-col items-center group cursor-default">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-slate-800 mb-1">Smart Curriculum</h3>
             <p className="text-sm text-slate-500">Weekly plan focused on what matters most for the role.</p>
          </div>
          <div className="flex flex-col items-center group cursor-default">
             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-slate-800 mb-1">Interview Prep</h3>
             <p className="text-sm text-slate-500">Questions & answers tailored to the company's pattern.</p>
          </div>
          <div className="flex flex-col items-center group cursor-default">
             <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-slate-800 mb-1">Project Ideas</h3>
             <p className="text-sm text-slate-500">Coding challenges that mimic real-world placement tests.</p>
          </div>
      </div>

    </div>
  );
};

export default JobAnalyzer;
