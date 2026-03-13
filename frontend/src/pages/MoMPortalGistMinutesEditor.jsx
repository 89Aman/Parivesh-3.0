import React from 'react';
import { Link } from 'react-router-dom';

const MoMPortalGistMinutesEditor = () => {
  return (
    <>
      

<header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-white dark:bg-slate-900 px-10 py-3 sticky top-0 z-50">
<Link to="/" className="flex items-center gap-4 text-primary">
<div className="size-8 bg-primary rounded flex items-center justify-center text-white">
<span className="material-symbols-outlined">description</span>
</div>
<h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em]">PARIVESH 3.0 MoM Editor</h2>
</Link>
<div className="flex flex-1 justify-end gap-4 items-center">
<div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded border border-primary/10">
<span className="size-2 rounded-full bg-green-500"></span>
<span className="text-xs font-medium text-slate-600 dark:text-slate-400">Auto-saving...</span>
</div>
<button className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
<span className="truncate">Save Progress</span>
</button>
<div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20" data-alt="User profile avatar image" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD6OWuZ5HBHzUeE2lM6ISHfg2bbwXnVzdFkSbVz6R6xOwlR_a2GOKep87hg4y4S4O9Gs7VoROqKmkvUdX4q-glVuc8PLXB8KHr24yzjkWj6ZKZgsUjZ3RK1gIexZP-D8gOBbhwwd3oah2HssfiWqHPyRwv49D3qMF_jOGG70ANcZk-Lth-9TNMF1_AJfXrajZrJYIci1E7fjG7GoWjaTQNt0DWmHvcCxNz5YzeXyIdFT2jNxg_2PlnKNDh-KHT_tEVHNiNLh7qzbEE")' }}></div>
</div>
</header>

<main className="max-w-[1600px] mx-auto px-6">
<div className="flex flex-wrap gap-2 py-4 items-center">
<a className="text-primary text-sm font-medium hover:underline" href="#">Meetings</a>
<span className="text-primary/40 text-sm material-symbols-outlined scale-75">chevron_right</span>
<a className="text-primary text-sm font-medium hover:underline" href="#">Committee G-12</a>
<span className="text-primary/40 text-sm material-symbols-outlined scale-75">chevron_right</span>
<span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Draft MoM (Session #402)</span>
</div>
<div className="flex flex-wrap justify-between gap-3 pb-6">
<div className="flex flex-col gap-1">
<h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">Meeting Gist &amp; MoM Editor</h1>
<p className="text-slate-500 dark:text-slate-400 text-sm">Review the case summary on the left and prepare the minutes on the right.</p>
</div>
</div>

<div className="grid grid-cols-12 gap-6 pb-24">

<aside className="col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm flex flex-col">
<div className="flex border-b border-primary/10">
<button className="flex-1 flex flex-col items-center justify-center border-b-2 border-primary text-primary py-4">
<p className="text-xs font-bold uppercase tracking-wider">Application Summary</p>
</button>
<button className="flex-1 flex flex-col items-center justify-center border-b-2 border-transparent text-slate-400 py-4 hover:text-slate-600">
<p className="text-xs font-bold uppercase tracking-wider">Sector Params</p>
</button>
</div>
<div className="p-6 overflow-y-auto sidebar-scroll">

<div className="space-y-6">
<div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
<h3 className="text-primary font-bold text-sm mb-3 flex items-center gap-2">
<span className="material-symbols-outlined text-sm">info</span> Key Details
                            </h3>
<div className="space-y-3">
<div className="flex justify-between border-b border-primary/5 pb-2">
<span className="text-xs text-slate-500 font-medium">Project ID</span>
<span className="text-xs text-slate-900 dark:text-slate-100 font-bold">IA/RJ/INFRA/402</span>
</div>
<div className="flex justify-between border-b border-primary/5 pb-2">
<span className="text-xs text-slate-500 font-medium">Proponent</span>
<span className="text-xs text-slate-900 dark:text-slate-100 font-bold text-right">ABC Infrastructure Corp Ltd</span>
</div>
<div className="flex justify-between border-b border-primary/5 pb-2">
<span className="text-xs text-slate-500 font-medium">Sector</span>
<span className="text-xs text-slate-900 dark:text-slate-100 font-bold">Infrastructure (Category A)</span>
</div>
<div className="flex justify-between">
<span className="text-xs text-slate-500 font-medium">Location</span>
<span className="text-xs text-slate-900 dark:text-slate-100 font-bold">Udaipur, Rajasthan</span>
</div>
</div>
</div>

<div className="space-y-4">
<h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Project Scope</h4>
<p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                The project involves the expansion of a multi-modal logistics park covering an area of 450 hectares. 
                                The proposal includes setting up warehouse facilities, a rail-siding network, and associated infrastructure 
                                for green energy integration. Total estimated investment is ₹1,250 Crores.
                            </p>
<h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Compliance Status</h4>
<ul className="space-y-2">
<li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
<span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
<span>EIA Report submitted on 12-Oct-2023</span>
</li>
<li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
<span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
<span>Public Hearing conducted on 05-Nov-2023 (No major objections)</span>
</li>
<li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
<span className="material-symbols-outlined text-amber-500 text-base">warning</span>
<span>Pending Forest Clearance (Stage II)</span>
</li>
</ul>
</div>
</div>
</div>
</aside>

<section className="col-span-8 flex flex-col gap-4">

<div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between">
<div className="flex items-center gap-1 border-r border-primary/10 pr-2 mr-2">
<button className="p-2 hover:bg-primary/10 rounded text-slate-600" title="Bold"><span className="material-symbols-outlined">format_bold</span></button>
<button className="p-2 hover:bg-primary/10 rounded text-slate-600" title="Italic"><span className="material-symbols-outlined">format_italic</span></button>
<button className="p-2 hover:bg-primary/10 rounded text-slate-600" title="List"><span className="material-symbols-outlined">format_list_bulleted</span></button>
</div>
<div className="flex flex-1 gap-2">
<button className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors">
<span className="material-symbols-outlined text-base">add_box</span>
                            Insert Section
                        </button>
<button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
<span className="material-symbols-outlined text-base">history</span>
                            Reset to Gist
                        </button>
</div>
<div className="pl-2 border-l border-primary/10">
<button className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
<span className="material-symbols-outlined text-base">auto_awesome</span>
                            Convert to MoM Draft
                        </button>
</div>
</div>

<div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden flex flex-col editor-container">
<div className="p-8 flex-1 overflow-y-auto text-slate-800 dark:text-slate-200">

<div className="max-w-3xl mx-auto space-y-8">
<div className="border-b border-primary/10 pb-4">
<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Minutes of Meeting: G-12 Committee</h1>
<p className="text-slate-500 mt-1">Proposal: Expansion of Logistics Park, Udaipur</p>
</div>
<section>
<h2 className="text-lg font-bold text-primary mb-3">1. Background of the Proposal</h2>
<p className="leading-relaxed">The Member Secretary briefed the Committee about the proposal submitted by ABC Infrastructure Corp Ltd. The committee noted that the project was previously deferred for clarification on water consumption and greenbelt development plans.</p>
</section>
<section>
<h2 className="text-lg font-bold text-primary mb-3">2. Committee Observations &amp; Deliberations</h2>
<p className="mb-4">During the meeting, the following points were discussed:</p>
<ul className="list-disc pl-5 space-y-3">
<li>The proponent presented the revised Water Balance Chart showing a 20% reduction in fresh water demand through ZLD (Zero Liquid Discharge) implementation.</li>
<li>The committee observed that the proposed greenbelt area (33%) meets the standard norms, but recommended planting indigenous species specifically suited for the arid climate of Rajasthan.</li>
<li>A query was raised regarding the noise mitigation measures near the rail-siding zone during night operations.</li>
</ul>
</section>
<section>
<h2 className="text-lg font-bold text-primary mb-3">3. Final Recommendation</h2>
<div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-l-4 border-primary italic">
                                    [Drafting Note: Enter the final decision status - Recommended/Deferred/Rejected]
                                </div>
</section>
</div>
</div>
</div>
</section>
</div>
</main>

<footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-primary/10 p-4 z-50">
<div className="max-w-[1600px] mx-auto flex justify-between items-center">
<div className="flex items-center gap-6">
<div className="flex flex-col">
<span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Editor Mode</span>
<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rich Text Draft (Beta)</span>
</div>
<div className="h-8 w-px bg-primary/10"></div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary">groups</span>
<span className="text-xs font-medium">3 others editing: Dr. Sharma, K. Patel, Admin</span>
</div>
</div>
<div className="flex items-center gap-3">
<button className="px-6 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Export PDF
                </button>
<button className="flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
<span className="material-symbols-outlined text-base">lock</span>
                    Finalize &amp; Lock MoM
                </button>
</div>
</div>
</footer>

    </>
  );
};

export default MoMPortalGistMinutesEditor;
