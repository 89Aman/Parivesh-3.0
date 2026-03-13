import React from 'react';
import { Link } from 'react-router-dom';

const PremiumDarkSidebar = () => {
  return (
    <>
      
<div className="flex h-screen overflow-hidden">

<aside className="w-[260px] bg-sidebar-dark border-r border-emerald-900/30 flex flex-col h-full relative z-50">

<div className="p-6 flex flex-col gap-6">
<Link to="/" className="flex items-center gap-3">
<div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-2xl">eco</span>
</div>
<div className="flex flex-col">
<h1 className="text-white text-lg font-bold tracking-tight leading-tight">PARIVESH 3.0</h1>
<p className="text-emerald-500/70 text-[10px] uppercase font-bold tracking-widest">Environment Clearance</p>
</div>
</Link>

<div className="flex items-center gap-3 px-2 py-3 bg-white/5 rounded-lg border border-white/10">
<div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1 overflow-hidden">
<img alt="State Emblem of India" className="w-full h-full object-contain" data-alt="Official State Emblem of India gold icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOiAxlT367H8V6aiAwrRDlx52wPMHze3z8d9Mr1z06lTxxYRLnNfEscn4X-w9KDwVbDwSmtbNwfNATN1Tvud8RJ-LvS0qB-Lj2WljDhclH-_6jQGF0D_CZYPj6G4D-f1pFZ6ARWA4SmUPcF7Owc1jkodYLz5k1nqgaJ99givM1uRIuZlaAIrf2po5PabrQsuV2QXxj23lYQHoYjHravjBT3hlYACuIE6ngASvC0Nkgc2IbVPObpu8pnBx8ojUTS57_V0WgKUoy9w"/>
</div>
<div className="flex flex-col">
<span className="text-white/90 text-[11px] font-semibold leading-none">Ministry of Environment,</span>
<span className="text-white/60 text-[10px] leading-tight">Forest &amp; Climate Change</span>
</div>
</div>
</div>

<nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">

<div className="relative group">
<div className="active-nav-indicator"></div>
<Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white font-medium transition-all" to="/admin/sidebar">
<span className="material-symbols-outlined fill-1">dashboard</span>
<span className="text-sm">Dashboard</span>
</Link>
</div>

<Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100/70 hover:bg-white/5 hover:text-white transition-all group" to="/pp/applications">
<span className="material-symbols-outlined text-emerald-500 group-hover:text-primary transition-colors">description</span>
<span className="text-sm font-medium">Proposals</span>
<span className="ml-auto bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-bold">12</span>
</Link>

<Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100/70 hover:bg-white/5 hover:text-white transition-all group" to="/committee/scrutiny">
<span className="material-symbols-outlined text-emerald-500 group-hover:text-primary transition-colors">verified</span>
<span className="text-sm font-medium">Clearances</span>
</Link>

<Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100/70 hover:bg-white/5 hover:text-white transition-all group" to="/admin/dashboard">
<span className="material-symbols-outlined text-emerald-500 group-hover:text-primary transition-colors">gavel</span>
<span className="text-sm font-medium">Compliance</span>
</Link>

<Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100/70 hover:bg-white/5 hover:text-white transition-all group" to="/admin/stats">
<span className="material-symbols-outlined text-emerald-500 group-hover:text-primary transition-colors">bar_chart_4_bars</span>
<span className="text-sm font-medium">Reports</span>
</Link>

<Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100/70 hover:bg-white/5 hover:text-white transition-all group" to="/pp/workflow">
<span className="material-symbols-outlined text-emerald-500 group-hover:text-primary transition-colors">pie_chart</span>
<span className="text-sm font-medium">Analytics</span>
</Link>
</nav>

<div className="mt-auto p-4 border-t border-emerald-900/30 flex flex-col gap-1">
<Link to="/pp/new-application" className="w-full mb-4 py-3 px-4 bg-primary text-background-dark font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/10">
<span className="material-symbols-outlined text-[20px]">add_circle</span>
                    New Proposal
                </Link>
<a className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-emerald-100/50 hover:bg-white/5 hover:text-white transition-all group" href="#">
<span className="material-symbols-outlined text-lg">help</span>
<span className="text-sm font-medium">Help Support</span>
</a>
<a className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-emerald-100/50 hover:bg-white/5 hover:text-white transition-all group" href="#">
<span className="material-symbols-outlined text-lg">settings</span>
<span className="text-sm font-medium">Settings</span>
</a>
<Link className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-emerald-100/50 hover:bg-accent-red/10 hover:text-accent-red transition-all group mt-2" to="/">
<span className="material-symbols-outlined text-lg">logout</span>
<span className="text-sm font-medium">Logout</span>
</Link>
</div>

<div className="px-4 pb-6">
<div className="flex items-center gap-3 p-3 bg-emerald-950/40 border border-emerald-800/30 rounded-xl">
<div className="w-10 h-10 rounded-full bg-emerald-800 border-2 border-primary/30 flex-shrink-0" data-alt="User profile photo avatar" style={{ backgroundImage: 'url("https', backgroundSize: 'cover' }}></div>
<div className="flex flex-col min-w-0">
<span className="text-white text-xs font-bold truncate">Dr. Rajesh Kumar</span>
<span className="text-emerald-500/60 text-[10px] font-medium truncate">Nodal Officer</span>
</div>
</div>
</div>
</aside>

<main className="flex-1 bg-background-light dark:bg-background-dark overflow-y-auto p-8">
<header className="flex justify-between items-center mb-10">
<div>
<h2 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
<p className="text-slate-500 dark:text-emerald-500/60 font-medium">Welcome back, Dr. Rajesh</p>
</div>
<div className="flex gap-4">
<div className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-emerald-900/30 rounded-lg text-slate-600 dark:text-emerald-500">
<span className="material-symbols-outlined">notifications</span>
</div>
<div className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-emerald-900/30 rounded-lg text-slate-600 dark:text-emerald-500">
<span className="material-symbols-outlined">calendar_today</span>
</div>
</div>
</header>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-emerald-900/20">
<p className="text-slate-500 dark:text-emerald-500/50 text-xs font-bold uppercase tracking-wider mb-2">Total Proposals</p>
<h3 className="text-3xl font-bold dark:text-white">1,284</h3>
<div className="mt-4 flex items-center gap-1 text-primary text-xs font-bold">
<span className="material-symbols-outlined text-sm">trending_up</span>
<span>+12.5% vs last month</span>
</div>
</div>
<div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-emerald-900/20">
<p className="text-slate-500 dark:text-emerald-500/50 text-xs font-bold uppercase tracking-wider mb-2">Pending Approval</p>
<h3 className="text-3xl font-bold dark:text-white">432</h3>
<div className="mt-4 flex items-center gap-1 text-orange-500 text-xs font-bold">
<span className="material-symbols-outlined text-sm">pending_actions</span>
<span>Requires immediate action</span>
</div>
</div>
<div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-emerald-900/20">
<p className="text-slate-500 dark:text-emerald-500/50 text-xs font-bold uppercase tracking-wider mb-2">Clearances Issued</p>
<h3 className="text-3xl font-bold dark:text-white">812</h3>
<div className="mt-4 flex items-center gap-1 text-primary text-xs font-bold">
<span className="material-symbols-outlined text-sm">verified</span>
<span>98% success rate</span>
</div>
</div>
<div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-emerald-900/20">
<p className="text-slate-500 dark:text-emerald-500/50 text-xs font-bold uppercase tracking-wider mb-2">Compliance Rate</p>
<h3 className="text-3xl font-bold dark:text-white">94%</h3>
<div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
<div className="w-full bg-emerald-900/30 h-1.5 rounded-full overflow-hidden">
<div className="bg-primary h-full w-[94%]"></div>
</div>
</div>
</div>
</div>

<div className="bg-white dark:bg-white/5 p-8 rounded-2xl border border-slate-100 dark:border-emerald-900/20 min-h-[400px] flex items-center justify-center relative overflow-hidden">
<div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
<div className="text-center z-10">
<span className="material-symbols-outlined text-primary text-6xl mb-4">analytics</span>
<h4 className="text-xl font-bold dark:text-white mb-2">Environmental Impact Analysis</h4>
<p className="text-slate-500 dark:text-emerald-500/50 max-w-md">Regional analysis of forest diversion proposals and ecological compensation tracking.</p>
</div>
</div>
</main>
</div>

    </>
  );
};

export default PremiumDarkSidebar;
