import React from 'react';
import { JobAnalysis, CompanyType } from '../types';
import { Building2, Code2, Users, Briefcase } from 'lucide-react';

interface DashboardProps {
  analysis: JobAnalysis;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Role Card */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Target Role</p>
          <h3 className="text-lg font-bold text-slate-800 leading-tight">{analysis.role}</h3>
        </div>
      </div>

      {/* Company Card */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</p>
          <h3 className="text-lg font-bold text-slate-800 leading-tight">{analysis.company}</h3>
          <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
            analysis.type === CompanyType.PRODUCT ? 'bg-green-100 text-green-700' : 
            analysis.type === CompanyType.SERVICE ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {analysis.type}
          </span>
        </div>
      </div>

       {/* Skills Card */}
       <div className="md:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <Code2 className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Key Skills Detected</p>
          <div className="flex flex-wrap gap-2">
            {analysis.skills.map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;