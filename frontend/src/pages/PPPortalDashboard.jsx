import React from 'react';
import { Link } from 'react-router-dom';

const PPPortalDashboard = () => {
  return (
    <>
      
<div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
<div className="layout-container flex h-full grow flex-col">

<header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 lg:px-40 py-4 bg-white dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
<div className="flex items-center gap-8">
<Link to="/" className="flex items-center gap-3 text-primary">
<div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
<span className="material-symbols-outlined text-2xl">eco</span>
</div>
<h2 className="text-slate-900 dark:text-slate-100 text-xl font-black leading-tight tracking-tight">PARIVESH 3.0</h2>
</Link>
<nav className="hidden md:flex items-center gap-8">
<Link className="text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-1" to="/pp/dashboard">Dashboard</Link>
<Link className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors" to="/pp/applications">Applications</Link>
<a className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Reports</a>
<a className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Support</a>
</nav>
</div>
<div className="flex flex-1 justify-end gap-4 lg:gap-6">
<label className="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
<div className="flex w-full flex-1 items-stretch rounded-lg overflow-hidden border border-primary/20">
<div className="text-primary flex bg-primary/5 items-center justify-center px-3">
<span className="material-symbols-outlined text-xl">search</span>
</div>
<input className="form-input flex w-full min-w-0 flex-1 border-none bg-primary/5 focus:ring-0 text-sm font-normal placeholder:text-slate-400" placeholder="Search application ID..." value=""/>
</div>
</label>
<div className="flex gap-2">
<button className="flex items-center justify-center rounded-lg size-10 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="flex items-center justify-center rounded-lg size-10 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
<span className="material-symbols-outlined">help_outline</span>
</button>
</div>
<div className="flex items-center gap-3 pl-4 border-l border-primary/10">
<div className="hidden lg:block text-right">
<p className="text-xs font-bold text-slate-900 dark:text-slate-100">Vikram Singh</p>
<p className="text-[10px] text-slate-500">Project Proponent</p>
</div>
<div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20 shadow-sm" data-alt="User profile picture of Vikram Singh" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB262ixWNhZrBauhYTR-A_rNh2zoKJQ5b4N_vz38EDGzNR9D5TixHWQhxgPyenOEnzerQ7s-cN6UrskGUK-JYwA5I_saaXVUneATn6l9uXVjIwsuY5Bul2J1wpSuvDvmlFon4TqyaeFkkn8GMb-kdrdPQToNiDPCaLwPob87jSA3OO_ZlXs4NYuwIRTgOevirCPmRoycfr5i7snZ2j9Wr1Qk_t3aBbnS3j5YLXdMbOYSmGfu4C7UvETIzTm0Ux2nO9usebYZJGU4Y4")' }}></div>
</div>
</div>
</header>
<main className="flex-1 px-4 lg:px-40 py-8">

<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
<div className="flex flex-col gap-1">
<h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-tight">Welcome, Vikram Singh</h1>
<p className="text-slate-500 dark:text-slate-400 text-base font-normal">Track your Environmental Clearance (EC) lifecycle and compliance from one place.</p>
</div>
<Link to="/pp/new-application" className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
<span className="material-symbols-outlined text-xl">add_circle</span>
<span className="text-sm font-bold tracking-wide uppercase">New Application</span>
</Link>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
<div className="bg-white dark:bg-background-dark/40 p-5 rounded-xl border border-primary/5 flex flex-col gap-2">
<span className="text-primary material-symbols-outlined text-3xl">list_alt</span>
<p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Applications</p>
<h3 className="text-2xl font-black">24</h3>
</div>
<div className="bg-white dark:bg-background-dark/40 p-5 rounded-xl border border-primary/5 flex flex-col gap-2">
<span className="text-amber-500 material-symbols-outlined text-3xl">pending_actions</span>
<p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending EDS</p>
<h3 className="text-2xl font-black">03</h3>
</div>
<div className="bg-white dark:bg-background-dark/40 p-5 rounded-xl border border-primary/5 flex flex-col gap-2">
<span className="text-emerald-500 material-symbols-outlined text-3xl">check_circle</span>
<p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Approved</p>
<h3 className="text-2xl font-black">18</h3>
</div>
<div className="bg-white dark:bg-background-dark/40 p-5 rounded-xl border border-primary/5 flex flex-col gap-2">
<span className="text-slate-400 material-symbols-outlined text-3xl">draft</span>
<p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Drafts</p>
<h3 className="text-2xl font-black">03</h3>
</div>
</div>

<div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 overflow-hidden shadow-sm">
<div className="px-6 pt-6 pb-2">
<div className="flex items-center justify-between mb-4">
<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Environmental Clearance Applications</h2>
<div className="flex gap-2">
<button className="flex items-center gap-1 text-xs font-bold text-primary px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
<span className="material-symbols-outlined text-sm">filter_list</span> Filter
                                </button>
<button className="flex items-center gap-1 text-xs font-bold text-primary px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
<span className="material-symbols-outlined text-sm">download</span> Export
                                </button>
</div>
</div>
<div className="flex border-b border-primary/10 gap-8">
<a className="border-b-2 border-primary text-primary pb-3 pt-2 text-sm font-bold tracking-wide" href="#">All Applications</a>
<a className="border-b-2 border-transparent text-slate-500 hover:text-primary pb-3 pt-2 text-sm font-medium transition-colors" href="#">Submitted</a>
<a className="border-b-2 border-transparent text-slate-500 hover:text-primary pb-3 pt-2 text-sm font-medium transition-colors" href="#">Pending EDS</a>
<a className="border-b-2 border-transparent text-slate-500 hover:text-primary pb-3 pt-2 text-sm font-medium transition-colors" href="#">Drafts</a>
</div>
</div>
<div className="overflow-x-auto @container">
<table className="w-full text-left">
<thead className="bg-primary/5 border-b border-primary/10">
<tr>
<th className="px-6 py-4 text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Application ID</th>
<th className="px-6 py-4 text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Project Name</th>
<th className="px-6 py-4 text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Category</th>
<th className="px-6 py-4 text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Sector</th>
<th className="px-6 py-4 text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Status</th>
<th className="px-6 py-4 text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-primary/5">
<tr className="hover:bg-primary/[0.02] transition-colors group">
<td className="px-6 py-5 text-sm font-bold text-primary">EC/WB/IND/2023/102</td>
<td className="px-6 py-5">
<p className="text-sm font-bold text-slate-900 dark:text-slate-100">Greenfield Cement Manufacturing</p>
<p className="text-[10px] text-slate-400 uppercase">Unit 3 • Asansol, WB</p>
</td>
<td className="px-6 py-5">
<span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase">Category A</span>
</td>
<td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">Industry-1</td>
<td className="px-6 py-5">
<span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
<span className="size-1.5 rounded-full bg-emerald-500"></span> Approved
                                        </span>
</td>
<td className="px-6 py-5">
<Link to="/pp/review" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-lg">visibility</span> View
                                        </Link>
</td>
</tr>
<tr className="hover:bg-primary/[0.02] transition-colors group">
<td className="px-6 py-5 text-sm font-bold text-primary">EC/OR/MIN/2024/045</td>
<td className="px-6 py-5">
<p className="text-sm font-bold text-slate-900 dark:text-slate-100">Iron Ore Expansion Project</p>
<p className="text-[10px] text-slate-400 uppercase">Block B • Keonjhar, Odisha</p>
</td>
<td className="px-6 py-5">
<span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded uppercase">Category B</span>
</td>
<td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">Mining</td>
<td className="px-6 py-5">
<span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold">
<span className="size-1.5 rounded-full bg-amber-500"></span> Pending EDS
                                        </span>
</td>
<td className="px-6 py-5">
<Link to="/pp/workflow" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-lg">edit_note</span> Respond
                                        </Link>
</td>
</tr>
<tr className="hover:bg-primary/[0.02] transition-colors group">
<td className="px-6 py-5 text-sm font-bold text-primary">EC/KA/INF/2024/210</td>
<td className="px-6 py-5">
<p className="text-sm font-bold text-slate-900 dark:text-slate-100">Tech-Park Infrastructure Dev</p>
<p className="text-[10px] text-slate-400 uppercase">Phase 2 • Bengaluru, KA</p>
</td>
<td className="px-6 py-5">
<span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase">Category A</span>
</td>
<td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">Construction</td>
<td className="px-6 py-5">
<span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
<span className="size-1.5 rounded-full bg-primary"></span> Submitted
                                        </span>
</td>
<td className="px-6 py-5">
<Link to="/pp/workflow" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-lg">visibility</span> Track
                                        </Link>
</td>
</tr>
<tr className="hover:bg-primary/[0.02] transition-colors group">
<td className="px-6 py-5 text-sm font-bold text-primary">EC/GJ/EN/2024/991</td>
<td className="px-6 py-5">
<p className="text-sm font-bold text-slate-900 dark:text-slate-100">50MW Hybrid Wind-Solar Plant</p>
<p className="text-[10px] text-slate-400 uppercase">Site A • Kutch, Gujarat</p>
</td>
<td className="px-6 py-5">
<span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded uppercase">Category B</span>
</td>
<td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">Renewable Energy</td>
<td className="px-6 py-5">
<span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
<span className="size-1.5 rounded-full bg-slate-400"></span> Draft
                                        </span>
</td>
<td className="px-6 py-5">
<Link to="/pp/new-application" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-lg">edit</span> Resume
                                        </Link>
</td>
</tr>
</tbody>
</table>
</div>

<div className="flex items-center justify-between p-6 border-t border-primary/10">
<p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900 dark:text-slate-100">1-4</span> of <span className="font-bold text-slate-900 dark:text-slate-100">24</span> applications</p>
<div className="flex items-center gap-1">
<button className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
<span className="material-symbols-outlined">chevron_left</span>
</button>
<button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">1</button>
<button className="size-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-bold">2</button>
<button className="size-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-bold">3</button>
<button className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
<span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
</div>

<div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="bg-primary p-8 rounded-2xl relative overflow-hidden group">
<div className="relative z-10 flex flex-col gap-4">
<h3 className="text-white text-xl font-black">Need help with your application?</h3>
<p className="text-white/80 text-sm leading-relaxed max-w-sm">Access our comprehensive guide for Environmental Clearance documentation and compliance standards.</p>
<button className="w-fit bg-white text-primary px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide hover:bg-primary-light transition-colors">View Guidelines</button>
</div>
<span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[120px] text-white/10 group-hover:scale-110 transition-transform">menu_book</span>
</div>
<div className="bg-white dark:bg-background-dark/40 border border-primary/10 p-8 rounded-2xl flex flex-col gap-4">
<h3 className="text-slate-900 dark:text-slate-100 text-xl font-black">Timeline Tracker</h3>
<div className="flex items-center gap-4">
<div className="size-2 rounded-full bg-emerald-500"></div>
<div className="flex-1 h-1 bg-emerald-100 rounded-full overflow-hidden">
<div className="w-3/4 h-full bg-emerald-500"></div>
</div>
<span className="text-xs font-bold text-emerald-600">75% Avg Efficiency</span>
</div>
<p className="text-slate-500 text-sm">Your applications are currently being processed 15 days faster than the regional average.</p>
</div>
</div>
</main>
<footer className="px-6 lg:px-40 py-10 border-t border-primary/10 text-center">
<div className="flex flex-col md:flex-row justify-between items-center gap-6">
<div className="flex items-center gap-2 text-primary/60">
<span className="material-symbols-outlined">eco</span>
<span className="text-sm font-bold tracking-tighter">PARIVESH 3.0</span>
</div>
<p className="text-xs text-slate-400">© 2024 Ministry of Environment, Forest and Climate Change. All Rights Reserved.</p>
<div className="flex gap-6">
<a className="text-xs text-slate-500 hover:text-primary" href="#">Privacy Policy</a>
<a className="text-xs text-slate-500 hover:text-primary" href="#">Terms of Service</a>
</div>
</div>
</footer>
</div>
</div>

    </>
  );
};

export default PPPortalDashboard;
