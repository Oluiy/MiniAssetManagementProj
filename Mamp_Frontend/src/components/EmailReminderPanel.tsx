import { useState } from 'react';
import { Bell, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { notificationApi } from '../api';

type ReminderStatus = 'idle' | 'loading' | 'success' | 'error';

interface EmailReminderPanelProps {
  upcomingTasks?: Array<{ title: string; dueDate: string; status: string | number }>;
}

export const EmailReminderPanel = ({ upcomingTasks = [] }: EmailReminderPanelProps) => {
  const [daysAhead, setDaysAhead] = useState(3);
  const [status, setStatus] = useState<ReminderStatus>('idle');
  const [message, setMessage] = useState('');

  const tasksInWindow = upcomingTasks.filter(task => {
    const statusValue = String(task.status).toLowerCase().replace(/\s+/g, '');
    if (statusValue === 'completed' || statusValue === '3') return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() + daysAhead);
    return due >= now && due <= cutoff;
  });

  const sendReminders = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const res = await notificationApi.sendReminder(daysAhead);
      const successMessage =
        res.data?.message ??
        res.data?.Message ??
        `Reminders sent successfully for tasks due in the next ${daysAhead} day${daysAhead > 1 ? 's' : ''}.`;

      setMessage(successMessage);
      setStatus('success');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ??
        err?.response?.data?.Message ??
        err?.response?.data?.title ??
        'Failed to send reminders. Please check your connection and try again.';

      setMessage(errorMessage);
      setStatus('error');
    } finally {
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 6000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Bell size={18} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Email Reminders</h2>
          <p className="text-xs text-slate-400">Notify assignees of upcoming maintenance tasks</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Send reminders for tasks due within
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={daysAhead}
              onChange={e => setDaysAhead(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
            <span className="text-sm text-slate-500">from today</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
          <Bell size={14} className="text-slate-400 shrink-0" />
          <p className="text-sm text-slate-600">
            {tasksInWindow.length > 0 ? (
              <>
                <span className="font-semibold text-slate-800">{tasksInWindow.length}</span> task{tasksInWindow.length > 1 ? 's' : ''} will trigger a reminder
              </>
            ) : (
              <span className="text-slate-400">No tasks due in this window</span>
            )}
          </p>
        </div>

        {status === 'success' && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle size={16} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <p className="text-sm text-red-700">{message}</p>
          </div>
        )}

        <button
          onClick={sendReminders}
          disabled={status === 'loading'}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {status === 'loading' ? (
            <>
              <Loader size={16} className="animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send size={16} /> Send Reminders
            </>
          )}
        </button>
      </div>
    </div>
  );
};