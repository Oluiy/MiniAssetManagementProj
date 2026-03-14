import { useEffect, useState } from 'react';
import { assetsApi, tasksApi } from '../api';
import { MaintenanceTaskResponse } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../components/Badge';

interface ExtendedTask extends MaintenanceTaskResponse {
  assetName?: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        setLoading(true);
        // Fetch all tasks using the new global endpoint
        const tasksRes = await tasksApi.getAll();
        const tasksPayload = tasksRes.data?.data || [];

        // Fetch assets to map assetId to assetName
        let assetMap = new Map<string, string>();
        try {
          const assetsRes = await assetsApi.getAll();
          const assets = assetsRes.data?.data || [];
          assetMap = new Map(assets.map(a => [a.id, a.name]));
        } catch (e) {
          console.error('Failed to fetch assets for mapping', e);
        }

        const allTasks = tasksPayload.map((t: MaintenanceTaskResponse) => ({
          ...t,
          assetName: assetMap.get(t.assetId) || t.assetId || 'Unknown Asset',
        }));

        setTasks(allTasks);
      } catch (err) {
        setError('Failed to load tasks.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTasks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this maintenance task?')) return;
    try {
      await tasksApi.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const getPriorityValue = (priority: string | number) => {
    switch (String(priority).toLowerCase()) {
      case '1':
      case 'low':
        return 'Low';
      case '2':
      case 'medium':
        return 'Medium';
      case '3':
      case 'high':
        return 'High';
      default:
        return String(priority);
    }
  };

  const formatStatus = (status: string) => {
    if (status === 'InProgress') return 'In Progress';
    return status;
  };

  const getStatusValue = (status: string | number) => {
    switch (String(status).toLowerCase()) {
      case '1':
      case 'pending':
        return 'Pending';
      case '2':
      case 'inprogress':
        return 'InProgress';
      case '3':
      case 'completed':
        return 'Completed';
      default:
        return String(status);
    }
  };

  if (loading) return <div className="flex justify-center p-12 text-gray-500">Loading tasks...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage all maintenance operations</p>
        </div>
        <Link
          to="/tasks/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus size={16} />
          Assign New Task
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-12">S/N</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Title</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Asset</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Priority</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Due Date</th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                      <p>No maintenance tasks found.</p>
                    </div>
                  </td>
                </tr>
              ) : tasks.map((task, index) => {
                const statusValue = getStatusValue(task.status);
                const formattedStatus = formatStatus(statusValue);
                const priorityValue = getPriorityValue(task.priority);
                const isOverdue = task.dueDate
                  ? new Date(task.dueDate) < new Date() && statusValue !== 'Completed'
                  : false;

                return (
                <tr key={task.id} className={`hover:bg-slate-50 transition-colors group ${isOverdue ? 'bg-red-50/60' : ''}`}>
                  <td className="px-6 py-4 text-sm text-slate-400">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{task.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.description && <div className="text-sm text-slate-500 truncate max-w-xs">{task.description}</div>}
                      {isOverdue && (
                        <span className="text-[10px] font-semibold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">OVERDUE</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{task.assetName}</div>
                    {task.assetName?.includes('-') && (
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {task.assetId.slice(0, 8)}...</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge value={priorityValue} />
                  </td>
                  <td className="px-6 py-4">
                    <Badge value={formattedStatus} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'}) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/tasks/${task.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 focus:text-indigo-600 focus:bg-indigo-50 rounded-lg outline-none transition-colors"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 rounded-lg outline-none transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {tasks.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">No maintenance tasks found.</p>
          ) : (
            tasks.map(task => {
              const statusValue = getStatusValue(task.status);
              const priorityValue = getPriorityValue(task.priority);
              const isOverdue = task.dueDate
                ? new Date(task.dueDate) < new Date() && statusValue !== 'Completed'
                : false;

              return (
                <div key={task.id} className={`px-4 py-4 ${isOverdue ? 'bg-red-50/60' : ''}`}>
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <span className="font-semibold text-slate-900 text-sm tracking-tight">{task.title}</span>
                    <Badge value={formatStatus(statusValue)} />
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xs font-medium text-slate-700">{task.assetName}</span>
                    {task.assetName?.includes('-') && (
                      <span className="text-[9px] text-slate-400 font-mono italic">(ID: {task.assetId.slice(0, 4)}...)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge value={priorityValue} />
                    {isOverdue && (
                      <span className="text-[10px] font-semibold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">OVERDUE</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[11px] text-slate-500 font-medium">
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A'}
                    </p>
                    <div className="flex gap-2">
                       <button
                        onClick={() => navigate(`/tasks/${task.id}/edit`)}
                        className="text-[11px] px-3 py-1 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-[11px] px-3 py-1 border border-red-100 rounded-lg text-red-500 font-semibold hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}