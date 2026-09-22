import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAppContext } from '../lib/AppContext';
import { t } from '../lib/i18n';
import api from '../lib/api';
import { ArrowUpRight, ArrowDownRight, Lightbulb, CheckSquare } from 'lucide-react';

export default function TrainingPlan() {
  const { lang } = useAppContext();
  const [district, setDistrict] = useState('Pune');
  const [districts, setDistricts] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/courses/districts').then(res => {
      setDistricts(res.data);
      if (res.data.length > 0 && !res.data.includes('Pune')) {
        setDistrict(res.data[0]);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (district) {
      fetchTrainingPlan();
    }
  }, [district]);

  const fetchTrainingPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/dashboard/training-plan/${district}`);
      setPlan(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t(lang, 'trainingPlan')}</h1>
            <p className="text-sm text-gray-500">Actionable annual skill roadmap tailored for district administration</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{t(lang, 'district')}:</span>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-2"></div>
            <p>{t(lang, 'loading')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Priority Skills Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <CheckSquare size={20} className="text-yellow-400" />
                {t(lang, 'prioritySkills')} in {district}
              </h2>
              <p className="text-xs text-blue-200 mb-4">Focus areas for short-term modular training and faculty development programs</p>
              <div className="flex flex-wrap gap-2">
                {plan?.priority_skills_to_develop?.map((item, idx) => {
                  const skillName = Array.isArray(item) ? item[0] : item;
                  const count = Array.isArray(item) ? item[1] : null;
                  return (
                    <span key={idx} className="bg-blue-800/80 border border-blue-600 text-xs px-3 py-1.5 rounded-md font-medium text-white shadow-sm flex items-center gap-1.5">
                      <span>{skillName}</span>
                      {count && <span className="bg-blue-700 px-1.5 py-0.2 rounded-full text-[10px] text-blue-200">{count} ITIs</span>}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Courses to Expand */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-green-50 p-4 border-b border-green-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="text-green-600" size={20} />
                    <h3 className="font-semibold text-green-900">{t(lang, 'expand')}</h3>
                  </div>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">
                    {plan?.courses_to_expand?.length || 0}
                  </span>
                </div>
                <div className="p-4 divide-y divide-gray-100">
                  {plan?.courses_to_expand?.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No immediate expansion needed</p>
                  ) : (
                    plan?.courses_to_expand?.map((c, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.course || c.course_name}</p>
                          <p className="text-xs text-gray-500">{c.iti || c.iti_name} • {c.sector}</p>
                        </div>
                        <span className="text-xs bg-green-50 text-green-700 font-medium px-2 py-1 rounded">
                          {c.seats ? `${c.seats} seats` : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Courses to Review */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-orange-50 p-4 border-b border-orange-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="text-orange-600" size={20} />
                    <h3 className="font-semibold text-orange-900">{t(lang, 'review')}</h3>
                  </div>
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-bold">
                    {plan?.courses_to_review?.length || 0}
                  </span>
                </div>
                <div className="p-4 divide-y divide-gray-100">
                  {plan?.courses_to_review?.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No review candidates</p>
                  ) : (
                    plan?.courses_to_review?.map((c, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.course || c.course_name}</p>
                          <p className="text-xs text-gray-500">{c.iti || c.iti_name} • {c.sector}</p>
                        </div>
                        <span className="text-xs bg-orange-50 text-orange-700 font-medium px-2 py-1 rounded">
                          {c.placement_rate_pct != null || c.placement_rate != null ? `Placement: ${c.placement_rate_pct ?? c.placement_rate}%` : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Emerging Job Market Opportunities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb size={18} className="text-yellow-500" />
                {t(lang, 'emerging')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {plan?.emerging_opportunities?.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2 col-span-3 text-center">No emerging roles detected at this time</p>
                ) : (
                  plan?.emerging_opportunities?.map((job, idx) => (
                    <div key={idx} className="border border-gray-100 p-3 rounded-lg bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.sector}</p>
                      <p className="text-xs text-blue-600 mt-2 font-medium">{job.salary || job.salary_range ? `${job.salary || job.salary_range} / month` : 'Salary Est. Unavailable'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
