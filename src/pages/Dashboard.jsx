import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAppContext } from '../lib/AppContext';
import { t } from '../lib/i18n';
import api from '../lib/api';
import {
  Building2,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Users,
  MapPin,
  ArrowDownRight,
  ArrowUpRight,
  Lightbulb
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { lang } = useAppContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const mismatchData = [
    { name: t(lang, 'undersupply'), value: stats?.undersupply_courses || 0 },
    { name: t(lang, 'oversupply'), value: stats?.oversupply_courses || 0 },
    { name: 'Balanced', value: (stats?.total_courses || 0) - (stats?.undersupply_courses || 0) - (stats?.oversupply_courses || 0) }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t(lang, 'totalITIs')}
            value={stats?.total_itis || 0}
            icon={<Building2 size={24} className="text-blue-600" />}
          />
          <StatCard
            title={t(lang, 'totalCourses')}
            value={stats?.total_courses || 0}
            icon={<GraduationCap size={24} className="text-green-600" />}
          />
          <StatCard
            title={t(lang, 'totalJobs')}
            value={stats?.total_jobs || 0}
            icon={<Briefcase size={24} className="text-purple-600" />}
          />
          <StatCard
            title={t(lang, 'avgPlacement')}
            value={`${(stats?.avg_placement_rate || 0).toFixed(1)}%`}
            icon={<TrendingUp size={24} className="text-yellow-600" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center">
             <div className="p-3 rounded-full bg-blue-50 mr-4">
               <Users className="text-blue-600" size={20} />
             </div>
             <div>
               <p className="text-sm text-gray-500 font-medium">{t(lang, 'totalSeats')}</p>
               <p className="text-xl font-bold text-gray-900">{(stats?.total_seats || 0).toLocaleString()}</p>
             </div>
           </div>

           <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center">
             <div className="p-3 rounded-full bg-orange-50 mr-4">
               <MapPin className="text-orange-600" size={20} />
             </div>
             <div>
               <p className="text-sm text-gray-500 font-medium">{t(lang, 'districts')}</p>
               <p className="text-xl font-bold text-gray-900">{stats?.districts_covered || stats?.total_districts || 0}</p>
             </div>
           </div>

           <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center">
             <div className="p-3 rounded-full bg-green-50 mr-4">
               <Lightbulb className="text-green-600" size={20} />
             </div>
             <div>
               <p className="text-sm text-gray-500 font-medium">{t(lang, 'emergingJobs')}</p>
               <p className="text-xl font-bold text-gray-900">{stats?.emerging_jobs}</p>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t(lang, 'mismatch')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mismatchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {mismatchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center text-sm">
                <ArrowUpRight className="text-blue-500 mr-1" size={16} />
                <span className="text-gray-600">{stats?.undersupply_courses} {t(lang, 'expand')}</span>
              </div>
              <div className="flex items-center text-sm">
                <ArrowDownRight className="text-orange-500 mr-1" size={16} />
                <span className="text-gray-600">{stats?.oversupply_courses} {t(lang, 'review')}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg shadow text-white">
            <h3 className="text-lg font-semibold mb-2">Welcome to SkillSync</h3>
            <p className="text-blue-100 text-sm mb-6 max-w-md">
              A comprehensive intelligence platform bridging the gap between ITI skill development programs and emerging industry requirements across Maharashtra.
            </p>

            <div className="space-y-4">
              <div className="bg-blue-800/50 p-4 rounded-md border border-blue-700/50">
                <h4 className="font-medium text-yellow-400 mb-1">For Government Administrators</h4>
                <p className="text-sm text-blue-100">Access district-wise training plans and resource allocation recommendations based on real-time market data.</p>
              </div>

              <div className="bg-blue-800/50 p-4 rounded-md border border-blue-700/50">
                <h4 className="font-medium text-green-400 mb-1">For Training Institutes</h4>
                <p className="text-sm text-blue-100">Review curriculum alignment scores and identify priority skills to improve placement rates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
}
