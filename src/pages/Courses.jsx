import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAppContext } from '../lib/AppContext';
import { t } from '../lib/i18n';
import api from '../lib/api';
import { Search, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export default function Courses() {
  const { lang } = useAppContext();
  const [courses, setCourses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [mismatch, setMismatch] = useState('');

  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    api.get('/api/courses/districts').then(res => setDistricts(res.data)).catch(console.error);
    api.get('/api/courses/sectors').then(res => setSectors(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, page, district, sector, mismatch]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (district) params.district = district;
      if (sector) params.sector = sector;
      if (mismatch) params.mismatch = mismatch;

      const res = await api.get('/api/courses/', { params });
      setCourses(res.data.data || []);
      setTotalCount(res.data.total || 0);
      setTotalPages(Math.ceil((res.data.total || 0) / (res.data.limit || 12)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setDistrict('');
    setSector('');
    setMismatch('');
    setPage(1);
  };

  const hasActiveFilters = search || district || sector || mismatch;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t(lang, 'courses')}</h1>
            <p className="text-sm text-gray-500">
              Showing {courses.length} of {totalCount} verified training courses across Maharashtra
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <RotateCcw size={14} /> Reset Filters
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={t(lang, 'search') + " course or ITI name..."}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={district}
              onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t(lang, 'all')} {t(lang, 'district')}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={sector}
              onChange={(e) => { setSector(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t(lang, 'all')} {t(lang, 'sector')}</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={mismatch}
              onChange={(e) => { setMismatch(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="UNDERSUPPLY_HIGH_DEMAND">Undersupply (High Demand)</option>
              <option value="OVERSUPPLY_LOW_PLACEMENT">Oversupply (Low Demand)</option>
              <option value="BALANCED">Balanced</option>
            </select>
          </div>
        </div>

        {/* Course Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-2"></div>
              <p className="text-sm">{t(lang, 'loading')}</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-base font-medium text-gray-700">{t(lang, 'noData')}</p>
              <p className="text-xs text-gray-400 mt-1">Try modifying your search or clearing active filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Course & ITI</th>
                    <th className="p-4">District / Sector</th>
                    <th className="p-4">Intake / Placement</th>
                    <th className="p-4">Mismatch Status</th>
                    <th className="p-4">Key Skills Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {courses.map((course) => {
                    const isUndersupply = course.mismatch_flag === 'UNDERSUPPLY_HIGH_DEMAND';
                    const isOversupply = course.mismatch_flag === 'OVERSUPPLY_LOW_PLACEMENT' || course.mismatch_flag === 'OVERSUPPLY_LOW_DEMAND';

                    return (
                      <tr key={course.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-gray-900">{course.course_name}</p>
                          <p className="text-xs text-gray-500">{course.iti_name} <span className="text-slate-400">({course.iti_type})</span></p>
                        </td>
                        <td className="p-4">
                          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded mr-1.5">
                            {course.district}
                          </span>
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                            {course.sector}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-900 font-medium">{course.annual_intake_seats} seats</p>
                          <p className="text-xs text-emerald-600 font-semibold">{course.placement_rate_pct}% placement</p>
                        </td>
                        <td className="p-4">
                          {isUndersupply && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                              <AlertCircle size={12} className="mr-1 text-red-500" /> Undersupply
                            </span>
                          )}
                          {isOversupply && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
                              <AlertCircle size={12} className="mr-1 text-orange-500" /> Oversupply
                            </span>
                          )}
                          {!isUndersupply && !isOversupply && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <CheckCircle2 size={12} className="mr-1 text-emerald-500" /> Balanced
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-red-600 max-w-xs font-medium line-clamp-2" title={course.skills_gap}>
                            {course.skills_gap || "None identified"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Page {page} of {totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
