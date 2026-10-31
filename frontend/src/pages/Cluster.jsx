import React, { useState, useEffect } from 'react';
import { 
  Server, HardDrive, Cpu, 
  Folder, FileText, CornerLeftUp, ExternalLink
} from 'lucide-react';
import { api, clusterApi } from '../services/api';

export default function Cluster() {
  const [clusterData, setClusterData] = useState(null);
  const [loading, setLoading] = useState(true);

  // HDFS In-App File Browser State
  const [currentHdfsPath, setCurrentHdfsPath] = useState('/telecom');
  const [hdfsEntries, setHdfsEntries] = useState([]);
  const [loadingHdfs, setLoadingHdfs] = useState(false);

  const fetchClusterInfo = async () => {
    try {
      setLoading(true);
      const statusRes = await clusterApi.getStatus();
      setClusterData(statusRes.data);
    } catch (err) {
      console.error('Error fetching cluster status:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHdfsDirectory = async (path) => {
    try {
      setLoadingHdfs(true);
      const data = await api.browseHdfs(path);
      if (data && data.success) {
        setHdfsEntries(data.entries || []);
        setCurrentHdfsPath(data.current_path || path);
      }
    } catch (err) {
      console.error('Failed to browse HDFS:', err);
    } finally {
      setLoadingHdfs(false);
    }
  };

  useEffect(() => {
    fetchClusterInfo();
    loadHdfsDirectory(currentHdfsPath);
    const interval = setInterval(fetchClusterInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  const navigateUp = () => {
    if (currentHdfsPath === '/' || currentHdfsPath === '') return;
    const segments = currentHdfsPath.split('/').filter(Boolean);
    segments.pop();
    const parentPath = '/' + segments.join('/');
    loadHdfsDirectory(parentPath || '/');
  };

  const containers = clusterData?.containers || {};
  const containerList = Object.values(containers);
  const hdfs = clusterData?.hdfs || {};
  const yarn = clusterData?.yarn || {};

  return (
    <div className="space-y-4 max-w-5xl">
      {/* 3 Main Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* telecom-master */}
        <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#2878E5]" />
              <span className="font-bold text-xs text-[#142B4A]">telecom-master</span>
            </div>
            <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.2 rounded">
              Healthy
            </span>
          </div>
          <div className="text-[11px] text-[#718096] space-y-0.5">
            <div>Role: <span className="text-[#142B4A] font-medium">NameNode & ResourceManager</span></div>
            <div>Ports: <span className="font-mono text-[#142B4A]">9870, 8088, 9000</span></div>
          </div>
        </div>

        {/* telecom-worker-01 */}
        <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#10B981]" />
              <span className="font-bold text-xs text-[#142B4A]">telecom-worker-01</span>
            </div>
            <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.2 rounded">
              Healthy
            </span>
          </div>
          <div className="text-[11px] text-[#718096] space-y-0.5">
            <div>Role: <span className="text-[#142B4A] font-medium">DataNode 1 & NodeManager 1</span></div>
            <div>Ports: <span className="font-mono text-[#142B4A]">9864, 8042</span></div>
          </div>
        </div>

        {/* telecom-worker-02 */}
        <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#8B5CF6]" />
              <span className="font-bold text-xs text-[#142B4A]">telecom-worker-02</span>
            </div>
            <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.2 rounded">
              Healthy
            </span>
          </div>
          <div className="text-[11px] text-[#718096] space-y-0.5">
            <div>Role: <span className="text-[#142B4A] font-medium">DataNode 2 & NodeManager 2</span></div>
            <div>Ports: <span className="font-mono text-[#142B4A]">9865, 8043</span></div>
          </div>
        </div>
      </div>

      {/* In-App HDFS File Browser */}
      <div className="bg-white rounded-lg border border-[#E5EAF1] overflow-hidden">
        <div className="px-3.5 py-2.5 bg-[#FAFBFD] border-b border-[#E5EAF1] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={navigateUp}
              disabled={currentHdfsPath === '/' || currentHdfsPath === ''}
              className="p-1 rounded hover:bg-[#EBF3FE] text-[#142B4A] disabled:opacity-40"
              title="Navigate Up"
            >
              <CornerLeftUp className="w-3.5 h-3.5" />
            </button>
            <div className="font-mono text-xs text-[#2878E5] font-semibold">
              {currentHdfsPath}
            </div>
          </div>

          <a
            href="http://localhost:9870"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-[#2878E5] hover:underline"
          >
            <span>Hadoop NameNode :9870</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F7F9FC] text-[#718096] border-b border-[#E5EAF1]">
              <tr>
                <th className="py-2 px-3.5 font-semibold">Name</th>
                <th className="py-2 px-3.5 font-semibold">Type</th>
                <th className="py-2 px-3.5 font-semibold">Size</th>
                <th className="py-2 px-3.5 font-semibold">Replication</th>
                <th className="py-2 px-3.5 font-semibold">Permissions</th>
                <th className="py-2 px-3.5 font-semibold">Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF1] text-[#142B4A]">
              {hdfsEntries.length > 0 ? (
                hdfsEntries.map((e, idx) => (
                  <tr key={idx} className="hover:bg-[#FAFBFD]">
                    <td className="py-2 px-3.5">
                      {e.is_dir ? (
                        <button
                          onClick={() => loadHdfsDirectory(e.path)}
                          className="flex items-center gap-1.5 font-bold text-[#2878E5] hover:underline"
                        >
                          <Folder className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>{e.name}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 font-medium text-[#142B4A]">
                          <FileText className="w-3.5 h-3.5 text-[#718096]" />
                          <span>{e.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3.5 font-sans">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        e.is_dir ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#F1F5F9] text-[#475569]'
                      }`}>
                        {e.is_dir ? 'DIR' : 'FILE'}
                      </span>
                    </td>
                    <td className="py-2 px-3.5 text-[#718096]">{e.size_formatted}</td>
                    <td className="py-2 px-3.5 text-[#718096]">{e.replication}</td>
                    <td className="py-2 px-3.5 text-[#718096]">{e.permissions}</td>
                    <td className="py-2 px-3.5 font-sans text-[#718096] text-[11px]">{e.modified}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-[#718096] font-sans">
                    {loadingHdfs ? 'Loading HDFS directory...' : 'No files found in directory.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
