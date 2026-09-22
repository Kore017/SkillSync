import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAppContext } from '../lib/AppContext';
import { t } from '../lib/i18n';
import api from '../lib/api';
import { Search, Briefcase, ChevronLeft, ChevronRight, MapPin, RotateCcw } from 'lucide-react';

export default function Jobs() {
  const { lang } = useAppContext();
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [trend, setTrend] = useState('');

  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    api.get('/api/courses/districts').then(res => setDistricts(res.data)).catch(console.error);
    api.get('/api/jobs/sectors').then(res => setSectors(res.data)).catch(console.error);
    api.get('/api/jobs/trends').then(res => setTrends(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, page, district, sector, trend]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.skills = search;
      if (district) params.district = district;
      if (sector) params.sector = sector;
      if (trend) params.trend = trend;

      const res = await api.get('/api/jobs/', { params });
      setJobs(res.data.data || []);
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
    setTrend('');
    setPage(1);
  };

  const hasActiveFilters = search || district || sector || trend;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t(lang, 'jobs')}</h1>
            <p className="text-sm text-gray-500">
              Showing {jobs.length} of {totalCount} live industrial job postings across Maharashtra
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
              placeholder="Search by required micro-skill (e.g. Python, CNC, Cobot, Welding)..."
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
              value={trend}
              onChange={(e) => { setTrend(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Trends</option>
              {trends.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-2"></div>
              <p className="text-sm">{t(lang, 'loading')}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              <p className="text-base font-medium text-gray-700">{t(lang, 'noData')}</p>
              <p className="text-xs text-gray-400 mt-1">Try modifying your search or clearing active filters</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-base">{job.job_title}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      job.demand_trend === 'Emerging' ? 'bg-green-100 text-green-800' :
                      job.demand_trend === 'Declining' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {job.demand_trend}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 gap-3 mb-4">
                    <span className="flex items-center"><MapPin size={13} className="mr-1 text-slate-400" /> {job.district}</span>
                    <span className="flex items-center"><Briefcase size={13} className="mr-1 text-slate-400" /> {job.sector}</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">NSQF {job.nsqf_level}</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Required Micro-Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.required_micro_skills.split(';').map((skill, idx) => (
                        <span key={idx} className="bg-slate-50 text-slate-700 text-xs px-2 py-0.5 rounded border border-slate-200/60 font-medium">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm">
                  <span className="text-blue-900 font-bold">
                    ₹{job.min_salary.toLocaleString()} - ₹{job.max_salary.toLocaleString()} <span className="text-xs font-normal text-gray-500">/mo</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    Source: {job.posting_source}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
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
    </DashboardLayout>
  );
}
