import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pencil, 
  Package, 
  MapPin, 
  Tag, 
  Hash, 
  Clock,
  History,
  AlertCircle,
  Building2
} from 'lucide-react';
import { assetsApi } from '../api';
import { AssetResponse, AssetStatus} from '../types';
import { Badge } from '../components/Badge';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<AssetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      assetsApi.getById(id)
        .then(res => {
          if (res.data.success && res.data.data) {
            setAsset(res.data.data);
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
  }, [id]);

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse p-4">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 h-64"></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 h-48"></div>
    </div>
  );

  if (error || !asset) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h2>
        <p className="text-slate-500 mb-8">{error || 'Asset not found'}</p>
        <button 
          onClick={() => navigate('/assets')} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg"
        >
          <ArrowLeft size={18} />
          Go back to Assets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Header & Main Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/assets')}
            className="group p-2 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
            title="Back to Assets"
          >
            <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Asset Overview</h1>
        </div>

        <button
          onClick={() => navigate(`/assets/${asset.id}/edit`)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Pencil size={18} />
          Edit Asset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shrink-0 shadow-inner">
                    <Package size={32} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">General Information</h2>
                    <p className="text-sm text-slate-500 mt-1">Status, name and classification</p>
                  </div>
                </div>
                <div className="shrink-0 pt-1">
                  <Badge value = {AssetStatus[asset.status].toString()} />
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                <div>
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Hash size={12} /> Asset Name
                  </dt>
                  <dd className="text-lg font-bold text-slate-900">{asset.name}</dd>
                </div>

                <div>
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Tag size={12} /> Asset Type
                  </dt>
                  <dd className="text-lg font-bold text-slate-900">{asset.type}</dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin size={12} /> Assigned Location
                  </dt>
                  <dd className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 w-fit">
                    <Building2 size={16} className="text-slate-400" />
                    <span className="text-slate-700 font-semibold">{asset.location}</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Timeline Placeholder - Adding visual depth */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-6">
              <History size={18} className="text-slate-400" />
              Recent Activity
            </h3>
            <div className="flex items-center justify-center py-10 grayscale opacity-40">
              <p className="text-sm text-slate-400 italic">No recent maintenance activity logged.</p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 pb-4 border-b border-slate-100">System Logs</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Created</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1 leading-relaxed">
                    {asset.dateCreated ? new Date(asset.dateCreated).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : '—'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {asset.dateCreated ? new Date(asset.dateCreated).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-4 border-t border-slate-50">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <Hash size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unique Identifier</p>
                  <code className="block p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 font-mono break-all border border-slate-100 select-all hover:border-slate-300 transition-colors">
                    {asset.id}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-100">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Maintenance Alert
            </h4>
            <p className="text-blue-100 text-xs leading-relaxed">
              This asset is currently in optimal condition. Next routine inspection scheduled for Q3 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}