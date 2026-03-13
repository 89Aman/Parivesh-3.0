import React from 'react';
import { Link } from 'react-router-dom';

const PPPortalNewApplicationForm = () => {
  return (
    <>
      
<div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
<div className="layout-container flex h-full grow flex-col">

<header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 md:px-20 lg:px-40 py-3 bg-white dark:bg-slate-900">
<Link to="/" className="flex items-center gap-4 text-primary">
<div className="size-8 flex items-center justify-center bg-primary text-white rounded-lg">
<span className="material-symbols-outlined">eco</span>
</div>
<h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">PARIVESH 3.0</h2>
</Link>
<div className="flex flex-1 justify-end gap-4 items-center">
<div className="flex gap-2">
<button className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
<span className="material-symbols-outlined">account_circle</span>
</button>
</div>
<div className="bg-primary/20 rounded-full h-10 w-10 flex items-center justify-center overflow-hidden border border-primary/30">
<img alt="User Profile" className="h-full w-full object-cover" data-alt="Professional user profile avatar photo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgAVjXe9vrEu7K-gXCIK7wCp5W7WIHbrJs0DZToTIbtlY1sBOu02-IqzPZrsbm7k6p8iKZ57uMhubPk6E7wyfmMg1O6nYVvMs2zd7BhfM07gFA_MGxtpqxZ3ylAANzJjFfb1zsdVuBVVUfLHyV7jHDAaN6msWVnjy4fWqEXkKRijJCoyI-aCbUoAW83p8CuSBfm4Oz1S3_aldnhh-f0oeB13OzyO1ssmmv_ZQpt9lh4U-t629nycsHBGYoEzno-LQ1B3_9fbr6HcA"/>
</div>
</div>
</header>
<main className="flex-1 flex flex-col items-center">
<div className="layout-content-container flex flex-col max-w-[1024px] w-full p-4 md:p-10">

<div className="flex flex-col gap-2 mb-8">
<h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold">New Application</h1>
<p className="text-slate-500 dark:text-slate-400 text-sm">Please provide the initial project details to begin your clearance process.</p>
</div>

<div className="w-full overflow-x-auto pb-4">
<div className="flex min-w-[800px] border-b border-primary/10 mb-8">
<a className="flex flex-col items-center justify-center border-b-[3px] border-primary px-4 pb-4 pt-4 text-primary group" href="#">
<span className="text-sm font-bold">Project Details</span>
<div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100"></div>
</a>
<a className="flex flex-col items-center justify-center border-b-[3px] border-transparent px-4 pb-4 pt-4 text-slate-500 hover:text-primary transition-colors" href="#">
<span className="text-sm font-semibold">Location &amp; Capacity</span>
</a>
<a className="flex flex-col items-center justify-center border-b-[3px] border-transparent px-4 pb-4 pt-4 text-slate-500 hover:text-primary transition-colors" href="#">
<span className="text-sm font-semibold">Sector Parameters</span>
</a>
<a className="flex flex-col items-center justify-center border-b-[3px] border-transparent px-4 pb-4 pt-4 text-slate-500 hover:text-primary transition-colors" href="#">
<span className="text-sm font-semibold">Documents</span>
</a>
<a className="flex flex-col items-center justify-center border-b-[3px] border-transparent px-4 pb-4 pt-4 text-slate-500 hover:text-primary transition-colors" href="#">
<span className="text-sm font-semibold">Fee Payment</span>
</a>
<a className="flex flex-col items-center justify-center border-b-[3px] border-transparent px-4 pb-4 pt-4 text-slate-500 hover:text-primary transition-colors" href="#">
<span className="text-sm font-semibold">Review &amp; Submit</span>
</a>
</div>
</div>

<div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/10 p-6 md:p-8">
<div className="flex items-center gap-2 mb-6 border-l-4 border-primary pl-4">
<h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Step 1: Project Details</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

<div className="col-span-1 md:col-span-2">
<label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Project Name <span className="text-red-500">*</span></label>
<input className="w-full rounded-lg border-primary/20 bg-background-light dark:bg-slate-800 dark:border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-slate-900 dark:text-slate-100" placeholder="e.g., Renewable Solar Park Extension Phase II" type="text"/>
<p className="mt-1 text-xs text-slate-500">Provide a unique and descriptive name for the project.</p>
</div>

<div className="col-span-1">
<label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Project Category <span className="text-red-500">*</span></label>
<div className="grid grid-cols-3 gap-3">
<label className="relative flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors group">
<input className="sr-only peer" name="category" type="radio" value="A"/>
<div className="peer-defaultChecked:bg-primary/10 peer-defaultChecked:border-primary absolute inset-0 rounded-lg border-primary/20 bg-transparent transition-all"></div>
<span className="relative z-10 font-bold peer-defaultChecked:text-primary">A</span>
</label>
<label className="relative flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors group">
<input className="sr-only peer" name="category" type="radio" value="B1"/>
<div className="peer-defaultChecked:bg-primary/10 peer-defaultChecked:border-primary absolute inset-0 rounded-lg border-primary/20 bg-transparent transition-all"></div>
<span className="relative z-10 font-bold peer-defaultChecked:text-primary">B1</span>
</label>
<label className="relative flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors group">
<input className="sr-only peer" name="category" type="radio" value="B2"/>
<div className="peer-defaultChecked:bg-primary/10 peer-defaultChecked:border-primary absolute inset-0 rounded-lg border-primary/20 bg-transparent transition-all"></div>
<span className="relative z-10 font-bold peer-defaultChecked:text-primary">B2</span>
</label>
</div>
</div>

<div className="col-span-1">
<label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Primary Sector <span className="text-red-500">*</span></label>
<select className="w-full rounded-lg border-primary/20 bg-background-light dark:bg-slate-800 dark:border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-slate-900 dark:text-slate-100">
<option disabled="" selected="" value="">Select sector...</option>
<option value="infrastructure">Infrastructure</option>
<option value="mining">Mining</option>
<option value="industry">Industrial Projects</option>
<option value="thermal">Thermal Power</option>
<option value="river-valley">River Valley Projects</option>
</select>
</div>

<div className="col-span-1 md:col-span-2">
<label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Project Brief / Objective</label>
<textarea className="w-full rounded-lg border-primary/20 bg-background-light dark:bg-slate-800 dark:border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-slate-900 dark:text-slate-100" placeholder="Briefly describe the purpose and scope of the project..." rows="4"></textarea>
</div>

<div className="col-span-1 md:col-span-2 flex items-start gap-3 mt-2">
<div className="flex items-center h-5">
<input className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary" id="new-construction" type="checkbox"/>
</div>
<div className="text-sm">
<label className="font-medium text-slate-700 dark:text-slate-300" htmlFor="new-construction">This is a greenfield project (new construction)</label>
<p className="text-slate-500">Check this if no prior construction has taken place at the proposed site.</p>
</div>
</div>
</div>
</div>

<div className="flex items-center justify-between mt-10">
<button className="px-6 py-2.5 rounded-lg border border-primary text-primary font-bold hover:bg-primary/5 transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-[20px]">drafts</span>
                            Save as Draft
                        </button>
<div className="flex gap-4">
<button className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                                Next
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</div>
</div>

<div className="mt-12 p-4 bg-primary/5 rounded-lg border border-primary/10 flex gap-4">
<span className="material-symbols-outlined text-primary">info</span>
<div>
<p className="text-sm font-bold text-slate-900 dark:text-slate-100">Need help?</p>
<p className="text-sm text-slate-600 dark:text-slate-400">Refer to the <a className="text-primary hover:underline" href="#">User Manual</a> or contact technical support at support-parivesh@gov.in for assistance with the application process.</p>
</div>
</div>
</div>
</main>

<footer className="mt-auto py-6 px-10 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
<p>© 2024 Ministry of Environment, Forest and Climate Change. All rights reserved.</p>
<div className="flex gap-6">
<a className="hover:text-primary" href="#">Privacy Policy</a>
<a className="hover:text-primary" href="#">Terms of Service</a>
<a className="hover:text-primary" href="#">Help Desk</a>
</div>
</footer>
</div>
</div>

    </>
  );
};

export default PPPortalNewApplicationForm;
