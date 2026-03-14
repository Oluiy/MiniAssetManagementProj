import { useEffect, useState } from 'react';
import { assetsApi } from '../api';
import { AssetResponse, AssetStatus } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, Plus, Search } from 'lucide-react';
import { Badge } from '../components/Badge';

export default function Assets() {
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    assetsApi.getAll()
      .then(res => setAssets(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusValue = (status: AssetStatus | string | number) => {
    const s = String(status).toLowerCase().replace(/\s+/g, '');
    if (s === String(AssetStatus.Active) || s === 'active') return 'Active';
    if (s === String(AssetStatus.Inactive) || s === 'inactive') return 'Inactive';
    if (s === String(AssetStatus.UnderMaintenance) || s === 'undermaintenance') return 'UnderMaintenance';
    return 'Unknown';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this asset? This will also delete all associated maintenance tasks.')) return;
    
    try {
      await assetsApi.delete(id);
      setAssets(assets.filter(a => a.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete asset');
    }
  };

  const filteredAssets = assets.filter(asset => {
    const statusValue = getStatusValue(asset.status);
    const label = statusValue === 'UnderMaintenance' ? 'Under Maintenance' : statusValue;
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.type.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || label === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="text-slate-500">Loading assets...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and monitor your physical assets</p>
        </div>
        <button
          onClick={() => navigate('/assets/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus size={16} />
          Add New Asset
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Search by name or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Under Maintenance</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-12">S/N</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Name</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Location</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-sm text-slate-500">
                    No assets found for the current filters.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, i) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-400">{i + 1}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">{asset.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{asset.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{asset.location}</td>
                    <td className="px-6 py-4">
                      <Badge value={getStatusValue(asset.status)} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/assets/${asset.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 focus:text-blue-600 focus:bg-blue-50 rounded-lg outline-none transition-colors"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          to={`/assets/${asset.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 focus:text-indigo-600 focus:bg-indigo-50 rounded-lg outline-none transition-colors"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 rounded-lg outline-none transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {filteredAssets.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">No assets found for the current filters.</p>
          ) : (
            filteredAssets.map(asset => (
              <div key={asset.id} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2 gap-3">
                  <span className="font-semibold text-slate-900 text-sm">{asset.name}</span>
                  <Badge value={getStatusValue(asset.status)} />
                </div>
                <p className="text-xs text-slate-500">{asset.type} · {asset.location}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    className="flex-1 text-xs py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/assets/${asset.id}/edit`)}
                    className="flex-1 text-xs py-1.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="flex-1 text-xs py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}