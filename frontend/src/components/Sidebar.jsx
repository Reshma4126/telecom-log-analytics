import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Database, 
  Cpu, 
  HardDrive, 
  Activity, 
  FileSearch, 
  History, 
  Info,
  Signal,
  RotateCw
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

const navItems = [
  { path: '/', label: 'Overview', icon: BarChart3 },
  { path: '/ingestion', label: 'Data Ingestion', icon: Database },
  { path: '/execution', label: 'MapReduce Monitor', icon: Cpu },
  { path: '/cluster', label: 'Hadoop Cluster', icon: HardDrive },
  { path: '/regional', label: 'Regional Analytics', icon: Activity },
  { path: '/results', label: 'Results Explorer', icon: FileSearch },
  { path: '/history', label: 'Job History', icon: History },
  { path: '/about', label: 'Architecture & Spec', icon: Info },
];

export default function Sidebar() {
  const { clusterOnline, clusterData, refreshWorkflow } = useWorkflow();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWorkflow();
    setTimeout(() => setRefreshing(false), 500);
  };

  const hdfs = clusterData?.hdfs || {};
  const yarn = clusterData?.yarn || {};

  return (
    <aside className="w-64 bg-white border-r border-[#E5EAF1] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="px-5 py-3.5 border-b border-[#E5EAF1] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#142B4A] text-white flex items-center justify-center">
            <Signal className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-[#142B4A] text-base tracking-tight leading-none">TelcoPulse</h1>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#EBF3FE] text-[#2878E5]">v2.4</span>
            </div>
            <p className="text-[10px] font-medium text-[#718096] mt-0.5">Telecom Analytics</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150
                ${isActive 
                  ? 'bg-[#142B4A] text-white shadow-2xs' 
                  : 'text-[#4A5568] hover:bg-[#F7F9FC] hover:text-[#142B4A]'}
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#2878E5]' : 'text-[#718096]'
                  }`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Cluster Status Card at Left Bottom */}
      <div className="p-3">
        <div className="bg-[#FAFBFD] border border-[#E5EAF1] rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#526581]">
              CLUSTER STATUS
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-[#718096] hover:text-[#2878E5] transition-colors p-0.5"
              title="Refresh status"
            >
              <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#2878E5]' : ''}`} />
            </button>
          </div>

          {/* Online / Offline status badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${clusterOnline ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></span>
            <span className={`text-xs font-bold tracking-wide uppercase ${clusterOnline ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {clusterOnline ? 'ONLINE (3/3)' : 'OFFLINE / STANDBY'}
            </span>
          </div>

          {/* Breakdown items */}
          <div className="text-xs text-[#526581] space-y-1.5 font-medium">
            <div className="flex justify-between items-center">
              <span>NameNode</span>
              <span className={`font-semibold ${clusterOnline ? 'text-[#10B981]' : 'text-[#D97706]'}`}>
                {clusterOnline ? 'Running' : 'Standby'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>DataNodes (2)</span>
              <span className={`font-semibold ${clusterOnline ? 'text-[#10B981]' : 'text-[#D97706]'}`}>
                {clusterOnline ? `${hdfs.live_datanodes ?? 2} / 2 Active` : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>NodeManagers (2)</span>
              <span className={`font-semibold ${clusterOnline ? 'text-[#10B981]' : 'text-[#D97706]'}`}>
                {clusterOnline ? `${yarn.total_nodes ?? 2} Running` : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
