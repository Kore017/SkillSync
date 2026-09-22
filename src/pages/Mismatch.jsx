import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAppContext } from '../lib/AppContext';
import { t } from '../lib/i18n';
import api from '../lib/api';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Mismatch() {
  const { lang } = useAppContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('');
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    api.get('/api/courses/districts').then(res => setDistricts(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchMismatch();
  }, [district]);

  const fetchMismatch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (district) params.district = district;

      const res = await api.get('/api/dashboard/mismatch', { params });
      setData(res.data);
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
            <h1 className="text-2xl font-bold text-gray-900">{t(lang, 'mismatch')}</h1>
            <p className="text-sm text-gray-500">Curriculum supply vs industry demand discrepancies</p>
          </div>

          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">{t(lang, 'all')} {t(lang, 'district')}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-2"></div>
            <p>{t(lang, 'loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Undersupply (High Demand) Courses */}
            <div className="bg-white rounded-lg shadow-sm border border-red-100 overflow-hidden">
              <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="text-red-600" size={20} />
                  <h2 className="font-semibold text-red-900">Undersupply / High Demand</h2>
                </div>
                <span className="bg-red-200/50 text-red-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                  {data?.undersupply?.length || 0} Courses
                </span>
              </div>
              <div className="p-4 divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {(!data?.undersupply || data?.undersupply?.length === 0) ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No undersupply courses identified</p>
                ) : (
                  data?.undersupply?.map((course, idx) => (
                    <div key={`${course.iti_name}-${course.course_name}-${idx}`} className="py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900 text-sm">{course.course_name}</h4>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold">
                          {course.placement_rate}% Placement
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{course.iti_name} • {course.district}</p>
                      {course.skills_gap && (
                        <div className="mt-2 text-[11px] bg-red-50/70 p-2 rounded border border-red-100/50 text-red-800 tracking-wide leading-relaxed">
                          <span className="font-bold text-red-700">INDUSTRY GAPS: </span>{course.skills_gap}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Oversupply (Low Demand) Courses */}
            <div className="bg-white rounded-lg shadow-sm border border-orange-100 overflow-hidden">
              <div className="bg-orange-50 p-4 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="text-orange-600" size={20} />
                  <h2 className="font-semibold text-orange-900">Oversupply / Low Demand</h2>
                </div>
                <span className="bg-orange-200/50 text-orange-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                  {data?.oversupply?.length || 0} Courses
                </span>
              </div>
              <div className="p-4 divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {(!data?.oversupply || data?.oversupply?.length === 0) ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No oversupply courses identified</p>
                ) : (
                  data?.oversupply?.map((course, idx) => (
                    <div key={`${course.iti_name}-${course.course_name}-${idx}`} className="py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900 text-sm">{course.course_name}</h4>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold">
                          {course.placement_rate}% Placement
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{course.iti_name} • {course.district}</p>
                      <div className="mt-2 text-[11px] bg-amber-50/70 p-2 rounded border border-amber-100/50 text-amber-800 tracking-wide leading-relaxed">
                        <span className="font-bold text-amber-700">ACTION REQUIRED: </span>Review seats, modernize curriculum, or reallocate to emerging sectors.
                      </div>
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
