import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { MilkBatch } from '../types';
import { BatchCard } from '../components/Batches/BatchCard';
import { CreateBatchModal } from '../components/Batches/CreateBatchModal';
import { LoadingState } from '../components/Common/LoadingState';
import { EmptyState } from '../components/Common/EmptyState';
import { Layers, Plus, Search } from 'lucide-react';

export const BatchManagementPage: React.FC = () => {
  const [batches, setBatches] = useState<MilkBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await api.getBatches();
      setBatches(data);
    } catch (err) {
      console.error('Failed to load batches', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (batchData: any) => {
    try {
      const created = await api.createBatch(batchData);
      setBatches(prev => [created, ...prev]);
    } catch (err) {
      console.error('Failed to create batch', err);
    }
  };

  const filteredBatches = batches.filter(b => 
    b.batchId.toLowerCase().includes(search.toLowerCase()) ||
    b.source.toLowerCase().includes(search.toLowerCase()) ||
    (b.farmerName && b.farmerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            <span>Milk Batch Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track intake volume, supplier origins, test counts, and quality status per lot.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Batch</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Batch ID, Farmer, Supplier name..."
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 transition-colors"
        />
      </div>

      {loading ? (
        <LoadingState message="Loading registered batches..." />
      ) : filteredBatches.length === 0 ? (
        <EmptyState
          title="No Batches Found"
          description="No milk batches match your search query."
          action={{
            label: 'Register First Batch',
            onClick: () => setIsCreateModalOpen(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredBatches.map(batch => (
            <BatchCard key={batch.batchId} batch={batch} />
          ))}
        </div>
      )}

      <CreateBatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateBatch}
      />
    </div>
  );
};
