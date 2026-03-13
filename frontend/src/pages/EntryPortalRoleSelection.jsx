import React from 'react';
import { Link } from 'react-router-dom';

const EntryPortalRoleSelection = () => {
  return (
    <>
      
<div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
<div className="layout-container flex h-full grow flex-col">
<header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-20 py-4 sticky top-0 z-50">
<div className="flex items-center gap-3">
<div className="flex items-center justify-center bg-primary text-white p-1.5 rounded-lg">
<span className="material-symbols-outlined text-2xl">eco</span>
</div>
<div className="flex flex-col">
<h2 className="text-primary text-xl font-black leading-none tracking-tight">PARIVESH 3.0</h2>
<span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Govt of India</span>
</div>
</div>
<div className="flex items-center gap-4">
<button className="flex items-center justify-center rounded-full h-10 w-10 bg-primary/5 hover:bg-primary/10 text-slate-700 dark:text-slate-300 transition-colors">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="flex items-center justify-center rounded-full h-10 w-10 bg-primary/5 hover:bg-primary/10 text-slate-700 dark:text-slate-300 transition-colors">
<span className="material-symbols-outlined">help</span>
</button>
<div className="h-8 w-[1px] bg-primary/10 mx-2"></div>
<button className="flex items-center gap-2 px-4 h-10 bg-primary text-white rounded-lg font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20">
<span>Sign In</span>
<span className="material-symbols-outlined text-sm">login</span>
</button>
</div>
</header>
<main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20">
<div className="max-w-[1200px] w-full text-center mb-16">
<h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Single Window Integrated <br />
<span className="text-primary">Environmental Management</span>
</h1>
<p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-3xl mx-auto font-medium">
                        Streamlined, transparent, and efficient clearance process for environmental, forest, wildlife, and CRZ clearances.
                    </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] w-full">
<div className="group relative flex flex-col bg-white dark:bg-slate-900 border border-primary/10 rounded-xl p-8 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
<div className="absolute top-0 right-0 p-4">
<span className="text-[10px] font-bold px-2 py-1 bg-accent-blue/10 text-accent-blue rounded-full uppercase tracking-tighter">Public</span>
</div>
<div className="size-16 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-4xl">person_pin</span>
</div>
<h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Project Proponent / RQP Portal</h3>
<p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            Access the public portal for online submission of proposals, tracking application status, and managing regulatory documents.
                        </p>
<div className="mt-auto">
<Link to="/pp/dashboard" className="w-full py-3 bg-slate-900 dark:bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-2 group-hover:bg-primary transition-colors">
                                Access Portal
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
</Link>
</div>
</div>
<div className="group relative flex flex-col bg-white dark:bg-slate-900 border border-primary/10 rounded-xl p-8 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
<div className="absolute top-0 right-0 p-4">
<span className="text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-tighter">Internal</span>
</div>
<div className="size-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
</div>
<h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Admin Portal</h3>
<p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            Centralized dashboard for system administrators to manage user access, configure workflows, and oversee system health.
                        </p>
<div className="mt-auto">
<Link to="/admin/dashboard" className="w-full py-3 bg-slate-900 dark:bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-2 group-hover:bg-primary transition-colors">
                                Admin Login
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
</Link>
</div>
</div>
<div className="group relative flex flex-col bg-white dark:bg-slate-900 border border-primary/10 rounded-xl p-8 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
<div className="absolute top-0 right-0 p-4">
<span className="text-[10px] font-bold px-2 py-1 bg-accent-green/10 text-accent-green rounded-full uppercase tracking-tighter">Internal</span>
</div>
<div className="size-16 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-4xl">groups</span>
</div>
<h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Committee Portal</h3>
<p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            Dedicated workspace for Committee Members for application scrutiny, conducting meetings, and drafting Minutes of Meeting.
                        </p>
<div className="mt-auto">
<Link to="/committee/scrutiny" className="w-full py-3 bg-slate-900 dark:bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-2 group-hover:bg-primary transition-colors">
                                Committee Access
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
</Link>
</div>
</div>
</div>
<div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-[1000px] w-full text-center">
<div className="flex flex-col gap-2 p-6 border-r border-primary/5">
<span className="text-3xl font-black text-primary">150k+</span>
<span className="text-xs font-bold uppercase tracking-wider opacity-60">Proposals Managed</span>
</div>
<div className="flex flex-col gap-2 p-6 border-r border-primary/5">
<span className="text-3xl font-black text-accent-green">98%</span>
<span className="text-xs font-bold uppercase tracking-wider opacity-60">Digital Accuracy</span>
</div>
<div className="flex flex-col gap-2 p-6 border-r border-primary/5">
<span className="text-3xl font-black text-accent-blue">24/7</span>
<span className="text-xs font-bold uppercase tracking-wider opacity-60">Monitoring</span>
</div>
<div className="flex flex-col gap-2 p-6">
<span className="text-3xl font-black text-slate-400">0%</span>
<span className="text-xs font-bold uppercase tracking-wider opacity-60">Paper Waste</span>
</div>
</div>
</main>
<footer className="mt-auto px-6 md:px-20 py-10 bg-white dark:bg-slate-900 border-t border-primary/5">
<div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
<div className="flex flex-col">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-primary text-xl">account_balance</span>
<span className="text-sm font-bold text-slate-900 dark:text-white">Ministry of Environment, Forest and Climate Change</span>
</div>
<p className="text-xs text-slate-500 dark:text-slate-400">© 2024 Government of India. All rights reserved. Designed for Environmental Sustainability.</p>
</div>
<div className="flex gap-8">
<a className="text-xs font-bold text-slate-500 hover:text-primary transition-colors" href="#">Security Policy</a>
<a className="text-xs font-bold text-slate-500 hover:text-primary transition-colors" href="#">Privacy Policy</a>
<a className="text-xs font-bold text-slate-500 hover:text-primary transition-colors" href="#">Accessibility</a>
<a className="text-xs font-bold text-slate-500 hover:text-primary transition-colors" href="#">Contact Us</a>
</div>
</div>
</footer>
</div>
</div>

    </>
  );
};

export default EntryPortalRoleSelection;
