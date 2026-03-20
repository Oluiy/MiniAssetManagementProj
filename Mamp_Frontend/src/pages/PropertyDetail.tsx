import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Pencil, Plus, Eye, MapPin, Tag, Calendar, Package } from 'lucide-react';
import { propertiesApi } from '../api';
import { Property } from '../types';
import { Badge } from '../components/Badge';

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const assets = property?.assets || [];

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await propertiesApi.getById(id);
        setProperty((res as any).data?.data || (res as any).data);
      } catch {
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse p-4">
      <div className="h-6 bg-slate-200 rounded w-1/4"></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 h-64"></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 h-96"></div>
    </div>
  );

  if (error || !property) return (
    <div className="max-w-5xl mx-auto py-12 p-4">
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        {error ?? 'Property not found.'}
      </div>
      <button onClick={() => navigate('/properties')} className="mt-4 text-slate-500 flex items-center gap-2 text-sm hover:underline">
        <ArrowLeft size={14} /> Back to listing
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/properties')}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <div className="p-1.5 rounded-lg group-hover:bg-slate-100 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span className="text-sm font-medium">Back to Properties</span>
        </button>

        <button
          onClick={() => navigate(`/properties/${id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50
                     text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95">
          <Pencil size={14} /> Edit Property
        </button>
      </div>

      {/* Modern Property Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
              <Building2 size={32} className="text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between md:justify-start gap-4 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 truncate">{property.name}</h1>
                <Badge value={property.status.toString()} />
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 shadow-none">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-sm">{property.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag size={14} className="text-slate-400" />
                  <span className="text-sm">{property.type}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added On</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {new Date(property.dateCreated).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                <Package size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Equipment</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{assets.length} Assets Registered</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Integrated Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Assigned Assets
              <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                {assets.length}
              </span>
            </h2>
          </div>
          <button
            onClick={() => navigate(`/assets/new?propertyId=${id}`)}
            className="group flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
                       text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95">
            <Plus size={18} className="transition-transform group-hover:rotate-90" /> 
            <span>Add Asset</span>
          </button>
        </div>

        {assets.length > 0 ? (
          <div className="overflow-x-auto text-left">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest px-8 py-4">Ref</th>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest px-6 py-4">Asset Name</th>
                  <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest px-6 py-4">Status</th>
                  <th className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest py-4 px-10">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((asset, i) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-4 text-slate-400 font-mono text-xs text-left">#{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-left">{asset.name}</td>
                    <td className="px-6 py-4 text-left">
                      <Badge value={asset.status.toString()} />
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        onClick={() => navigate(`/assets/${asset.id}`)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100">
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center text-center px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-dashed border-slate-200">
              <Building2 size={32} className="text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold text-xl">Property is Empty</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm">
              There are no assets linked to this property yet. Start by adding equipment or tools.
            </p>
            <button
               onClick={() => navigate(`/assets/new?propertyId=${id}`)}
               className="mt-8 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
               Register First Asset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;

