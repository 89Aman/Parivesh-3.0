import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const ReviewApplicationModal = () => {
  return (
    <>


<div className="fixed inset-0 bg-slate-900/40 modal-blur z-0"></div>

<div className="relative z-10 w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[12px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

<div className="bg-gradient-to-r from-primary to-emerald-600 px-6 py-4 flex items-center justify-between text-white">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-white">description</span>
<div>
<h2 className="text-lg font-bold leading-tight">Review Application | PARIVESH 3.0</h2>
<p className="text-xs opacity-90">Proposal ID: 2024/EN/01 • Submitted 24 Oct 2023</p>
</div>
</div>
<Link to={ROUTES.PP_DASHBOARD} className="hover:bg-white/20 p-2 rounded-full transition-colors">
<span className="material-symbols-outlined">close</span>
</Link>
</div>

<div className="flex flex-1 overflow-hidden">

<div className="w-1/3 border-r border-slate-100 dark:border-slate-800 flex flex-col">
<div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">folder</span>
                        Documents List
                    </h3>
</div>
<div className="flex-1 overflow-y-auto p-4 space-y-3">
<div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors cursor-pointer group">
<div className="flex items-start justify-between">
<div className="flex gap-3">
<span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
<div>
<p className="text-xs font-semibold text-slate-800 dark:text-slate-200">EIA_Report_Final.pdf</p>
<p className="text-[10px] text-slate-500">Uploaded on Oct 12 • 4.2 MB</p>
</div>
</div>
<span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-sm">download</span>
</div>
</div>
<div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-primary/5 border-primary">
<div className="flex items-start justify-between">
<div className="flex gap-3">
<span className="material-symbols-outlined text-blue-500">image</span>
<div>
<p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Site_Map_Layout.jpg</p>
<p className="text-[10px] text-slate-500">Uploaded on Oct 14 • 1.8 MB</p>
</div>
</div>
<span className="material-symbols-outlined text-primary text-sm">visibility</span>
</div>
</div>
<div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors cursor-pointer group">
<div className="flex items-start justify-between">
<div className="flex gap-3">
<span className="material-symbols-outlined text-orange-500">description</span>
<div>
<p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Land_Ownership_Cert.pdf</p>
<p className="text-[10px] text-slate-500">Uploaded on Oct 15 • 2.1 MB</p>
</div>
</div>
<span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-sm">download</span>
</div>
</div>
</div>
</div>

<div className="w-1/3 border-r border-slate-100 dark:border-slate-800 flex flex-col">
<div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">fact_check</span>
                        Verification Checklist
                    </h3>
</div>
<div className="flex-1 overflow-y-auto p-4 space-y-4">
<div className="flex items-start gap-3">
<input checked="" className="mt-1 rounded border-slate-300 text-primary focus:ring-primary" type="checkbox"/>
<div>
<p className="text-xs font-medium text-slate-800 dark:text-slate-200">Legal Compliance Verified</p>
<p className="text-[10px] text-slate-500">Matches Section 4.2 of environmental act</p>
</div>
</div>
<div className="flex items-start gap-3">
<input checked="" className="mt-1 rounded border-slate-300 text-primary focus:ring-primary" type="checkbox"/>
<div>
<p className="text-xs font-medium text-slate-800 dark:text-slate-200">Land Details Accuracy</p>
<p className="text-[10px] text-slate-500">Geospatial coordinates verified via satellite</p>
</div>
</div>
<div className="flex items-start gap-3">
<input className="mt-1 rounded border-slate-300 text-primary focus:ring-primary" type="checkbox"/>
<div>
<p className="text-xs font-medium text-slate-800 dark:text-slate-200">Impact Assessment Completeness</p>
<p className="text-[10px] text-slate-500">Pending review of noise pollution data</p>
</div>
</div>
</div>
</div>

<div className="w-1/3 flex flex-col bg-slate-50/30 dark:bg-slate-900/50">
<div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">info</span>
                        Status Summary
                    </h3>
</div>
<div className="flex-1 overflow-y-auto p-4 space-y-4">

<div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
<div className="flex justify-between items-start mb-2">
<p className="text-[10px] font-bold text-primary tracking-wider uppercase">Finance Module</p>
<div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
<span className="material-symbols-outlined text-[12px]">verified</span>
                                VERIFIED
                            </div>
</div>
<p className="text-sm font-bold text-slate-900 dark:text-slate-100">Payment Status: Success</p>
<p className="text-xs text-slate-500 mt-1">Ref: TXN98234102 • ₹45,000.00</p>
<div className="mt-3 w-full h-24 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
<div className="absolute inset-0 bg-cover bg-center opacity-40" data-alt="Abstract verification pattern with green accents" style={{ backgroundImage: 'url("https' }}></div>
<div className="absolute inset-0 flex items-center justify-center">
<button className="text-[10px] font-bold bg-white dark:bg-slate-600 px-3 py-1.5 rounded shadow-sm border border-slate-200 dark:border-slate-500">VIEW RECEIPT</button>
</div>
</div>
</div>

<div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-32 relative">
<img alt="Site Map Location" className="w-full h-full object-cover" data-location="Mumbai, India" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCXx5ZOWn7IVJUt4pICkF_yYrJRxlFuCOXv8q1QIvWdULJHAl8jBZiOpykRpDHl6l_qEnWnGoU_3DGGfUvvUgxve1_w-_4QcavbvDuzc6OGijr2QKYwat4Wrer9Nb2P1Ljip-2b4jE31Bixll3ylnyZht4BMPm1KpR5S33BR-SVhNeHCAOCKNu_9JUO24t_GomBCBx7an84gtcJFbwLYK3KmxfDRbfmcMnYnI6bB7_tsHZcR5-85qS9vV0dh1h1a3Aw6Y8jChw-g"/>
<div className="absolute bottom-2 left-2 bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded text-[10px] font-medium shadow-sm flex items-center gap-1">
<span className="material-symbols-outlined text-xs">location_on</span> Site Coordinates
                        </div>
</div>
</div>
</div>
</div>

<div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
<div className="flex items-center gap-4">
<button className="px-6 h-10 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold transition-all border border-red-100">
<span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    Raise EDS
                </button>
<p className="text-xs text-slate-400 max-w-[200px] italic">Essential Details Sought (EDS) will notify the project proponent.</p>
</div>
<div className="flex items-center gap-3">
<button className="px-4 h-10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                    Save Draft
                </button>
<button className="px-6 h-10 flex items-center justify-center gap-2 bg-primary text-white hover:bg-emerald-500 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all">
<span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    Refer to Meeting
                </button>
</div>
</div>
</div>

    </>
  );
};

export default ReviewApplicationModal;
