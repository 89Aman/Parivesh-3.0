import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { getApiErrorMessage } from '../services/api';
import applicationService from '../services/applicationService';
import metadataService from '../services/metadataService';

const DRAFT_STORAGE_KEY = 'parivesh-new-application-draft';

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

const requiredFields = ['project_name', 'category', 'sector_id'];

const formSections = [
  {
    title: 'Project Overview',
    description: 'Define the proposal and select the correct sector before moving further.',
  },
  {
    title: 'Project Location',
    description: 'Add the site details so reviewers can immediately understand project geography.',
  },
  {
    title: 'Scale and Capacity',
    description: 'Capture the size of the project in a format the review teams can compare quickly.',
  },
];

const formatDraftTimestamp = (value) => {
  if (!value) return '';

  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '';
  }
};

const hasAnyFormValue = (formData) => Object.values(formData).some((value) => String(value || '').trim());

const inferChecklistCategoryFromSector = (sectorName) => {
  const normalized = String(sectorName || '').trim().toLowerCase();
  if (!normalized) return '';

  if (normalized.includes('infrastructure')) return 'INFRASTRUCTURE';
  if (normalized.includes('industry')) return 'INDUSTRY';
  if (normalized.includes('sand')) return 'SAND';
  if (normalized.includes('brick')) return 'BRICKS';
  if (normalized.includes('limestone')) return 'LIMESTONE';
  if (normalized.includes('mining')) return 'LIMESTONE';

  return '';
};

const PPPortalNewApplicationForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const hasHydratedDraft = useRef(false);

  const [formData, setFormData] = useState(initialFormState);
  const [sectors, setSectors] = useState([]);
  const [isLoadingSectors, setIsLoadingSectors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restoredDraftAt, setRestoredDraftAt] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState('');
  const [checklistCategories, setChecklistCategories] = useState([]);
  const [selectedChecklistCategory, setSelectedChecklistCategory] = useState('');
  const [checklistItems, setChecklistItems] = useState([]);
  const [isLoadingChecklist, setIsLoadingChecklist] = useState(false);

  useEffect(() => {
    const storedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (storedDraft) {
      try {
        const parsedDraft = JSON.parse(storedDraft);
        const restoredFormData = parsedDraft.formData || parsedDraft;
        setFormData((current) => ({ ...current, ...restoredFormData }));
        setRestoredDraftAt(parsedDraft.savedAt || '');
        setLastSavedAt(parsedDraft.savedAt || '');
      } catch {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }

    hasHydratedDraft.current = true;

    let isActive = true;

    const loadSectors = async () => {
      try {
        const [sectorList, categoryList] = await Promise.all([
          metadataService.getSectors(),
          metadataService.getDocumentChecklistCategories(),
        ]);

        if (!isActive) {
          return;
        }

        setSectors(sectorList);
        setChecklistCategories(categoryList || []);
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

  useEffect(() => {
    const selected = sectors.find((sector) => String(sector.id) === String(formData.sector_id));
    const inferred = inferChecklistCategoryFromSector(selected?.name);

    if (!selectedChecklistCategory && inferred) {
      setSelectedChecklistCategory(inferred);
    }
  }, [formData.sector_id, sectors, selectedChecklistCategory]);

  useEffect(() => {
    let isActive = true;

    const loadChecklist = async () => {
      if (!selectedChecklistCategory) {
        setChecklistItems([]);
        return;
      }

      setIsLoadingChecklist(true);
      try {
        const response = await metadataService.getDocumentChecklist(selectedChecklistCategory);
        if (!isActive) {
          return;
        }
        setChecklistItems(response?.items || []);
      } catch (error) {
        if (!isActive) {
          return;
        }
        setChecklistItems([]);
        toast.error(getApiErrorMessage(error, 'Unable to load document checklist.'));
      } finally {
        if (isActive) {
          setIsLoadingChecklist(false);
        }
      }
    };

    loadChecklist();

    return () => {
      isActive = false;
    };
  }, [selectedChecklistCategory, toast]);

  useEffect(() => {
    if (!hasHydratedDraft.current) {
      return;
    }

    if (!hasAnyFormValue(formData)) {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      setLastSavedAt('');
      return;
    }

    const savedAt = new Date().toISOString();
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ formData, savedAt }));
    setLastSavedAt(savedAt);
  }, [formData]);

  useEffect(() => {
    if (!hasAnyFormValue(formData) || isSubmitting) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, isSubmitting]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleGuardedNavigation = (target) => {
    if (
      hasAnyFormValue(formData) &&
      !window.confirm('This draft has not been created on the server yet. Leave this page? Your local copy will stay in this browser.')
    ) {
      return;
    }

    navigate(target);
  };

  const handleClearLocalDraft = () => {
    setFormData(initialFormState);
    setRestoredDraftAt('');
    setLastSavedAt('');
    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    toast.info('Local draft cleared.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.project_name || !formData.category || !formData.sector_id) {
      toast.error('Project name, category, and sector are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await applicationService.createApplication({
        ...formData,
        sector_id: Number(formData.sector_id),
        project_area_ha: formData.project_area_ha ? Number(formData.project_area_ha) : null,
      });

      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      toast.success('Application draft created.');
      navigate(`/pp/application/${created.id}`, {
        replace: true,
        state: { fromCreate: true },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to create application.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedFieldCount = Object.values(formData).filter((value) => String(value || '').trim()).length;
  const requiredCompletedCount = requiredFields.filter((field) => String(formData[field] || '').trim()).length;
  const completionPercent = Math.round((completedFieldCount / Object.keys(initialFormState).length) * 100);
  const selectedSector = sectors.find((sector) => String(sector.id) === String(formData.sector_id));

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <header className="border-b border-primary/10 bg-white px-6 py-3 md:px-20 lg:px-40">
        <div className="flex items-center justify-between gap-4">
          <button className="flex items-center gap-4 text-primary" onClick={() => handleGuardedNavigation('/pp/dashboard')} type="button">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined">eco</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">PARIVESH 3.0</h2>
          </button>
          <nav className="hidden items-center gap-6 md:flex">
            <button className="text-sm font-medium text-slate-600 hover:text-primary" onClick={() => handleGuardedNavigation('/pp/dashboard')} type="button">
              Dashboard
            </button>
            <button className="text-sm font-medium text-slate-600 hover:text-primary" onClick={() => handleGuardedNavigation('/pp/applications')} type="button">
              Applications
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-10 md:px-10">
        <div className="mx-auto grid w-full max-w-6xl gap-8 xl:grid-cols-[1.5fr_0.8fr]">
          <div className="flex flex-col gap-8">
            {restoredDraftAt ? (
              <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-bold">Local draft restored</p>
                  <p className="mt-1 text-amber-800">Your unsent application draft from {formatDraftTimestamp(restoredDraftAt)} is ready to continue.</p>
                </div>
                <button className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-2 font-semibold text-amber-900 hover:bg-amber-100" onClick={handleClearLocalDraft} type="button">
                  Clear local draft
                </button>
              </section>
            ) : null}

            <div className="flex flex-col gap-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                <span className="material-symbols-outlined text-sm">layers</span>
                Step 1 of 3
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Create a clean first draft</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-500">
                Build the proposal once, keep a local copy automatically while you type, and continue refinement from the application detail screen without losing context.
              </p>
            </div>

            <form className="rounded-2xl border border-primary/10 bg-white p-6 shadow-glass md:p-8" onSubmit={handleSubmit}>
              <div className="mb-8 grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2 rounded-2xl border border-primary/10 bg-primary/[0.03] p-5">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{formSections[0].title}</p>
                      <p className="mt-1 text-sm text-slate-500">{formSections[0].description}</p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">Required first</div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="project_name">
                        Project Name
                      </label>
                      <input className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" id="project_name" name="project_name" onChange={handleChange} placeholder="Renewable Solar Park Extension Phase II" type="text" value={formData.project_name} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="category">
                        Category
                      </label>
                      <select className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" id="category" name="category" onChange={handleChange} value={formData.category}>
                        <option value="A">A</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="sector_id">
                        Sector
                      </label>
                      <select className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" disabled={isLoadingSectors} id="sector_id" name="sector_id" onChange={handleChange} value={formData.sector_id}>
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
                      <textarea className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" id="project_description" name="project_description" onChange={handleChange} placeholder="Briefly describe the scope, output, and environmental context." rows="4" value={formData.project_description} />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="mb-5">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-700">{formSections[1].title}</p>
                    <p className="mt-1 text-sm text-slate-500">{formSections[1].description}</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {['state', 'district', 'taluk', 'village', 'pincode'].map((field) => (
                      <div key={field}>
                        <label className="mb-2 block text-sm font-semibold capitalize text-slate-700" htmlFor={field}>
                          {field}
                        </label>
                        <input className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" id={field} name={field} onChange={handleChange} value={formData[field]} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-700">{formSections[2].title}</p>
                    <p className="mt-1 text-sm text-slate-500">{formSections[2].description}</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="project_area_ha">
                        Project Area (ha)
                      </label>
                      <input className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" id="project_area_ha" name="project_area_ha" onChange={handleChange} step="0.01" type="number" value={formData.project_area_ha} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="capacity">
                        Capacity
                      </label>
                      <input className="w-full rounded-lg border border-primary/20 bg-slate-50 p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" id="capacity" name="capacity" onChange={handleChange} placeholder="50 MW / 1.2 MTPA / etc." value={formData.capacity} />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-700">Required Documents Checklist</p>
                      <p className="mt-1 text-sm text-slate-500">Choose a checklist category to preview mandatory document set for this application type.</p>
                    </div>
                    <div className="w-full max-w-xs">
                      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="checklist-category">
                        Checklist Category
                      </label>
                      <select
                        className="w-full rounded-lg border border-primary/20 bg-white p-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        id="checklist-category"
                        name="checklist-category"
                        onChange={(event) => setSelectedChecklistCategory(event.target.value)}
                        value={selectedChecklistCategory}
                      >
                        <option value="">Select checklist category</option>
                        {checklistCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isLoadingChecklist ? (
                    <p className="text-sm text-slate-500">Loading checklist...</p>
                  ) : checklistItems.length === 0 ? (
                    <p className="text-sm text-slate-500">No checklist selected yet. Pick a checklist category to view required documents.</p>
                  ) : (
                    <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="w-16 px-3 py-2 text-[11px] font-bold uppercase text-slate-500">S.No</th>
                            <th className="px-3 py-2 text-[11px] font-bold uppercase text-slate-500">Document Required</th>
                            <th className="w-32 px-3 py-2 text-[11px] font-bold uppercase text-slate-500">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {checklistItems.map((item) => (
                            <tr key={`${selectedChecklistCategory}-${item.s_no}`} className="border-t border-slate-100 align-top">
                              <td className="px-3 py-2 text-xs text-slate-600">{item.s_no}</td>
                              <td className="px-3 py-2 text-sm text-slate-800">{item.document_required}</td>
                              <td className="px-3 py-2 text-xs text-slate-500">{item.remarks || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse justify-between gap-4 border-t border-primary/10 pt-6 sm:flex-row sm:items-center">
                <button className="text-left text-sm font-semibold text-slate-500 hover:text-primary" onClick={() => handleGuardedNavigation('/pp/dashboard')} type="button">
                  Cancel and return to dashboard
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70" disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Creating Draft...' : 'Create Draft Application'}
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>

          <aside className="flex flex-col gap-6 xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-glass">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Draft Health</p>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">{completionPercent}% complete</h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">task_alt</span>
                </div>
              </div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light" style={{ width: `${completionPercent}%` }} />
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span>Required fields</span>
                  <span className="font-bold text-slate-900">{requiredCompletedCount}/{requiredFields.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span>Selected sector</span>
                  <span className="max-w-[10rem] truncate font-bold text-slate-900">{selectedSector?.name || 'Pending'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span>Autosave</span>
                  <span className="font-bold text-emerald-600">{lastSavedAt ? formatDraftTimestamp(lastSavedAt) : 'On in this tab'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">What happens next</p>
              <div className="mt-4 space-y-4">
                {[
                  'Create the draft and land on the application detail page immediately.',
                  'Review and refine any metadata before final submission.',
                  'Submit only when the project description and location look complete.',
                ].map((item, index) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PPPortalNewApplicationForm;