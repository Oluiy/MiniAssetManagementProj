import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetsApi } from '../api';
import { AssetRequest, AssetStatus } from '../types';
import { ArrowLeft } from 'lucide-react';

export default function AssetForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<AssetRequest>({
    name: '',
    type: '',
    location: '',
    status: AssetStatus.Active,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      assetsApi.getById(id)
        .then(res => {
          if (res.data.success && res.data.data) {
            const asset = res.data.data;
            setFormData({
              name: asset.name,
              type: asset.type,
              location: asset.location,
              status: asset.status,
            });
          } else {
            setError(res.data.message || 'Failed to load asset');
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load asset');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEdit && id) {
        await assetsApi.update(id, formData);
      } else {
        await assetsApi.create(formData);
      }
      navigate('/assets');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error && 'response' in err ? (err as {response?: {data?: {message?: string}}}).response?.data?.message || 'Failed to save asset' : 'Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this asset? This will also delete all associated maintenance tasks.')) return;
    
    setSaving(true);
    try {
      await assetsApi.delete(id);
      navigate('/assets');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete asset');
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? Number(value) : value
    }));
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading asset details...</div>;

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-1">{isEdit ? 'Edit Asset' : 'Add New Asset'}</h1>
        <p className="text-sm text-slate-500 mb-8">
          {isEdit ? 'Update the details below' : 'Fill in the details to register a new asset'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Asset Name <span className="text-red-500">*</span>
            </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder:text-slate-400 transition-all"
            placeholder="e.g. HVAC Unit 3"
          />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Asset Type <span className="text-red-500">*</span>
            </label>
          <input
            type="text"
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder:text-slate-400 transition-all"
            placeholder="e.g. Electrical"
          />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder:text-slate-400 transition-all"
            placeholder="e.g. Building A"
          />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value={AssetStatus.Active}>Active</option>
            <option value={AssetStatus.Inactive}>Inactive</option>
            <option value={AssetStatus.UnderMaintenance}>Under Maintenance</option>
          </select>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
                disabled={saving}
              >
                Delete Asset
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}