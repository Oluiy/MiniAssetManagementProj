import { useEffect, useState } from 'react';
import { assetsApi } from '../api';
import { AssetResponse, AssetStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, Plus, Search, Package, MapPin, Tag, Filter, ArrowLeft } from 'lucide-react';
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
    if (s === String(AssetStatus.UnderMaintenance) || s === 'undermaintenance') return 'Under Maintenance';
    return 'Unknown';
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    
    try {
      await assetsApi.delete(id);
      setAssets(assets.filter(a => a.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete asset');
    }
  };

  const filteredAssets = assets.filter(asset => {
    const label = getStatusValue(asset.status);
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.type.toLowerCase().includes(search.toLowerCase()) ||
      asset.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || label === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse p-4">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-10 bg-slate-200 rounded w-32"></div>
      </div>
      <div className="h-12 bg-slate-100 rounded-xl"></div>
      <div className="bg-white rounded-2xl border border-slate-200 h-96"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/properties')}
            className="group p-2 grid-cols-2 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
            title="Back to properties"
          >
            <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900" />
          </button>
        </div>
      </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Assets</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <Package size={14} className="text-slate-400" />
            Total of {assets.length} equipment registered
          </p>
        </div>
        <button
          onClick={() => navigate('/assets/new')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 text-sm"
        >
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-11 pr-4 py-2.5 text-sm border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            placeholder="Search by name, type or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="w-full pl-9 pr-8 py-2.5 text-sm border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-600 font-medium transition-all"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Status: All</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Under Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest px-8 py-4 w-16">Ref</th>
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest px-6 py-4">Asset Detail</th>
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest px-6 py-4">Type</th>
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest px-6 py-4">Location</th>
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest px-6 py-4">Status</th>
                <th className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest px-8 py-4">Option</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-dashed border-slate-200">
                        <Search size={24} className="text-slate-300" />
                      </div>
                      <p className="text-slate-900 font-bold text-lg">No equipment found</p>
                      <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, i) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 text-slate-400 font-mono text-xs">#{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 leading-tight">{asset.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-30">{asset.id.split('-')[0]}..</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Tag size={12} className="text-slate-300" />
                        <span className="text-sm text-slate-600 font-medium">{asset.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-slate-300" />
                        <span className="text-sm text-slate-600 font-medium">{asset.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge value={getStatusValue(asset.status)} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/assets/${asset.id}`)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 hover:shadow-sm"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/assets/${asset.id}/edit`)}
                          title="Edit Equipment"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 hover:shadow-sm"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id, asset.name)}
                          title="Delete Asset"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 hover:shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
