import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { propertiesApi } from '../api';

const PROPERTY_TYPES = ['Office', 'Warehouse', 'Branch', 'Factory', 'Retail', 'Data Centre', 'Other'];

const PropertyForm = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    name:        '',
    address:     '',
    type:        'Office',
    description: '',
    status:      'Active',
  });
  const [loading,    setLoading]    = useState(false);
  const [fetching,   setFetching]   = useState(isEditing);
  const [error,      setError]      = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Pre-fill form when editing
  useEffect(() => {
    if (!isEditing || !id) return;
    const fetch = async () => {
      try {
        const res = await propertiesApi.getById(id);
        const p = (res as any).data?.data || (res as any).data;
        setForm({
          name:        p.name,
          address:     p.address,
          type:        p.type,
          description: p.description ?? '',
          status:      p.status,
        });
      } catch {
        setError('Failed to load property.');
      } finally {
        setFetching(false);
      }
    };
    fetch();
  }, [id, isEditing]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim())    errs.name    = 'Property name is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.type.trim())    errs.type    = 'Type is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      if (isEditing && id) {
        await propertiesApi.update(id, form);
      } else {
        await propertiesApi.create(form as any);
      }
      navigate('/properties');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
        err?.response?.data?.Message ??
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="max-w-xl mx-auto space-y-4 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-1/4"></div>
      <div className="bg-white rounded-xl border border-slate-200 p-8 h-80"></div>
    </div>
  );

  const field = (
    label: string,
    key: keyof typeof form,
    type: 'text' | 'textarea' = 'text',
    required = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          rows={3}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                     placeholder:text-slate-400 resize-none"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                      placeholder:text-slate-400 transition-all
                      ${fieldErrors[key] ? 'border-red-400' : 'border-slate-200'}`}
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      )}
      {fieldErrors[key] && (
        <p className="text-xs text-red-500 mt-1">{fieldErrors[key]}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={() => navigate('/properties')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Properties
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-1">
          {isEditing ? 'Edit Property' : 'Add New Property'}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          {isEditing ? 'Update the property details below' : 'Register a new property location'}
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {field('Property Name', 'name', 'text', true)}
          {field('Address',       'address', 'text', true)}

          {/* Type dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white
                         focus:ring-2 focus:ring-blue-500 outline-none text-slate-700">
              {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Status dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white
                         focus:ring-2 focus:ring-blue-500 outline-none text-slate-700">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {field('Description (optional)', 'description', 'textarea')}

          <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
            <button type="button" onClick={() => navigate('/properties')}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm
                         font-semibold rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
              {loading
                ? (isEditing ? 'Saving...' : 'Creating...')
                : (isEditing ? 'Save Changes' : 'Create Property')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
