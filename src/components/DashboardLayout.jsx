import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  AlertTriangle,
  BarChart2,
  Lightbulb,
  GraduationCap,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { t } from '../lib/i18n';

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const pathname = location.pathname;
  const { lang, setLang, user, logout } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: t(lang, 'dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t(lang, 'courses'), href: '/courses', icon: BookOpen },
    { name: t(lang, 'jobs'), href: '/jobs', icon: Briefcase },
    { name: t(lang, 'skillGap'), href: '/skill-gap', icon: AlertTriangle },
    { name: t(lang, 'mismatch'), href: '/mismatch', icon: BarChart2 },
    { name: t(lang, 'recommendations'), href: '/recommendations', icon: Lightbulb },
    { name: t(lang, 'trainingPlan'), href: '/training-plan', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden bg-blue-900 text-white p-4 flex justify-between items-center">
        <span className="font-bold text-xl">{t(lang, 'appName')}</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-slate-900 text-white min-h-screen shadow-xl flex-shrink-0 z-10 transition-all duration-300`}>
        <div className="p-6 hidden md:block border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
              SS
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">{t(lang, 'appName')}</h1>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-2.5 leading-relaxed font-medium">{t(lang, 'tagline')}</p>
        </div>

        <nav className="mt-6 md:mt-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
              {navigation.find(n => n.href === pathname)?.name || t(lang, 'dashboard')}
            </h2>

            <div className="flex items-center space-x-4 ml-auto">
              {/* Language Selector */}
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 text-xs font-medium rounded-sm ${lang === 'en' ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('mr')}
                  className={`px-3 py-1 text-xs font-medium rounded-sm ${lang === 'mr' ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLang('hi')}
                  className={`px-3 py-1 text-xs font-medium rounded-sm ${lang === 'hi' ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}
                >
                  हिंदी
                </button>
              </div>

              {/* User Dropdown / Login */}
              {user ? (
                <div className="flex items-center space-x-3 border-l pl-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <User size={16} />
                  </div>
                  <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="border-l pl-4">
                  <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    {t(lang, 'login')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
