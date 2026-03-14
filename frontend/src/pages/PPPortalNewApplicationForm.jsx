import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { getApiErrorMessage } from '../services/api';
import applicationService from '../services/applicationService';
import metadataService from '../services/metadataService';

const initialFormState = {
  project_name: '',
  project_description: '',
  category: 'A',
  sector_id: '',
  state: '',
  district: '',
  taluk: '',
  village: '',
  pincode: '',
  project_area_ha: '',
  capacity: '',
};

const PPPortalNewApplicationForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState(initialFormState);
  const [sectors, setSectors] = useState([]);
  const [isLoadingSectors, setIsLoadingSectors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadSectors = async () => {
      try {
        const sectorList = await metadataService.getSectors();

        if (!isActive) {
          return;
        }

        setSectors(sectorList);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load sector metadata.'));
      } finally {
        if (isActive) {
          setIsLoadingSectors(false);
        }
      }
    };

    loadSectors();

    return () => {
      isActive = false;
    };
  }, [toast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.project_name || !formData.category || !formData.sector_id) {
      toast.error('Project name, category, and sector are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await applicationService.createApplication({
        ...formData,
        sector_id: Number(formData.sector_id),
        project_area_ha: formData.project_area_ha ? Number(formData.project_area_ha) : null,
      });
      toast.success('Application draft created.');
      navigate('/pp/applications', { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to create application.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <header className="border-b border-primary/10 bg-white px-6 py-3 md:px-20 lg:px-40">
        <div className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-4 text-primary" to="/pp/dashboard">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined">eco</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">PARIVESH 3.0</h2>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link className="text-sm font-medium text-slate-600 hover:text-primary" to="/pp/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm font-medium text-slate-600 hover:text-primary" to="/pp/applications">
              Applications
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-10 md:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">New Application</h1>
            <p className="text-sm text-slate-500">
              This form now posts directly to the PP application API to create a draft record.
            </p>
          </div>

          <form className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm md:p-8" onSubmit={handleSubmit}>
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="project_name">
                  Project Name
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="project_name"
                  name="project_name"
                  onChange={handleChange}
                  placeholder="Renewable Solar Park Extension Phase II"
                  type="text"
                  value={formData.project_name}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="category">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="category"
                  name="category"
                  onChange={handleChange}
                  value={formData.category}
                >
                  <option value="A">A</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="sector_id">
                  Sector
                </label>
                <select
                  className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isLoadingSectors}
                  id="sector_id"
                  name="sector_id"
                  onChange={handleChange}
                  value={formData.sector_id}
                >
                  <option value="">{isLoadingSectors ? 'Loading sectors...' : 'Select sector'}</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="project_description">
                  Project Description
                </label>
                <textarea
                  className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="project_description"
                  name="project_description"
                  onChange={handleChange}
                  placeholder="Briefly describe the scope, output, and environmental context."
                  rows="4"
                  value={formData.project_description}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="state">
                  State
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="state"
                  name="state"
                  onChange={handleChange}
                  value={formData.state}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="district">
                  District
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="district"
                  name="district"
                  onChange={handleChange}
                  value={formData.district}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="taluk">
                  Taluk
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="taluk"
                  name="taluk"
                  onChange={handleChange}
                  value={formData.taluk}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="village">
                  Village
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="village"
                  name="village"
                  onChange={handleChange}
                  value={formData.village}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="pincode">
                  Pincode
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="pincode"
                  name="pincode"
                  onChange={handleChange}
                  value={formData.pincode}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="project_area_ha">
                  Project Area (ha)
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="project_area_ha"
                  name="project_area_ha"
                  onChange={handleChange}
                  step="0.01"
                  type="number"
                  value={formData.project_area_ha}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="capacity">
                  Capacity
                </label>
                <input
                  className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="capacity"
                  name="capacity"
                  onChange={handleChange}
                  placeholder="50 MW / 1.2 MTPA / etc."
                  value={formData.capacity}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse justify-between gap-4 border-t border-primary/10 pt-6 sm:flex-row sm:items-center">
              <Link className="text-sm font-semibold text-slate-500 hover:text-primary" to="/pp/dashboard">
                Cancel and return to dashboard
              </Link>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Creating Draft...' : 'Create Draft Application'}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PPPortalNewApplicationForm;
