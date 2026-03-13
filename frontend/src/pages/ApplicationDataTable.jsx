import React from 'react';
import { Link } from 'react-router-dom';

const ApplicationDataTable = () => {
  return (
    <>
      
<div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
<div className="layout-container flex h-full grow flex-col">

<header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-3 sticky top-0 z-50">
<div className="flex items-center gap-8">
<Link to="/" className="flex items-center gap-4 text-primary">
<div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-primary">account_balance</span>
</div>
<h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">GovPortal</h2>
</Link>
<nav className="flex items-center gap-6">
<Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" to="/pp/dashboard">Dashboard</Link>
<Link className="text-primary text-sm font-semibold border-b-2 border-primary py-1" to="/pp/applications">Applications</Link>
<Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" to="/admin/stats">Analytics</Link>
<Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" to="/pp/workflow">Registry</Link>
</nav>
</div>
<div className="flex flex-1 justify-end gap-6 items-center">
<div className="relative w-full max-w-xs">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
<input className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50" placeholder="Search records..."/>
</div>
<div className="flex items-center gap-2">
<button className="p-2 text-slate-400 hover:text-primary transition-colors">
<span className="material-symbols-outlined">notifications</span>
</button>
<div className="size-9 rounded-full bg-primary/20 border-2 border-primary/10 overflow-hidden">
<img className="w-full h-full object-cover" data-alt="User profile avatar of a government administrator" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOME_8OLdTKztmuE1y8tFmALsPgEIuckFwsZOl_pXIDHrXDAf-8iwGQ0nDLiOwKoeP4m5scNoqWBbW8HIGkgEwuWIwtGfT9Pjh53Rx_Me5AQS7UBwW7XDqibAFq-7bgoh-Xj9ISHUTt155C56ZJGB3aoUK0f_T9AsKyGhNpA-Hwr_3U_DVnZHUS488PZNd777iLUA7sR88h7__IP2EjczlGWNPStmovDuLrw3czZFoyEBnClD56CM3c-T8-LstoBraiip7L6Yfkw"/>
</div>
</div>
</div>
</header>
<main className="flex-1 px-10 py-8 max-w-[1440px] mx-auto w-full">

<div className="flex flex-wrap justify-between items-end gap-4 mb-8">
<div className="flex flex-col gap-2">
<h1 className="text-slate-900 dark:text-white text-4xl font-extrabold tracking-tight">Application Registry</h1>
<p className="text-slate-500 dark:text-slate-400 text-base font-normal">Manage and monitor official government submissions and regulatory filings.</p>
</div>
<div className="flex gap-3">
<button className="flex items-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
<span className="material-symbols-outlined text-sm">file_download</span>
<span>Export CSV</span>
</button>
<Link to="/pp/new-application" className="flex items-center gap-2 rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold hover:brightness-110 transition-all shadow-md shadow-primary/20">
<span className="material-symbols-outlined text-sm">add_circle</span>
<span>New Application</span>
</Link>
</div>
</div>

<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
<div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
<button className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold whitespace-nowrap">All Applications (1,248)</button>
<button className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold whitespace-nowrap hover:bg-slate-300 transition-colors">Drafts (42)</button>
<button className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold whitespace-nowrap hover:bg-slate-300 transition-colors">Pending (156)</button>
<button className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold whitespace-nowrap hover:bg-slate-300 transition-colors">Action Required (12)</button>
</div>
<div className="flex items-center gap-3">
<button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-primary transition-colors">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
                        Filters
                    </button>
</div>
</div>

<div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none border-t-[3px] border-primary overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse min-w-[1000px]">
<thead className="sticky top-0 z-10 frosted-glass border-b border-slate-100 dark:border-slate-800">
<tr>
<th className="p-4 w-12">
<input className="rounded text-primary focus:ring-primary/50 border-slate-300" type="checkbox"/>
</th>
<th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
<div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                                        Application ID
                                        <span className="material-symbols-outlined text-xs">unfold_more</span>
</div>
</th>
<th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
<div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                                        Applicant Name
                                        <span className="material-symbols-outlined text-xs">expand_more</span>
</div>
</th>
<th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Submission Date</th>
<th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Priority</th>
<th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
<th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-slate-50 dark:divide-slate-800">

<tr className="hover:bg-primary/5 transition-colors group">
<td className="p-4"><input className="rounded text-primary focus:ring-primary/50 border-slate-300" type="checkbox"/></td>
<td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-300">APP-2024-001</td>
<td className="p-4 font-semibold text-slate-800 dark:text-slate-100">Regional Infra Development</td>
<td className="p-4 text-sm text-slate-500">Oct 24, 2023</td>
<td className="p-4 text-center">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">LOW</span>
</td>
<td className="p-4">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-tight">
<span className="material-symbols-outlined text-[14px]">edit_note</span>
                                        DRAFT
                                    </span>
</td>
<td className="p-4 text-right">
<button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</td>
</tr>

<tr className="hover:bg-primary/5 transition-colors group">
<td className="p-4"><input className="rounded text-primary focus:ring-primary/50 border-slate-300" type="checkbox"/></td>
<td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-300">APP-2024-002</td>
<td className="p-4 font-semibold text-slate-800 dark:text-slate-100">National Healthcare Trust</td>
<td className="p-4 text-sm text-slate-500">Oct 25, 2023</td>
<td className="p-4 text-center">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600">MEDIUM</span>
</td>
<td className="p-4">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full animate-pulse-blue text-xs font-bold uppercase tracking-tight">
<span className="material-symbols-outlined text-[14px]">send</span>
                                        SUBMITTED
                                    </span>
</td>
<td className="p-4 text-right">
<button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</td>
</tr>

<tr className="hover:bg-primary/5 transition-colors group">
<td className="p-4"><input className="rounded text-primary focus:ring-primary/50 border-slate-300" type="checkbox"/></td>
<td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-300">APP-2024-003</td>
<td className="p-4 font-semibold text-slate-800 dark:text-slate-100">Urban Transit Expansion</td>
<td className="p-4 text-sm text-slate-500">Oct 26, 2023</td>
<td className="p-4 text-center">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">URGENT</span>
</td>
<td className="p-4">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-tight ring-1 ring-amber-200">
<span className="material-symbols-outlined text-[16px] animate-spin">settings</span>
                                        UNDER SCRUTINY
                                    </span>
</td>
<td className="p-4 text-right">
<button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</td>
</tr>

<tr className="hover:bg-primary/5 transition-colors group">
<td className="p-4"><input className="rounded text-primary focus:ring-primary/50 border-slate-300" type="checkbox"/></td>
<td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-300">APP-2024-004</td>
<td className="p-4 font-semibold text-slate-800 dark:text-slate-100">Renewable Grid Project</td>
<td className="p-4 text-sm text-slate-500">Oct 27, 2023</td>
<td className="p-4 text-center">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600">MEDIUM</span>
</td>
<td className="p-4">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-tight ring-1 ring-red-300 animate-flash-red">
<span className="material-symbols-outlined text-[14px]">warning</span>
                                        EDS REQUIRED
                                    </span>
</td>
<td className="p-4 text-right">
<button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</td>
</tr>

<tr className="hover:bg-primary/5 transition-colors group">
<td className="p-4"><input className="rounded text-primary focus:ring-primary/50 border-slate-300" type="checkbox"/></td>
<td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-300">APP-2024-005</td>
<td className="p-4 font-semibold text-slate-800 dark:text-slate-100">Agricultural Grant Fund</td>
<td className="p-4 text-sm text-slate-500">Oct 28, 2023</td>
<td className="p-4 text-center">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">LOW</span>
</td>
<td className="p-4">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-slate-900 dark:text-primary-100 text-xs font-bold uppercase tracking-tight ring-1 ring-primary/40">
<span className="material-symbols-outlined text-[14px]">lock</span>
                                        FINALIZED
                                    </span>
</td>
<td className="p-4 text-right">
<button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</td>
</tr>

<tr className="hover:bg-primary/5 transition-colors group">
<td className="p-4"><input className="rounded text-primary focus:ring-primary/50 border-slate-300" type="checkbox"/></td>
<td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-300">APP-2024-006</td>
<td className="p-4 font-semibold text-slate-800 dark:text-slate-100">Digital Identity Framework</td>
<td className="p-4 text-sm text-slate-500">Oct 29, 2023</td>
<td className="p-4 text-center">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">URGENT</span>
</td>
<td className="p-4">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full animate-pulse-blue text-xs font-bold uppercase tracking-tight">
<span className="material-symbols-outlined text-[14px]">send</span>
                                        SUBMITTED
                                    </span>
</td>
<td className="p-4 text-right">
<button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>

<div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
<span className="text-xs text-slate-500 font-medium">Showing 1 to 6 of 1,248 entries</span>
<div className="flex gap-1">
<button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary transition-all">
<span className="material-symbols-outlined text-sm">chevron_left</span>
</button>
<button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/20">1</button>
<button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-all">2</button>
<button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-all">3</button>
<span className="flex items-center px-1 text-slate-400">...</span>
<button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-all">42</button>
<button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary transition-all">
<span className="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
</main>
</div>
</div>

    </>
  );
};

export default ApplicationDataTable;
