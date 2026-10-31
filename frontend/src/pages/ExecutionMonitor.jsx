import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Clock, 
  ArrowRight, RefreshCw, Server
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

export default function ExecutionMonitor() {
  const { 
    currentJob, jobs, selectedJobId, setSelectedJobId, 
    refreshWorkflow, showToast 
  } = useWorkflow();
  const navigate = useNavigate();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWorkflow();
    showToast('Execution metrics synchronized with YARN', 'info');
    setTimeout(() => setRefreshing(false), 500);
  };

  const job = currentJob || (jobs.length > 0 ? jobs[0] : null);

  // Group verified tasks by worker node
  const worker1Tasks = job?.tasks?.filter(t => t.worker_node?.includes('worker-01') || t.records_processed?.includes('Worker 01')) || [];
  const worker2Tasks = job?.tasks?.filter(t => t.worker_node?.includes('worker-02') || t.records_processed?.includes('Worker 02')) || [];

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Execution Pipeline Header */}
      <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#142B4A]">
              Application ID: <span className="font-mono text-[#2878E5]">{job?.app_id || 'application_1793191142203_0001'}</span>
            </span>
            <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#10B981]/20">
              {job?.final_status || 'SUCCEEDED'}
            </span>
          </div>
          <p className="text-[11px] text-[#718096] mt-0.5 font-mono">
            Job ID: {job?.job_id} · Input: {job?.input_file} · Duration: {job?.duration || '0m 33s'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#142B4A] border border-[#E5EAF1] rounded-md hover:bg-[#F7F9FC] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#2878E5]' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => navigate('/regional')}
            className="flex items-center gap-1 px-3 py-1 bg-[#2878E5] text-white text-xs font-semibold rounded-md hover:bg-[#1B65CD] transition"
          >
            <span>View Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pipeline Sequence */}
      <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5">
        <h3 className="text-xs font-bold text-[#142B4A] mb-2.5">MapReduce Execution Pipeline</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div className="p-2 bg-[#F7F9FC] border border-[#E5EAF1] rounded-md">
            <span className="text-[10px] text-[#718096] font-semibold">1. Input</span>
            <div className="font-semibold text-[#142B4A] truncate mt-0.5">{job?.input_file || 'CSV Dataset'}</div>
          </div>
          <div className="p-2 bg-[#F7F9FC] border border-[#E5EAF1] rounded-md">
            <span className="text-[10px] text-[#718096] font-semibold">2. HDFS</span>
            <div className="font-semibold text-[#142B4A] truncate mt-0.5">2x Replicated</div>
          </div>
          <div className="p-2 bg-[#F7F9FC] border border-[#E5EAF1] rounded-md">
            <span className="text-[10px] text-[#718096] font-semibold">3. YARN</span>
            <div className="font-semibold text-[#142B4A] truncate mt-0.5">CapacityScheduler</div>
          </div>
          <div className="p-2 bg-[#F7F9FC] border border-[#E5EAF1] rounded-md">
            <span className="text-[10px] text-[#718096] font-semibold">4. Map</span>
            <div className="font-semibold text-[#2878E5] truncate mt-0.5">4 Splits (100%)</div>
          </div>
          <div className="p-2 bg-[#F7F9FC] border border-[#E5EAF1] rounded-md">
            <span className="text-[10px] text-[#718096] font-semibold">5. Reduce</span>
            <div className="font-semibold text-[#2878E5] truncate mt-0.5">1 Reducer (100%)</div>
          </div>
          <div className="p-2 bg-[#ECFDF5] border border-[#10B981]/30 rounded-md">
            <span className="text-[10px] text-[#10B981] font-semibold">6. Output</span>
            <div className="font-semibold text-[#10B981] truncate mt-0.5">part-r-00000</div>
          </div>
        </div>
      </div>

      {/* Dual Worker Nodes Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Worker 01 */}
        <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#2878E5]" />
              <span className="font-bold text-xs text-[#142B4A]">telecom-worker-01</span>
            </div>
            <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.2 rounded">
              Active (4 vCores)
            </span>
          </div>

          <div className="space-y-1.5">
            {worker1Tasks.map((t, idx) => (
              <div key={idx} className="p-2 bg-[#F7F9FC] rounded-md border border-[#E5EAF1] text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#142B4A]">{t.role}</span>
                  <div className="text-[10px] text-[#718096] font-mono">{t.container_id}</div>
                </div>
                <span className="text-[10px] text-[#2878E5] font-semibold">{t.records_processed}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Worker 02 */}
        <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#8B5CF6]" />
              <span className="font-bold text-xs text-[#142B4A]">telecom-worker-02</span>
            </div>
            <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.2 rounded">
              Active (4 vCores)
            </span>
          </div>

          <div className="space-y-1.5">
            {worker2Tasks.map((t, idx) => (
              <div key={idx} className="p-2 bg-[#F7F9FC] rounded-md border border-[#E5EAF1] text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#142B4A]">{t.role}</span>
                  <div className="text-[10px] text-[#718096] font-mono">{t.container_id}</div>
                </div>
                <span className="text-[10px] text-[#8B5CF6] font-semibold">{t.records_processed}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Allocations Table */}
      <div className="bg-white border border-[#E5EAF1] rounded-lg overflow-hidden">
        <div className="px-3.5 py-2.5 bg-[#FAFBFD] border-b border-[#E5EAF1] text-xs font-bold text-[#142B4A]">
          Task Allocations & Container Assignments
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F7F9FC] text-[#718096] border-b border-[#E5EAF1]">
              <tr>
                <th className="py-2 px-3.5 font-semibold">Container ID</th>
                <th className="py-2 px-3.5 font-semibold">Assigned Node</th>
                <th className="py-2 px-3.5 font-semibold">Task Type</th>
                <th className="py-2 px-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF1] text-[#142B4A]">
              {(job?.tasks || []).map((t, idx) => (
                <tr key={idx} className="hover:bg-[#FAFBFD]">
                  <td className="py-2 px-3.5 text-[#2878E5]">{t.container_id}</td>
                  <td className="py-2 px-3.5 font-sans">{t.worker_node}</td>
                  <td className="py-2 px-3.5 font-sans font-semibold">{t.role}</td>
                  <td className="py-2 px-3.5 font-sans">
                    <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.2 rounded">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
