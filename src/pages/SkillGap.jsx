import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAppContext } from '../lib/AppContext';
import { t } from '../lib/i18n';
import api from '../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function SkillGap() {
  const { lang } = useAppContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');

  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    api.get('/api/courses/districts').then(res => setDistricts(res.data)).catch(console.error);
    api.get('/api/courses/sectors').then(res => setSectors(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchSkillGaps();
  }, [district, sector]);

  const fetchSkillGaps = async () => {
    setLoading(true);
    try {
      const params = {};
      if (district) params.district = district;
      if (sector) params.sector = sector;

      const res = await api.get('/api/dashboard/skill-gap', { params });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const rawGaps = data?.top_skill_gaps || data?.top_skills_gap || [];
  const rawTaught = data?.top_skills_taught || data?.top_skill_taught || [];

  const gapChartData = rawGaps.slice(0, 10).map((item) => ({
    skill: Array.isArray(item) ? item[0] : (item.skill || item.name || String(item)),
    count: Array.isArray(item) ? item[1] : (item.count || item.value || 0)
  }));

  const taughtChartData = rawTaught.slice(0, 10).map((item) => ({
    skill: Array.isArray(item) ? item[0] : (item.skill || item.name || String(item)),
    count: Array.isArray(item) ? item[1] : (item.count || item.value || 0)
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t(lang, 'skillGap')}</h1>
            <p className="text-sm text-gray-500">
              Comparative analysis of curriculum offerings against actual industry skill deficiencies across {data?.total_courses_analyzed || 0} courses
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{t(lang, 'all')} {t(lang, 'district')}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{t(lang, 'all')} {t(lang, 'sector')}</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-2"></div>
            <p className="text-sm">{t(lang, 'loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills Gap Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 bg-red-100 text-red-700 rounded-md">
                    <AlertCircle size={18} />
                  </div>
                  <h2 className="text-base font-bold text-red-900">Top Deficient Skills (Industry Gaps)</h2>
                </div>
                <p className="text-xs text-gray-500 mb-6">Critical competencies frequently reported missing by hiring employers</p>
              </div>

              {gapChartData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-gray-400 text-sm">
                  No skill gap data recorded for this selection
                </div>
              ) : (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={gapChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis
                        dataKey="skill"
                        type="category"
                        width={160}
                        tick={{ fontSize: 11, fill: '#334155' }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                        formatter={(val) => [`${val} courses missing this`, 'Mentions']}
                      />
                      <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} name="Deficient Courses" barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Skills Taught Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
                    <CheckCircle size={18} />
                  </div>
                  <h2 className="text-base font-bold text-blue-900">Top Skills Currently Taught</h2>
                </div>
                <p className="text-xs text-gray-500 mb-6">Skills extensively represented in existing ITI course syllabi</p>
              </div>

              {taughtChartData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-gray-400 text-sm">
                  No taught skills data recorded for this selection
                </div>
              ) : (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={taughtChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis
                        dataKey="skill"
                        type="category"
                        width={160}
                        tick={{ fontSize: 11, fill: '#334155' }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                        formatter={(val) => [`${val} courses teaching this`, 'Mentions']}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Offering Courses" barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
