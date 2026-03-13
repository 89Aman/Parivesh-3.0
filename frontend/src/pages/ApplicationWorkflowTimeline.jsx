import React from 'react';
import { Link } from 'react-router-dom';

const ApplicationWorkflowTimeline = () => {
  return (
    <>
      
<div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
<div className="layout-container flex h-full grow flex-col">
<header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-20 py-4 sticky top-0 z-50">
<div className="flex items-center gap-8">
<Link to="/" className="flex items-center gap-3 text-primary">
<div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-2xl">account_tree</span>
</div>
<h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">PARIVESH 3.0</h2>
</Link>
<nav className="hidden lg:flex items-center gap-8">
<Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-semibold" to="/pp/dashboard">Dashboard</Link>
<Link className="text-primary text-sm font-semibold border-b-2 border-primary pb-1" to="/pp/applications">Applications</Link>
<Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-semibold" to="/admin/stats">Reports</Link>
</nav>
</div>
<div className="flex items-center gap-6">
<label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
<div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
<div className="text-slate-500 flex items-center justify-center pl-4">
<span className="material-symbols-outlined text-xl">search</span>
</div>
<input className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 text-sm font-normal" placeholder="Search Application ID..."/>
</div>
</label>
<div className="relative group">
<div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary shadow-sm cursor-pointer" data-alt="User profile avatar circle" style={{ backgroundImage: "url(\"https://lh3.googleusercontent.com/aida-public/AB6AXuA5MyRF3bdbKPeXYDwHKpiXGCOIhZtcBPevBoTPnjU2Udr4r0zRXI-qTHbwndpLLLCvMAOV18bOucnukdzMX6KLK_nfRyoTQbio6dCWi0zhbZqVKouE8Mq7rUQtOxXAZ2IPbzD-xhMXqyxj3nvhnH041Eju3C2x4aJ1YgjQ3yD1TiIhNQ-IFHDtfp2VZ6HqhDY2zILKlD9DgwlEsd3yVMProA3ssnwz6CdrpqVrxHbY_WXfdpZC0RrXFGN9NuN2DmBZ_aUC2MrHMQ\")" }}></div>
</div>
</div>
</header>
<main className="flex-1 flex flex-col px-6 md:px-20 py-8 gap-8">
<section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
<span className="material-symbols-outlined text-sm">verified</span>
                            Greenfield Project
                        </div>
<h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Project ID: 88231-G</h1>
<p className="text-slate-500 dark:text-slate-400 max-w-lg">Expansion of manufacturing facility in industrial corridor zone B-4. Currently in secondary review stage.</p>
</div>
<div className="flex gap-3">
<button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700">
<span className="material-symbols-outlined text-lg">download</span>
                            Draft Report
                        </button>
<button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all">
<span className="material-symbols-outlined text-lg">edit</span>
                            Modify Details
                        </button>
</div>
</section>
<section className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8">
<div className="mb-10 flex items-center justify-between">
<h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
<span className="material-symbols-outlined text-primary">analytics</span>
                            Live Workflow Tracking
                        </h3>
<span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">Estimated 12 Days Remaining</span>
</div>
<div className="relative w-full overflow-x-auto pb-12 lg:pb-0">
<div className="flex items-start justify-between min-w-[1000px] relative">
<div className="absolute top-5 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-0">
<div className="h-full bg-primary transition-all duration-700 w-[35%]"></div>
</div>
<div className="relative flex flex-col items-center gap-4 w-1/7 group cursor-pointer">
<div className="size-10 rounded-full bg-primary flex items-center justify-center text-white z-10 shadow-lg ring-4 ring-white dark:ring-slate-900">
<span className="material-symbols-outlined font-bold">check</span>
</div>
<div className="text-center">
<p className="text-slate-900 dark:text-white text-sm font-bold">Draft</p>
<p className="text-slate-400 text-xs mt-1">Oct 12, 2023</p>
</div>
<div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white p-3 rounded-lg text-xs w-40 shadow-xl z-20">
<p className="font-bold border-b border-slate-700 pb-1 mb-1">Completed</p>
<p className="text-slate-400">Application drafted by Rahul Singh. All checklists verified.</p>
</div>
</div>
<div className="relative flex flex-col items-center gap-4 w-1/7 group cursor-pointer">
<div className="size-10 rounded-full bg-primary flex items-center justify-center text-white z-10 shadow-lg ring-4 ring-white dark:ring-slate-900">
<span className="material-symbols-outlined font-bold">check</span>
</div>
<div className="text-center">
<p className="text-slate-900 dark:text-white text-sm font-bold">Submitted</p>
<p className="text-slate-400 text-xs mt-1">Oct 14, 2023</p>
</div>
<div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white p-3 rounded-lg text-xs w-40 shadow-xl z-20">
<p className="font-bold border-b border-slate-700 pb-1 mb-1">Completed</p>
<p className="text-slate-400">Payment received and acknowledgement number generated.</p>
</div>
</div>
<div className="relative flex flex-col items-center gap-4 w-1/7 group cursor-pointer">
<div className="relative size-10 flex items-center justify-center z-10">
<div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
<div className="size-10 rounded-full bg-white dark:bg-slate-900 border-2 border-primary flex items-center justify-center text-primary z-10 shadow-md">
<span className="material-symbols-outlined font-bold">timeline</span>
</div>
</div>
<div className="text-center">
<p className="text-primary text-sm font-black">Under Scrutiny</p>
<p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-semibold italic">Processing...</p>
</div>
</div>
<div className="relative flex flex-col items-center gap-4 w-1/7 group opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
<div className="size-10 rounded-full bg-amber-500 flex items-center justify-center text-white z-10 shadow-lg ring-4 ring-white dark:ring-slate-900">
<span className="material-symbols-outlined font-bold">report</span>
</div>
<div className="text-center">
<p className="text-amber-600 dark:text-amber-400 text-sm font-bold">EDS</p>
<p className="text-slate-400 text-xs mt-1">Action Req.</p>
</div>
<div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-amber-600 text-white p-3 rounded-lg text-xs w-48 shadow-xl z-20">
<p className="font-bold border-b border-amber-500 pb-1 mb-1">Essential Detail Sought</p>
<p className="text-amber-100">Click to view the specific documents requested by the nodal officer.</p>
</div>
</div>
<div className="relative flex flex-col items-center gap-4 w-1/7 group opacity-40">
<div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 z-10 ring-4 ring-white dark:ring-slate-900">
<span className="material-symbols-outlined font-bold">move_down</span>
</div>
<div className="text-center">
<p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Referred</p>
<p className="text-slate-400 text-xs mt-1">Upcoming</p>
</div>
</div>
<div className="relative flex flex-col items-center gap-4 w-1/7 group opacity-40">
<div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 z-10 ring-4 ring-white dark:ring-slate-900">
<span className="material-symbols-outlined font-bold">description</span>
</div>
<div className="text-center">
<p className="text-slate-500 dark:text-slate-400 text-sm font-bold">MoM Generated</p>
<p className="text-slate-400 text-xs mt-1">Upcoming</p>
</div>
</div>
<div className="relative flex flex-col items-center gap-4 w-1/7 group opacity-40">
<div className="size-12 -mt-1 rounded-full bg-gradient-to-tr from-yellow-400 via-primary to-green-600 flex items-center justify-center text-white z-10 shadow-xl ring-4 ring-white dark:ring-slate-900">
<span className="material-symbols-outlined font-black text-2xl">celebration</span>
</div>
<div className="text-center">
<p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Finalized</p>
<p className="text-slate-400 text-xs mt-1">Upcoming</p>
</div>
</div>
</div>
</div>
</section>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
<div className="lg:col-span-2 space-y-8">
<section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
<h4 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary">info</span>
                                Current Stage Activity: Under Scrutiny
                            </h4>
<div className="flex flex-col md:flex-row gap-6">
<div className="flex-1 space-y-4">
<p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        Your application is currently being evaluated by the <span className="font-bold text-slate-800 dark:text-slate-200">State Expert Appraisal Committee (SEAC)</span>. Technical verification of forest clearance documents and noise level impact reports is in progress.
                                    </p>
<div className="grid grid-cols-2 gap-4">
<div className="bg-background-light dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
<p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Assigned To</p>
<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dr. Arpit Varma</p>
</div>
<div className="bg-background-light dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
<p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Estimated Date</p>
<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Nov 02, 2023</p>
</div>
</div>
<button className="w-full py-3 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
                                        View Full Audit Log
                                        <span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
<div className="w-full md:w-64 h-48 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden relative border border-slate-200 dark:border-slate-700 group">
<img alt="Aerial view of project site" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Aerial construction site terrain map visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBwFhkVLSZB0mUZ3hrHi7r1KqJIGEDfZUqrdRyIzARWybQxeJAKgR-Dlak6HWn24Rtk_TgKPupVs-Lo1_BseWzW8rrNl1qat89lcMK77lgNbKYS7PsyhNAICnAx5ZXdqL0V6s5SxGIm4m5gN1fC_gqb1XfQS1MkJ5DUTDXD6OpWbU4-m8LM49V_J1WNCbXiyxNVYGCB0wMO5jd8VvIvWYXB6BFbVMwX4f0rEE8waslUCmjTeY9aB9AFIjNdIo2KaPg4w65N0wE7A"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
<span className="text-white text-xs font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-sm">location_on</span>
                                            Site Map View
                                        </span>
</div>
</div>
</div>
</section>
</div>
<div className="space-y-6">
<section className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/20">
<h4 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary">notifications_active</span>
                                Action Needed
                            </h4>
<div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
<span className="material-symbols-outlined text-amber-600 shrink-0">warning</span>
<div>
<p className="text-sm font-bold text-amber-900 dark:text-amber-200">Pending EDS Response</p>
<p className="text-xs text-amber-800 dark:text-amber-400 mt-1">Clarification requested for ground water consumption data for Phase 2.</p>
<button className="mt-3 text-xs font-bold text-white bg-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors">Respond Now</button>
</div>
</div>
</section>
<section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
<h4 className="text-slate-900 dark:text-white font-bold mb-4">Quick Documents</h4>
<div className="space-y-3">
<div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
<div className="flex items-center gap-3">
<div className="size-8 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
<span className="material-symbols-outlined text-lg">picture_as_pdf</span>
</div>
<div>
<p className="text-sm font-bold dark:text-white">Form 1_A.pdf</p>
<p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Submitted</p>
</div>
</div>
<span className="material-symbols-outlined text-slate-400 group-hover:text-primary">download</span>
</div>
<div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
<div className="flex items-center gap-3">
<div className="size-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
<span className="material-symbols-outlined text-lg">description</span>
</div>
<div>
<p className="text-sm font-bold dark:text-white">Site_Plan_Final.dwg</p>
<p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Map Data</p>
</div>
</div>
<span className="material-symbols-outlined text-slate-400 group-hover:text-primary">download</span>
</div>
</div>
</section>
</div>
</div>
</main>
<footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 md:px-20 py-8 text-center">
<p className="text-slate-500 dark:text-slate-400 text-sm">© 2023 PARIVESH 3.0 - Ministry of Environment, Forest and Climate Change. All Rights Reserved.</p>
<div className="flex justify-center gap-6 mt-4">
<a className="text-xs text-slate-400 hover:text-primary font-semibold" href="#">Privacy Policy</a>
<a className="text-xs text-slate-400 hover:text-primary font-semibold" href="#">Contact Support</a>
<a className="text-xs text-slate-400 hover:text-primary font-semibold" href="#">User Manual</a>
</div>
</footer>
</div>
</div>

    </>
  );
};

export default ApplicationWorkflowTimeline;
