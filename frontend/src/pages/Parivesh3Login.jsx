import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useToast } from '../components/ToastProvider';

const Parivesh3Login = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    console.log(credentialResponse);
    toast.success('Logged in successfully with Google!');
    navigate('/pp/dashboard');
  };

  const handleGoogleError = () => {
    toast.error('Google Login Failed. Please try again.');
  };
  return (
    <>
      
<main className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden">

<section className="relative w-full lg:w-[60%] min-h-[40vh] lg:min-h-screen flex flex-col justify-end p-8 lg:p-20 overflow-hidden">

<div className="absolute inset-0 z-0">
<div className="absolute inset-0 hero-gradient z-10"></div>
<img alt="Aerial view of lush green Indian forest canopy" className="w-full h-full object-cover" data-alt="Aerial view of lush green Indian forest canopy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAr7XSmAVNrOXi6Js67YGC-5tSbGA1hwrUD7yH7Jm2o8VRWiW7fqETXN1Z9xGiDukxKUJ98bCPkgyJP7WBNW92mPXpzMAV9BrFtWFP4tz7h_I1RYATK7zHS8meLChkCx_o7STfeWIq7TP9LGg0bDuWsoxbwPgFKSVHIl26fEg04VdKS0_oPl3ZP8XsGsrvp77LlP8lKp75QJu5XoDoYaZXhzFVudTt2l9H9AGYIkl7kEl1s5vFdvsWlqoxa2fDjfWJ7HAMlG-wgsg"/>
</div>

<div className="relative z-20 flex flex-col gap-6 max-w-2xl">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-5xl lg:text-6xl">eco</span>
<h1 className="text-white text-5xl lg:text-7xl font-black tracking-tighter">
                        PARIVESH 3.0
                    </h1>
</div>
<h2 className="text-white/90 text-xl lg:text-2xl font-light leading-relaxed max-w-lg">
                    Next-Generation Environmental Clearance System for Sustainable Development.
                </h2>

<div className="flex flex-wrap gap-3 mt-4">
<div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-white text-sm font-medium border-white/20">
<span className="material-symbols-outlined text-primary text-lg">lock</span>
                        Secure RBAC
                    </div>
<div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-white text-sm font-medium border-white/20">
<span className="material-symbols-outlined text-primary text-lg">bolt</span>
                        Real-time Tracking
                    </div>
<div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-white text-sm font-medium border-white/20">
<span className="material-symbols-outlined text-primary text-lg">description</span>
                        Auto-Generated MoM
                    </div>
</div>
</div>

<div className="relative z-20 mt-12 pt-8 border-t border-white/10 flex items-center gap-4">
<div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-xl">account_balance</span>
</div>
<p className="text-white/60 text-xs tracking-widest uppercase">Ministry of Environment, Forest and Climate Change</p>
</div>
</section>

<section className="w-full lg:w-[40%] flex flex-col items-center justify-center p-6 lg:p-12 bg-background-light dark:bg-background-dark">
<div className="w-full max-w-md flex flex-col gap-8">
<div className="flex flex-col gap-2">
<h3 className="text-3xl font-bold text-slate-900 dark:text-white">Portal Login</h3>
<p className="text-slate-500 dark:text-slate-400">Select your role and enter credentials to proceed.</p>
</div>

<div className="grid grid-cols-2 gap-3">
<Link to="/admin/dashboard" className="flex flex-col items-start p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary hover:shadow-[0_0_15px_rgba(23,207,109,0.3)] transition-all group active:scale-95">
<span className="material-symbols-outlined text-slate-400 group-hover:text-primary mb-2 transition-colors">admin_panel_settings</span>
<span className="text-sm font-bold text-slate-700 dark:text-slate-200">Admin</span>
</Link>
<Link to="/pp/dashboard" className="flex flex-col items-start p-4 rounded-xl border-2 border-primary bg-primary/5 shadow-[0_0_15px_rgba(23,207,109,0.2)] transition-all active:scale-95">
<span className="material-symbols-outlined text-primary mb-2">engineering</span>
<span className="text-sm font-bold text-slate-900 dark:text-white">Proponent</span>
</Link>
<Link to="/committee/scrutiny" className="flex flex-col items-start p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary hover:shadow-[0_0_15px_rgba(23,207,109,0.3)] transition-all group active:scale-95">
<span className="material-symbols-outlined text-slate-400 group-hover:text-primary mb-2 transition-colors">fact_check</span>
<span className="text-sm font-bold text-slate-700 dark:text-slate-200">Scrutiny</span>
</Link>
<Link to="/committee/mom-editor" className="flex flex-col items-start p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary hover:shadow-[0_0_15px_rgba(23,207,109,0.3)] transition-all group active:scale-95">
<span className="material-symbols-outlined text-slate-400 group-hover:text-primary mb-2 transition-colors">history_edu</span>
<span className="text-sm font-bold text-slate-700 dark:text-slate-200">MoM Team</span>
</Link>
</div>

<form className="flex flex-col gap-5">
<div className="relative">
<input className="peer block w-full px-4 pt-6 pb-2 text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl focus:ring-2 focus:ring-primary transition-all" id="email" name="email" placeholder=" " type="email"/>
<label className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3" htmlFor="email">
                            Email Address
                        </label>
</div>
<div className="relative">
<input className="peer block w-full px-4 pt-6 pb-2 text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl focus:ring-2 focus:ring-primary transition-all" id="password" name="password" placeholder=" " type="password"/>
<label className="absolute text-sm text-slate-500 dark:text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3" htmlFor="password">
                            Password
                        </label>
</div>
<div className="flex items-center justify-between px-1">
<label className="flex items-center gap-2 cursor-pointer">
<input className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary focus:ring-2" type="checkbox"/>
<span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
</label>
<a className="text-sm font-semibold text-primary hover:underline" href="#">Forgot password?</a>
</div>
<button className="w-full h-14 bg-gradient-to-r from-primary to-[#12a356] hover:from-[#12a356] hover:to-primary text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]" type="submit">
                        Sign In to Dashboard
                        <span className="material-symbols-outlined">arrow_forward</span>
</button>
</form>
<div className="flex flex-col items-center gap-4 mt-6">
  <div className="flex items-center gap-4 w-full">
    <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-1"></div>
    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">Or login with</span>
    <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-1"></div>
  </div>
  
  <div className="w-full flex justify-center mt-2">
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      theme="filled_blue"
      shape="pill"
      size="large"
      width="340"
    />
  </div>

<p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                        Don't have an account? <a className="text-primary font-bold hover:underline" href="#">Register New Project</a>
</p>
<div className="flex items-center gap-6 mt-6">
<button className="text-slate-400 hover:text-primary transition-colors">
<span className="material-symbols-outlined">support_agent</span>
</button>
<button className="text-slate-400 hover:text-primary transition-colors">
<span className="material-symbols-outlined">menu_book</span>
</button>
<button className="text-slate-400 hover:text-primary transition-colors">
<span className="material-symbols-outlined">video_library</span>
</button>
</div>
</div>
</div>
</section>
</main>

    </>
  );
};

export default Parivesh3Login;
