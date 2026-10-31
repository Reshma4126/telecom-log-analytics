import React from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

const PAGE_META = {
  '/': {
    title: 'Overview',
    subtitle: 'System metrics and Hadoop cluster status'
  },
  '/ingestion': {
    title: 'Data Ingestion',
    subtitle: 'Upload Call Detail Record CSV files and validate schema'
  },
  '/execution': {
    title: 'MapReduce Monitor',
    subtitle: 'Dual-worker task telemetry and execution progress'
  },
  '/cluster': {
    title: 'Hadoop Cluster',
    subtitle: 'Master and DataNode architecture and HDFS storage'
  },
  '/regional': {
    title: 'Regional Analytics',
    subtitle: 'Regional QoS benchmarks, call completion, and drop rates'
  },
  '/results': {
    title: 'Results Explorer',
    subtitle: 'Inspect and export MapReduce outputs'
  },
  '/history': {
    title: 'Job History',
    subtitle: 'Executed MapReduce applications audit log'
  },
  '/about': {
    title: 'Architecture & Spec',
    subtitle: 'Technical design and MapReduce pipeline specification'
  }
};

export default function Topbar() {
  const location = useLocation();
  const { refreshWorkflow, showToast } = useWorkflow();
  const [refreshing, setRefreshing] = React.useState(false);

  const meta = PAGE_META[location.pathname] || {
    title: 'TelcoPulse Analytics',
    subtitle: 'Telecom Network Platform'
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWorkflow();
    showToast('Dashboard metrics refreshed from backend', 'success');
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <header className="bg-white border-b border-[#E5EAF1] px-6 py-2.5 flex items-center justify-between flex-shrink-0 z-10">
      <div>
        <h2 className="text-base font-bold text-[#142B4A] tracking-tight leading-tight">{meta.title}</h2>
        <p className="text-[11px] text-[#718096]">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Quick WebUI link */}
        <a
          href="http://localhost:9870"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E5EAF1] bg-[#F7F9FC] text-xs font-semibold text-[#172B4D] hover:bg-[#EBF3FE] hover:text-[#2878E5] transition-all"
          title="Open Apache Hadoop NameNode WebUI"
        >
          <span>HDFS UI :9870</span>
          <ExternalLink className="w-3 h-3 text-[#718096]" />
        </a>

        {/* Global Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E5EAF1] bg-[#F7F9FC] text-xs font-semibold text-[#172B4D] hover:bg-[#EBF3FE] hover:text-[#2878E5] transition-all"
          title="Refresh metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#2878E5] ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
