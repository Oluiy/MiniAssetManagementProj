import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { tasksApi, assetsApi } from '../api';
import { MaintenanceTaskRequest, MaintenancePriority, MaintenanceStatus, AssetResponse } from '../types';
import { ArrowLeft } from 'lucide-react';

export default function TaskForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);

  const queryParams = new URLSearchParams(location.search);
  const initialAssetId = queryParams.get('assetId') || '';

  const [formData, setFormData] = useState<MaintenanceTaskRequest>({
    title: '',
    description: '',
    assetId: initialAssetId,
    priority: MaintenancePriority.Medium,
    status: MaintenanceStatus.Pending,
    dueDate: new Date().toISOString().slice(0, 16),
  });
  
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch assets for the dropdown
    assetsApi.getAll()
      .then(res => {
        if (res.data.success && res.data.data) {
          setAssets(res.data.data);
          // Only set default asset if NOT in edit mode
          if (!isEdit && !formData.assetId && res.data.data.length > 0) {
            setFormData(prev => ({ ...prev, assetId: res.data.data![0].id }));
          }
        }
      })
      .catch(err => console.error('Failed to load assets', err));
  }, [isEdit]); // Removed formData.assetId dependency to prevent loops

  useEffect(() => {
    // Load existing task if edit mode
    if (isEdit && id) {
      setLoading(true);
      tasksApi.getById(id)
        .then(res => {
          const task = res.data.data;
          if (!task) {
            setError('Task not found');
            return;
          }
          
          const mapTextToEnum = (text: string, type: 'priority' | 'status') => {
            const t = String(text).trim().toLowerCase();
            if (type === 'priority') {
              if (t === 'low') return MaintenancePriority.Low;
              if (t === 'medium') return MaintenancePriority.Medium;
              if (t === 'high') return MaintenancePriority.High;
            } else {
              if (t === 'pending') return MaintenanceStatus.Pending;
              if (t === 'inprogress') return MaintenanceStatus.InProgress;
              if (t === 'completed') return MaintenanceStatus.Completed;
            }
            return Number(text); // Fallback to raw value if it's already a number
          };

          setFormData({
            title: task.title || '',
            description: task.description || '',
            assetId: task.assetId || '',
            priority: mapTextToEnum(task.priority as unknown as string, 'priority'),
            status: mapTextToEnum(task.status as unknown as string, 'status'),
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          });
        })
        .catch(err => {
          console.error('Error fetching task:', err);
          setError('Failed to load task');
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
        // Send updates sequentially to avoid race conditions on the same task row.
        await tasksApi.updatePriority(id, formData.priority);
        await tasksApi.updateStatus(id, formData.status);
      } else {
        await tasksApi.create({
          ...formData,
          dueDate: new Date(formData.dueDate).toISOString()
        });
      }
      navigate('/tasks');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error && 'response' in err ? ((err as any).response?.data?.message || 'Failed to save task') : 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this task?')) return;
    
    setSaving(true);
    try {
      await tasksApi.delete(id);
      navigate('/tasks');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete task');
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'priority' || name === 'status') ? Number(value) : value
    }));
  };

  if (loading) return <div className="p-12 flex justify-center text-slate-500">Loading task details...</div>;

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-1">{isEdit ? 'Edit Task' : 'Create New Task'}</h1>
        <p className="text-sm text-slate-500 mb-8">
          {isEdit ? 'Update task status and priority.' : 'Fill in the details to assign a new maintenance task'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {isEdit && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 text-sm text-blue-700">
            <strong>Note:</strong> Due to API limitations, only Status and Priority can be updated for existing tasks.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
          <input
            type="text"
            name="title"
            required
            disabled={isEdit}
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder:text-slate-400 transition-all disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="e.g. Filter Replacement"
          />
          </div>
        

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
          <textarea
            name="description"
            required
            rows={3}
            disabled={isEdit}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder:text-slate-400 transition-all disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="Provide task details..."
          />
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Target Asset <span className="text-red-500">*</span>
            </label>
            <select
              name="assetId"
              value={formData.assetId}
              onChange={handleChange}
              disabled={isEdit}
              required
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="" disabled>Select an Asset</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5">
               Due Date <span className="text-red-500">*</span>
             </label>
            <input
              type="datetime-local"
              name="dueDate"
              required
              disabled={isEdit}
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value={MaintenancePriority.Low}>Low</option>
              <option value={MaintenancePriority.Medium}>Medium</option>
              <option value={MaintenancePriority.High}>High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value={MaintenanceStatus.Pending}>Pending</option>
              <option value={MaintenanceStatus.InProgress}>In Progress</option>
              <option value={MaintenanceStatus.Completed}>Completed</option>
            </select>
          </div>
        </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
                disabled={saving}
              >
                Delete Task
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
              {saving ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}