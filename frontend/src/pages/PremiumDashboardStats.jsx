import React from 'react';
import { Link } from 'react-router-dom';

const PremiumDashboardStats = () => {
  return (
    <>
      
<div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
<div className="layout-container flex h-full grow flex-col">
<header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 py-4 lg:px-20 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
<div className="flex items-center gap-8">
<Link to="/" className="flex items-center gap-3 text-primary">
<div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
<span className="material-symbols-outlined">account_balance</span>
</div>
<h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">GovPortal</h2>
</Link>
<nav className="hidden md:flex items-center gap-8">
<Link className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" to="/admin/dashboard">Overview</Link>
<Link className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" to="/pp/applications">Applications</Link>
<Link className="text-primary text-sm font-semibold border-b-2 border-primary pb-1" to="/admin/stats">Reports</Link>
<Link className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" to="/admin/dashboard">Users</Link>
</nav>
</div>
<div className="flex items-center gap-4">
<label className="hidden lg:flex flex-col min-w-40 h-10 max-w-64">
<div className="flex w-full flex-1 items-stretch rounded-xl h-full">
<div className="text-slate-400 flex border-none bg-slate-100 dark:bg-slate-800 items-center justify-center pl-4 rounded-l-xl">
<span className="material-symbols-outlined text-xl">search</span>
</div>
<input className="form-input flex w-full min-w-0 flex-1 border-none bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-0 h-full placeholder:text-slate-400 px-4 rounded-r-xl text-sm font-normal" placeholder="Search data..."/>
</div>
</label>
<div className="flex gap-2">
<button className="flex items-center justify-center rounded-xl size-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
<span className="material-symbols-outlined">notifications</span>
</button>
<div className="h-10 w-10 rounded-full border-2 border-primary/20 p-0.5">
<img alt="User Profile" className="rounded-full w-full h-full object-cover" data-alt="User profile avatar illustration" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-Sogi-zu-OjZH36JFDhx7bUyOLSZaPGlvGI2LLdGoohERSzIDrTROwWFjWHP8kUQhWtFvBF1NqKSJDSqUNa8g3cY1GMY4aElYY6FFGfostZmus4tNtWTf7oWjrgdSKpd1LGhj7vUbnFlWi9dVW9w9A7PzjohOO5Ipios4tWfHZU6D0JkhkSqbqXTuDISZ1mQ93_F39etYEhB5TYp15Vtr25k2KRjB9kEdGY7pp4lVeqP2Evw8A7Hr2JYAJVqe26Il1C-bo_pVKQ"/>
</div>
</div>
</div>
</header>
<main className="flex-1 px-6 py-10 lg:px-20 max-w-[1440px] mx-auto w-full">
<div className="mb-10 flex flex-col gap-2">
<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Portal Insights</h1>
<p className="text-slate-500 dark:text-slate-400 max-w-2xl">Premium real-time analytics for state-level application processing and citizen engagement metrics.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
<div className="glass-card rounded-xl p-6 flex flex-col relative overflow-hidden group">
<div className="flex justify-between items-start mb-4">
<div className="flex flex-col">
<span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Applications</span>
<span className="text-[2.5rem] font-black text-slate-900 dark:text-slate-100 leading-none mt-1">12,842</span>
</div>
<div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500 group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined !text-4xl">description</span>
</div>
</div>
<div className="flex items-center gap-2 mb-6">
<span className="flex items-center text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
<span className="material-symbols-outlined !text-sm">trending_up</span> +12.5%
                            </span>
<span className="text-xs text-slate-400">vs last month</span>
</div>
<div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
<svg className="w-full h-12" preserveaspectratio="none" viewBox="0 0 100 40">
<path d="M0 35 Q 10 25, 20 30 T 40 20 T 60 25 T 80 10 T 100 15" fill="none" stroke="#3b82f6" strokeLinecap="round" strokeWidth="2"></path>
<path d="M0 35 Q 10 25, 20 30 T 40 20 T 60 25 T 80 10 T 100 15 V 40 H 0 Z" fill="url(#grad-blue)" opacity="0.1"></path>
<defs>
<lineargradient id="grad-blue" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: '1' }}></stop>
<stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: '0' }}></stop>
</lineargradient>
</defs>
</svg>
</div>
</div>
<div className="glass-card rounded-xl p-6 flex flex-col relative overflow-hidden group">
<div className="flex justify-between items-start mb-4">
<div className="flex flex-col">
<span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Under Scrutiny</span>
<span className="text-[2.5rem] font-black text-slate-900 dark:text-slate-100 leading-none mt-1">3,450</span>
</div>
<div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-500 group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined !text-4xl">search</span>
</div>
</div>
<div className="flex items-center gap-2 mb-6">
<span className="flex items-center text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
<span className="material-symbols-outlined !text-sm">schedule</span> Ongoing
                            </span>
<span className="text-xs text-slate-400">24h average</span>
</div>
<div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
<svg className="w-full h-12" preserveaspectratio="none" viewBox="0 0 100 40">
<path d="M0 25 Q 15 28, 30 22 T 50 25 T 75 20 T 100 28" fill="none" stroke="#f59e0b" strokeLinecap="round" strokeWidth="2"></path>
<path d="M0 25 Q 15 28, 30 22 T 50 25 T 75 20 T 100 28 V 40 H 0 Z" fill="url(#grad-amber)" opacity="0.1"></path>
<defs>
<lineargradient id="grad-amber" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: '1' }}></stop>
<stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: '0' }}></stop>
</lineargradient>
</defs>
</svg>
</div>
</div>
<div className="glass-card rounded-xl p-6 flex flex-col relative overflow-hidden group">
<div className="flex justify-between items-start mb-4">
<div className="flex flex-col">
<span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">EDS Raised</span>
<span className="text-[2.5rem] font-black text-slate-900 dark:text-slate-100 leading-none mt-1">892</span>
</div>
<div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined !text-4xl">warning</span>
</div>
</div>
<div className="flex items-center gap-2 mb-6">
<span className="flex items-center text-xs font-bold px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
<span className="material-symbols-outlined !text-sm">trending_down</span> -2.1%
                            </span>
<span className="text-xs text-slate-400">Action required</span>
</div>
<div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
<svg className="w-full h-12" preserveaspectratio="none" viewBox="0 0 100 40">
<path d="M0 15 Q 15 25, 30 18 T 50 30 T 75 15 T 100 35" fill="none" stroke="#ef4444" strokeLinecap="round" strokeWidth="2"></path>
<path d="M0 15 Q 15 25, 30 18 T 50 30 T 75 15 T 100 35 V 40 H 0 Z" fill="url(#grad-red)" opacity="0.1"></path>
<defs>
<lineargradient id="grad-red" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: '1' }}></stop>
<stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: '0' }}></stop>
</lineargradient>
</defs>
</svg>
</div>
</div>
<div className="glass-card rounded-xl p-6 flex flex-col relative overflow-hidden group">
<div className="flex justify-between items-start mb-4">
<div className="flex flex-col">
<span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Finalized This Month</span>
<span className="text-[2.5rem] font-black text-slate-900 dark:text-slate-100 leading-none mt-1">5,671</span>
</div>
<div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform duration-300">
<span className="material-symbols-outlined !text-4xl">check_circle</span>
</div>
</div>
<div className="flex items-center gap-2 mb-6">
<span className="flex items-center text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
<span className="material-symbols-outlined !text-sm">verified</span> +18.4%
                            </span>
<span className="text-xs text-slate-400">Target hit</span>
</div>
<div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
<svg className="w-full h-12" preserveaspectratio="none" viewBox="0 0 100 40">
<path d="M0 35 L 20 28 L 40 32 L 60 18 L 80 22 L 100 5" fill="none" stroke="#10b981" strokeLinecap="round" strokeWidth="2"></path>
<path d="M0 35 L 20 28 L 40 32 L 60 18 L 80 22 L 100 5 V 40 H 0 Z" fill="url(#grad-green)" opacity="0.1"></path>
<defs>
<lineargradient id="grad-green" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: '1' }}></stop>
<stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: '0' }}></stop>
</lineargradient>
</defs>
</svg>
</div>
</div>
</div>
<div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
<div className="lg:col-span-2 glass-card rounded-xl p-8">
<div className="flex justify-between items-center mb-8">
<div>
<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Application Volume Trend</h3>
<p className="text-sm text-slate-500">Historical data for the current fiscal quarter</p>
</div>
<div className="flex gap-2">
<button className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg">30 Days</button>
<button className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-colors">90 Days</button>
</div>
</div>
<div className="h-64 w-full bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800 relative flex items-center justify-center overflow-hidden">
<svg className="w-full h-full p-4" preserveaspectratio="none" viewBox="0 0 800 200">
<path d="M0 180 Q 50 160, 100 170 T 200 120 T 300 140 T 400 90 T 500 100 T 600 60 T 700 80 T 800 40" fill="none" stroke="#17cf6d" strokeLinecap="round" strokeWidth="4"></path>
<path d="M0 180 Q 50 160, 100 170 T 200 120 T 300 140 T 400 90 T 500 100 T 600 60 T 700 80 T 800 40 V 200 H 0 Z" fill="url(#main-chart-grad)" opacity="0.1"></path>
<defs>
<lineargradient id="main-chart-grad" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" style={{ stopColor: '#17cf6d', stopOpacity: '1' }}></stop>
<stop offset="100%" style={{ stopColor: '#17cf6d', stopOpacity: '0' }}></stop>
</lineargradient>
</defs>
</svg>
</div>
<div className="flex justify-between mt-4 px-2">
<span className="text-xs font-medium text-slate-400 uppercase">April</span>
<span className="text-xs font-medium text-slate-400 uppercase">May</span>
<span className="text-xs font-medium text-slate-400 uppercase">June</span>
</div>
</div>
<div className="glass-card rounded-xl p-8">
<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Recent Activity</h3>
<div className="space-y-6">
<div className="flex gap-4">
<div className="size-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
<span className="material-symbols-outlined !text-xl">add_circle</span>
</div>
<div className="flex flex-col">
<p className="text-sm font-bold text-slate-800 dark:text-slate-200">New Grant Application</p>
<p className="text-xs text-slate-500">2 minutes ago • #APP-2940</p>
</div>
</div>
<div className="flex gap-4">
<div className="size-10 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
<span className="material-symbols-outlined !text-xl">task_alt</span>
</div>
<div className="flex flex-col">
<p className="text-sm font-bold text-slate-800 dark:text-slate-200">License Approved</p>
<p className="text-xs text-slate-500">14 minutes ago • #LIC-0882</p>
</div>
</div>
<div className="flex gap-4">
<div className="size-10 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
<span className="material-symbols-outlined !text-xl">edit_note</span>
</div>
<div className="flex flex-col">
<p className="text-sm font-bold text-slate-800 dark:text-slate-200">EDS Response Received</p>
<p className="text-xs text-slate-500">42 minutes ago • #EDS-5512</p>
</div>
</div>
<div className="flex gap-4">
<div className="size-10 shrink-0 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
<span className="material-symbols-outlined !text-xl">report</span>
</div>
<div className="flex flex-col">
<p className="text-sm font-bold text-slate-800 dark:text-slate-200">Document Rejection</p>
<p className="text-xs text-slate-500">1 hour ago • #APP-2910</p>
</div>
</div>
</div>
<button className="w-full mt-8 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">View Full Audit Log</button>
</div>
</div>
</main>
<footer className="mt-20 border-t border-slate-200 dark:border-slate-800 px-6 py-10 lg:px-20 bg-white dark:bg-background-dark">
<div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
<div className="flex items-center gap-2 text-slate-400">
<span className="material-symbols-outlined !text-xl">verified_user</span>
<span className="text-xs font-medium uppercase tracking-widest">Official Government Portal Dashboard © 2024</span>
</div>
<div className="flex gap-8">
<a className="text-xs font-bold text-slate-400 hover:text-primary transition-colors" href="#">Privacy Policy</a>
<a className="text-xs font-bold text-slate-400 hover:text-primary transition-colors" href="#">Terms of Use</a>
<a className="text-xs font-bold text-slate-400 hover:text-primary transition-colors" href="#">Compliance</a>
</div>
</div>
</footer>
</div>
</div>

    </>
  );
};

export default PremiumDashboardStats;
