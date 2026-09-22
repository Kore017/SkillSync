import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAppContext } from '../lib/AppContext';
import { t } from '../lib/i18n';
import api from '../lib/api';
import { TrendingUp, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Recommendations() {
  const { lang } = useAppContext();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('');
  const [districts, setDistricts] = useState([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    api.get('/api/courses/districts').then(res => setDistricts(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setPage(1); // Reset page on district change
    fetchRecommendations();
  }, [district]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (district) params.district = district;

      const res = await api.get('/api/dashboard/curriculum-recommendations', { params });
      setRecommendations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(recommendations.length / itemsPerPage) || 1;
  const paginatedRecs = recommendations.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t(lang, 'recommendations')}</h1>
            <p className="text-sm text-gray-500">Curriculum updates and capacity expansion strategies</p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
             <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-2">Filter</span>
             <select
               value={district}
               onChange={(e) => setDistrict(e.target.value)}
               className="border-none bg-gray-50 rounded-md px-3 py-1.5 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
             >
               <option value="">{t(lang, 'all')} {t(lang, 'district')}s</option>
               {districts.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-2"></div>
            <p className="text-sm font-medium">{t(lang, 'loading')}</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-base font-medium text-gray-800">{t(lang, 'noData')}</p>
            <p className="text-xs text-gray-400 mt-1">Select a different district or explore the active courses tab.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {paginatedRecs.map((rec, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow overflow-hidden group">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-700 transition-colors">{rec.course_name}</h3>
                        <p className="text-[13px] text-gray-500 font-medium mt-1">{rec.iti_name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{rec.district} • {rec.sector}</p>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold
                        ${rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}
                      `}>
                        {rec.priority || 'MEDIUM'} PRIORITY
                      </span>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-rose-500" /> Key Curriculum Additions:
                      </h4>
                      <div className="flex flex-wrap gap-1.5 min-h-[44px]">
                        {(rec.skills_to_add || rec.gap_skills)?.length > 0 ? (
                          (rec.skills_to_add || rec.gap_skills).slice(0, 5).map((skill, sIdx) => (
                            <span key={sIdx} className="bg-rose-50 text-rose-700 text-[11px] px-2.5 py-1 rounded-md border border-rose-100 font-medium">
                              + {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Standard syllabus adequate</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-emerald-500" /> Target Industry Roles:
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1.5">
                        {((rec.related_jobs || rec.related_market_demand) || []).slice(0, 2).map((job, jIdx) => (
                          <li key={jIdx} className="flex justify-between items-center bg-white px-2 py-1.5 rounded shadow-sm border border-slate-100">
                            <span className="font-medium text-slate-700 truncate pr-2">{job.job_title || job.title}</span>
                            <span className="font-bold text-emerald-700 whitespace-nowrap">
                              {job.salary_range ? `₹${job.salary_range}` : (job.min_salary ? `₹${job.min_salary/1000}k+` : '')}
                            </span>
                          </li>
                        ))}
                        {(!rec.related_jobs || rec.related_jobs.length === 0) && (
                          <li className="text-[11px] text-gray-400 italic px-1">Searching regional job index...</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border-t border-gray-100 px-5 py-3 flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Intake: <strong className="text-slate-800 text-[13px]">{rec.current_intake || rec.annual_intake_seats || '--'}</strong></span>
                    <span>Placement: <strong className="text-emerald-600 text-[13px]">{rec.current_placement_rate || rec.current_placement || rec.placement_rate_pct}%</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations Pagination */}
            {totalPages > 1 && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Page <span className="text-blue-600">{page}</span> of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-40 transition-all font-medium text-gray-600"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-40 transition-all font-medium text-gray-600"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
