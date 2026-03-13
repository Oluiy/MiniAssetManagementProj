import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { assetsApi } from '../api';
import { AssetResponse, AssetStatus } from '../types';

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

  const getStatusString = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.Active: return 'Active';
      case AssetStatus.Inactive: return 'Inactive';
      case AssetStatus.UnderMaintenance: return 'Under Maintenance';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.Active: return 'bg-green-100 text-green-800';
      case AssetStatus.Inactive: return 'bg-red-100 text-red-800';
      case AssetStatus.UnderMaintenance: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center p-12 text-gray-500">Loading asset details...</div>;

  if (error || !asset) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center bg-white rounded-lg shadow-sm border border-gray-100 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
        <p className="text-red-500 mb-6">{error || 'Asset not found'}</p>
        <button onClick={() => navigate('/assets')} className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">← Back to Assets</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/assets')} 
            className="text-gray-500 hover:text-gray-800 font-medium py-1 px-3 rounded-md bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm flex items-center"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">Asset Overview</h2>
        </div>
        <Link 
          to={`/assets/${asset.id}/edit`}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 transition duration-150 font-medium"
        >
          Edit Asset
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">General Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Detailed credentials and status of the asset.</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(asset.status)}`}>
            {getStatusString(asset.status)}
          </span>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Asset Name</dt>
              <dd className="mt-2 text-lg text-gray-900 font-medium">{asset.name}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-2 text-md text-gray-900">{asset.type}</dd>
            </div>

            <div className="sm:col-span-2 border-t pt-5 border-gray-100">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-2 text-md text-gray-900 flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {asset.location}
              </dd>
            </div>

            <div className="sm:col-span-1 border-t pt-5 border-gray-100">
              <dt className="text-sm font-medium text-gray-500">Asset ID</dt>
              <dd className="mt-2 text-sm text-gray-500 font-mono tracking-wider bg-gray-50 py-1.5 px-3 rounded border border-gray-100 inline-block">{asset.id}</dd>
            </div>
            
            <div className="sm:col-span-1 border-t pt-5 border-gray-100">
              <dt className="text-sm font-medium text-gray-500">Date Added</dt>
              <dd className="mt-2 text-sm text-gray-900">
                {asset.dateCreated ? new Date(asset.dateCreated).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}