import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Eye, Pencil, Layers } from 'lucide-react';
import { propertiesApi } from '../api';
import { Property } from '../types';
import { Badge } from '../components/Badge';

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties]   = useState<Property[]>([]);
  const [filtered,   setFiltered]     = useState<Property[]>([]);
  const [search,     setSearch]       = useState('');
  const [loading,    setLoading]      = useState(true);
  const [error,      setError]        = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await propertiesApi.getAll();

        const data = (res as any).data?.data || (res as any).data;
        setProperties(data);
        setFiltered(data);
      } catch {
        setError('Failed to load properties.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Client-side search — no extra API call
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      properties.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      )
    );
  }, [search, properties]);

  // ── Loading skeleton
  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-slate-100 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  // ── Error state
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm">
      {error}
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage locations and view their linked assets
          </p>
        </div>
        <button
          onClick={() => navigate('/properties/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
          <Plus size={16} /> Add Property
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Search by name, type or address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 py-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Building2 size={26} className="text-blue-400" />
          </div>
          <p className="text-slate-700 font-semibold text-base">No properties found</p>
          <p className="text-slate-400 text-sm mt-1">
            {search ? 'Try a different search term' : "Click 'Add Property' to get started"}
          </p>
        </div>
      )}

      {/* Properties grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(property => (
          <div key={property.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">

            {/* Card top */}
            <div className="p-5 border-b border-slate-100 relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 size={18} className="text-blue-600" />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge value={property.status} />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 text-base leading-tight">
                {property.name}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">{property.address}</p>
              <span className="inline-block mt-2 text-xs font-medium text-slate-500
                               bg-slate-100 px-2.5 py-0.5 rounded-full">
                {property.type}
              </span>
            </div>

            {/* Card bottom */}
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600" onClick={() => navigate('/assets')}>
                <Layers size={14} />
                <span className="text-xs font-semibold">
                  {property.assetCount ?? 0} { (property.assetCount ?? 0) === 1 ? 'asset' : 'assets' }
                </span>
              </div>
              <div className="flex items-center gap-1
                              sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => navigate(`/properties/${property.id}/edit`)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Pencil size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Properties;
