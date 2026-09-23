import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAppContext } from '../lib/AppContext';
import { t } from '../lib/i18n';
import api from '../lib/api';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  Sparkles,
  BookOpen,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function ProfileAnalyzer() {
  const { lang } = useAppContext();

  // Form State
  const [profileType, setProfileType] = useState('student');
  const [qualification, setQualification] = useState('ITI Diploma (Mechanical / Electrical)');
  const [district, setDistrict] = useState('Pune');
  const [sector, setSector] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('Blueprint Reading, Basic Lathe Operation, Hand Tools');
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Dropdown options
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);

  // Results State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/api/courses/districts').then(res => setDistricts(res.data)).catch(console.error);
    api.get('/api/courses/sectors').then(res => {
      setSectors(res.data);
      if (res.data.length > 0) setSector(res.data[0]);
    }).catch(console.error);
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    const trimmed = customSkillInput.trim();
    if (currentSkills) {
      setCurrentSkills(prev => `${prev}, ${trimmed}`);
    } else {
      setCurrentSkills(trimmed);
    }
    setCustomSkillInput('');
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = currentSkills
        .split(/[,;\n]+/)
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        profile_type: profileType,
        qualification,
        district,
        sector,
        target_role: targetRole,
        current_skills: skillsArray
      };

      const res = await api.post('/api/dashboard/profile-analyzer', payload);
      setResult(res.data);
    } catch (err) {
      console.error('Error analyzing profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial default analysis once sector loads
  useEffect(() => {
    if (sector && !result) {
      handleAnalyze();
    }
  }, [sector]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="text-blue-600" size={28} />
              {t(lang, 'profileAnalyzer')}
            </h1>
            <p className="text-sm text-gray-500">
              Interactive industry readiness audit for Students, Working Professionals & ITI Apprentices
            </p>
          </div>
        </div>

        {/* Profile Input Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleAnalyze} className="space-y-5">
            {/* Profile Category Tabs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                I am a:
              </label>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  { id: 'student', label: 'Student / Fresher' },
                  { id: 'professional', label: 'Working Professional' },
                  { id: 'worker', label: 'Skilled Technician / Worker' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setProfileType(type.id)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      profileType === type.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Qualification / Trade
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. ITI Fitter, 12th Pass, Diploma"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Target Sector
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Target District (Maharashtra)
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Maharashtra Districts</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Current Skills Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Your Current Skills (comma or semicolon separated):
                </label>
                <span className="text-[11px] text-gray-400">e.g. CNC, PLC, Welding, Quality Inspection, CAD</span>
              </div>
              <textarea
                rows={2}
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter skills separated by commas..."
              />
            </div>

            {/* Quick Skill Add Tag Helper */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                placeholder="Add another skill..."
                className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors"
              >
                + Add Skill
              </button>

              <button
                type="submit"
                disabled={loading}
                className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Run Profile Analysis
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Top Score & Summary Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Industry Readiness</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-white">{result.profile_summary.readiness_score}%</span>
                    <span className="text-xs text-blue-200">Competency match</span>
                  </div>
                </div>
                <div className="w-full bg-blue-950/60 rounded-full h-2 mt-4 overflow-hidden border border-blue-700/50">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${result.profile_summary.readiness_score}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Skills Profile</span>
                <p className="text-2xl font-bold text-gray-900 mt-2">{result.profile_summary.total_user_skills}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  ✓ {result.profile_summary.matched_industry_skills} aligned with current jobs
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Profile Persona</span>
                <p className="text-lg font-bold text-blue-900 mt-2">{result.profile_summary.profile_type}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{result.profile_summary.qualification}</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Target Region</span>
                <p className="text-lg font-bold text-gray-900 mt-2">{result.profile_summary.district}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{result.profile_summary.sector}</p>
              </div>
            </div>

            {/* Pros and Cons Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Pros / Strengths */}
              <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="bg-emerald-50/80 p-4 border-b border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                  <h3 className="font-bold text-emerald-900 text-sm uppercase tracking-wide">
                    Profile Pros & Strengths
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {result.pros.map((pro, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="p-1 bg-emerald-100 rounded-full text-emerald-700 mt-0.5">
                        <CheckCircle2 size={13} />
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">{pro}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Cons / Areas for Improvement */}
              <div className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden">
                <div className="bg-rose-50/80 p-4 border-b border-rose-100 flex items-center gap-2">
                  <XCircle className="text-rose-600" size={20} />
                  <h3 className="font-bold text-rose-900 text-sm uppercase tracking-wide">
                    Profile Cons & Skill Gaps
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {result.cons.map((con, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="p-1 bg-rose-100 rounded-full text-rose-700 mt-0.5">
                        <AlertCircle size={13} />
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">{con}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills You Should Learn (Actionable Recommendations) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={20} />
                    High-Priority Skills You Should Learn
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Skills actively demanded by employers in {result.profile_summary.district} with estimated salaries
                  </p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200">
                  {result.skills_to_learn.length} High-Demand Skills
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.skills_to_learn.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/40 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900 text-sm">{item.skill}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.priority}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                      <span>Demand: <strong className="text-gray-800">{item.demand_count} jobs</strong></span>
                      <span className="font-bold text-emerald-600">Est. ₹{item.est_salary.toLocaleString()}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Courses & Matching Jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommended Upgrading Courses */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <BookOpen className="text-indigo-600" size={18} />
                  Recommended ITI & Vocational Courses to Fill Gaps
                </h3>
                <div className="space-y-3">
                  {result.recommended_courses.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No specific courses found for this district filter</p>
                  ) : (
                    result.recommended_courses.map((course, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-gray-100 bg-slate-50/50 flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{course.course_name}</p>
                          <p className="text-xs text-gray-500">{course.iti_name} • {course.district}</p>
                          {course.skills_gap && (
                            <p className="text-[11px] text-rose-600 font-medium mt-1">
                              Fills: {course.skills_gap}
                            </p>
                          )}
                        </div>
                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-1 rounded">
                          {course.placement_rate}% placement
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Target Job Roles */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Briefcase className="text-blue-600" size={18} />
                  Matching Job Openings in Sector
                </h3>
                <div className="space-y-3">
                  {result.matching_jobs.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No current matching jobs in selected filter</p>
                  ) : (
                    result.matching_jobs.map((job, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-gray-100 bg-slate-50/50 flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{job.job_title}</p>
                          <p className="text-xs text-gray-500">{job.district} • {job.sector}</p>
                          <span className="inline-block mt-1 text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                            Trend: {job.trend}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                          {job.salary_range}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
