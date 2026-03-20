import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { assetsApi, dashboardApi, tasksApi } from '../api/index';
import { AssetResponse, DashboardResponse, MaintenanceTaskResponse } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package, Clock, Activity, CheckCircle, Wrench } from 'lucide-react';
import { Badge } from '../components/Badge';
import { EmailReminderPanel } from '../components/EmailReminderPanel';

type TaskWithDisplay = MaintenanceTaskResponse & {
  normalizedPriority: string;
  normalizedStatus: string;
};

const normalizeAssetStatus = (status: string | number) => {
  const normalized = String(status).toLowerCase().replace(/\s+/g, '');
  if (normalized === '1' || normalized === 'active') return 'Active';
  if (normalized === '2' || normalized === 'inactive') return 'Inactive';
  if (normalized === '3' || normalized === 'undermaintenance') return 'UnderMaintenance';
  return String(status);
};

const normalizeTaskStatus = (status: string | number) => {
  const normalized = String(status).toLowerCase().replace(/\s+/g, '');
  if (normalized === '1' || normalized === 'pending') return 'Pending';
  if (normalized === '2' || normalized === 'inprogress') return 'InProgress';
  if (normalized === '3' || normalized === 'completed') return 'Completed';
  return String(status);
};

const normalizeTaskPriority = (priority: string | number) => {
  const normalized = String(priority).toLowerCase().replace(/\s+/g, '');
  if (normalized === '1' || normalized === 'low') return 'Low';
  if (normalized === '2' || normalized === 'medium') return 'Medium';
  if (normalized === '3' || normalized === 'high') return 'High';
  return String(priority);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-lg font-bold text-slate-900">{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [tasks, setTasks] = useState<TaskWithDisplay[]>([]);
  
  useEffect(() => { 
    Promise.all([dashboardApi.getStats(), assetsApi.getAll(), tasksApi.getAll()])
      .then(([statsRes, assetsRes, tasksRes]) => {
        if (statsRes.data?.data) setStats(statsRes.data.data);
        setAssets(assetsRes.data?.data || []);
        setTasks(
          (tasksRes.data?.data || []).map(task => ({
            ...task,
            normalizedPriority: normalizeTaskPriority(task.priority),
            normalizedStatus: normalizeTaskStatus(task.status),
          }))
        );
      })
      .catch(console.error); 
  }, []);

  const recentAssets = useMemo(
    () => [...assets].sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()),
    [assets]
  );

  const upcomingTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [tasks]
  );

  if (!stats) return <div className="text-slate-500">Loading...</div>;

  const chartData = [
    { name: 'Pending', count: stats.taskPending, fill: '#f59e0b' },
    { name: 'In Progress', count: stats.taskInProgress, fill: '#6366f1' },
    { name: 'Completed', count: stats.taskCompleted, fill: '#22c55e' },
  ];

  const assetStats = {
    active: recentAssets.filter(a => normalizeAssetStatus(a.status) === 'Active').length,
    maintenance: recentAssets.filter(a => normalizeAssetStatus(a.status) === 'UnderMaintenance' || normalizeAssetStatus(a.status) === 'Under Maintenance').length,
    inactive: recentAssets.filter(a => normalizeAssetStatus(a.status) === 'Inactive').length,
  };

  const totalTasks = stats.taskPending + stats.taskInProgress + stats.taskCompleted;

  const statCards = [
    {
      label: 'Total Assets',
      value: stats.totalAsset,
      icon: Package,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-l-blue-500',
      subtitle: 'Registered across all locations',
    },
    {
      label: 'Total Properties',
      value: stats.totalProperty,
      icon: Package,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-l-blue-500',
      subtitle: 'Registered across all locations',
    },
    {
      label: 'Pending Tasks',
      value: stats.taskPending,
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      borderColor: 'border-l-amber-500',
      subtitle: 'Awaiting action',
    },
    {
      label: 'In Progress',
      value: stats.taskInProgress,
      icon: Activity,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      borderColor: 'border-l-indigo-500',
      subtitle: 'Currently being handled',
    },
    {
      label: 'Completed Tasks',
      value: stats.taskCompleted,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-l-green-500',
      subtitle: 'Closed successfully',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back — here's what's happening today</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Last updated</p>
          <p className="text-sm font-medium text-slate-700">
            {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>


    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {statCards.map(card => (
          <div
            key={card.label}
            className={`bg-white rounded-xl p-5 border border-slate-200 border-l-4 ${card.borderColor} shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
              </div>
              <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <card.icon size={20} className={card.iconColor} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Task Status Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">Distribution of current maintenance tasks</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: 'Pending', color: 'bg-amber-400' },
                { label: 'In Progress', color: 'bg-indigo-500' },
                { label: 'Completed', color: 'bg-green-500' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${l.color}`}></div>
                  <span className="text-xs text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={48} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tickCount={5}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Asset Health</h2>
          <div className="space-y-4">
            {[
              { label: 'Active', count: assetStats.active, total: stats.totalAsset, color: 'bg-green-500' },
              { label: 'Under Maintenance', count: assetStats.maintenance, total: stats.totalAsset, color: 'bg-amber-500' },
              { label: 'Inactive', count: assetStats.inactive, total: stats.totalAsset, color: 'bg-red-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-800">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: item.total > 0 ? `${(item.count / item.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 mt-6 pt-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Task Completion Rate</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-100 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: totalTasks > 0 ? `${(stats.taskCompleted / totalTasks) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-sm font-bold text-slate-800 w-10 text-right">
                {totalTasks > 0 ? Math.round((stats.taskCompleted / totalTasks) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Recent Assets</h2>
            <Link to="/assets" className="text-xs font-medium text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentAssets.slice(0, 5).map(asset => (
              <div key={asset.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Package size={14} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{asset.name}</p>
                    <p className="text-xs text-slate-400 truncate">{asset.type} · {asset.location}</p>
                  </div>
                </div>
                <Badge value={normalizeAssetStatus(asset.status)} />
              </div>
            ))}
            {recentAssets.length === 0 && (
              <p className="text-sm text-slate-400 px-6 py-6 text-center">No assets yet</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Upcoming Tasks</h2>
            <Link to="/tasks" className="text-xs font-medium text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingTasks.slice(0, 5).map(task => {
              const overdue = new Date(task.dueDate) < new Date() && task.normalizedStatus !== 'Completed';
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between px-6 py-3 hover:bg-slate-50 gap-3 ${overdue ? 'bg-red-50' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${overdue ? 'bg-red-100' : 'bg-indigo-100'}`}>
                      <Wrench size={14} className={overdue ? 'text-red-500' : 'text-indigo-600'} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                        {overdue && (
                          <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">OVERDUE</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Due {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <Badge value={task.normalizedPriority} />
                </div>
              );
            })}
            {upcomingTasks.length === 0 && (
              <p className="text-sm text-slate-400 px-6 py-6 text-center">No upcoming tasks</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <EmailReminderPanel upcomingTasks={upcomingTasks.map(task => ({
            title: task.title,
            dueDate: task.dueDate,
            status: task.normalizedStatus,
          }))} />
        </div>
      </div>
    </div>
  );
}