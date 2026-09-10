import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { TestReading } from '../types';
import { TestTable } from '../components/Tests/TestTable';
import { TestFilterBar } from '../components/Tests/TestFilterBar';
import { LoadingState } from '../components/Common/LoadingState';
import { EmptyState } from '../components/Common/EmptyState';
import { exportTestsToCSV } from '../utils/exportHelpers';
import { Download, History, RefreshCw } from 'lucide-react';

export const TestHistoryPage: React.FC = () => {
  const [tests, setTests] = useState<TestReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchTests();
  }, [search, statusFilter, sortBy]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const data = await api.getTestHistory({
        search,
        statusFilter,
        sortBy
      });
      setTests(data);
    } catch (err) {
      console.error('Failed to fetch tests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    exportTestsToCSV(tests);
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-500" />
            <span>Test Verification History</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit log of all specimen verification runs and classified batches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTests}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={tests.length === 0}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <TestFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {loading ? (
        <LoadingState message="Querying test history logs..." />
      ) : tests.length === 0 ? (
        <EmptyState
          title="No Tests Found"
          description="No tests match the current filter or search criteria."
          action={{
            label: 'Reset Filters',
            onClick: () => {
              setSearch('');
              setStatusFilter('ALL');
            }
          }}
        />
      ) : (
        <div>
          <div className="text-xs text-slate-500 mb-2 flex justify-between">
            <span>Showing {tests.length} recorded tests</span>
            <span>Sorted by {sortBy.replace('_', ' ')}</span>
          </div>
          <TestTable tests={tests} />
        </div>
      )}
    </div>
  );
};
