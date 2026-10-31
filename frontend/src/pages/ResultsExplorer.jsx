import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, Search, Copy, ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { useWorkflow } from '../context/WorkflowContext';

const DEFAULT_RESULTS = [
  { region: 'Chennai', total_calls: 12839, successful_calls: 11584, failed_calls: 1255, drop_rate: 9.77, success_rate: 90.23, duration_seconds: 10510546, duration_minutes: 175176, avg_duration_min: '13.6' },
  { region: 'Mumbai', total_calls: 12671, successful_calls: 11190, failed_calls: 1481, drop_rate: 11.69, success_rate: 88.31, duration_seconds: 10204434, duration_minutes: 170074, avg_duration_min: '13.4' },
  { region: 'Coimbatore', total_calls: 12574, successful_calls: 12162, failed_calls: 412, drop_rate: 3.28, success_rate: 96.72, duration_seconds: 10887159, duration_minutes: 181453, avg_duration_min: '14.4' },
  { region: 'Pune', total_calls: 12460, successful_calls: 11496, failed_calls: 964, drop_rate: 7.74, success_rate: 92.26, duration_seconds: 10368663, duration_minutes: 172811, avg_duration_min: '13.9' },
  { region: 'Bengaluru', total_calls: 12458, successful_calls: 11960, failed_calls: 498, drop_rate: 4.0, success_rate: 96.0, duration_seconds: 10789088, duration_minutes: 179818, avg_duration_min: '14.4' },
  { region: 'Kochi', total_calls: 12396, successful_calls: 12132, failed_calls: 264, drop_rate: 2.13, success_rate: 97.87, duration_seconds: 11005876, duration_minutes: 183431, avg_duration_min: '14.8' },
  { region: 'Delhi', total_calls: 12332, successful_calls: 11649, failed_calls: 683, drop_rate: 5.54, success_rate: 94.46, duration_seconds: 10472676, duration_minutes: 174545, avg_duration_min: '14.1' },
  { region: 'Hyderabad', total_calls: 12270, successful_calls: 11672, failed_calls: 598, drop_rate: 4.87, success_rate: 95.13, duration_seconds: 10614224, duration_minutes: 176904, avg_duration_min: '14.4' }
];

export default function ResultsExplorer() {
  const { currentJob } = useWorkflow();
  const navigate = useNavigate();

  const [data, setData] = useState(DEFAULT_RESULTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.getRegional();
      const rawList = res?.regions || (Array.isArray(res) ? res : []);
      if (rawList && rawList.length > 0) {
        const normalized = rawList.map(r => ({
          region: r.region || 'Unknown',
          total_calls: r.total_calls ?? 0,
          successful_calls: r.successful_calls ?? r.successful ?? 0,
          failed_calls: r.failed_calls ?? r.dropped ?? 0,
          drop_rate: r.drop_rate ?? r.drop_rate_pct ?? 0,
          success_rate: r.success_rate ?? r.sla_success_pct ?? 0,
          duration_seconds: r.duration_seconds ?? r.total_duration_sec ?? 0,
          duration_minutes: r.duration_minutes ?? r.total_duration_minutes ?? Math.round((r.duration_seconds || 0) / 60),
          avg_duration_min: r.avg_duration_min ?? (r.avg_duration_sec ? (r.avg_duration_sec / 60).toFixed(1) : 0)
        }));
        setData(normalized);
      }
    } catch (err) {
      console.error('Failed to load output results:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter(r => 
    r.region.toLowerCase().includes(search.toLowerCase())
  );

  const downloadCSV = () => {
    const headers = ['Region', 'Total Calls', 'Successful Calls', 'Dropped Calls', 'Drop Rate (%)', 'SLA Success (%)', 'Total Duration (Min)'];
    const rows = filtered.map(r => [
      r.region,
      r.total_calls,
      r.successful_calls,
      r.failed_calls,
      r.drop_rate,
      r.success_rate,
      r.duration_minutes
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telcopulse_${currentJob?.job_id || 'results'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyTSV = () => {
    const text = data.map(r => `${r.region}\t${r.total_calls}\t${r.successful_calls}\t${r.failed_calls}\t${r.duration_seconds}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Context Banner */}
      <div className="bg-white border border-[#E5EAF1] rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-[#142B4A]">Job Output: </span>
          <span className="font-mono text-[#2878E5] font-semibold">{currentJob?.job_id || 'Baseline Job'}</span>
          <span className="text-[#CBD5E1] mx-2">|</span>
          <span className="text-[#718096]">HDFS: </span>
          <span className="font-mono text-[#142B4A]">{currentJob?.hdfs_output_path || '/telecom/output'}/part-r-00000</span>
        </div>
        <button
          onClick={() => navigate('/regional')}
          className="flex items-center gap-1 text-xs text-[#2878E5] font-semibold hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Analytics</span>
        </button>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white p-3 rounded-lg border border-[#E5EAF1] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#718096]" />
          <input
            type="text"
            placeholder="Search regions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-[#E5EAF1] rounded-md text-xs focus:outline-none focus:border-[#2878E5]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={copyTSV}
            className="px-2.5 py-1.5 border border-[#E5EAF1] text-[#142B4A] hover:bg-[#F7F9FC] rounded-md text-xs font-semibold transition flex items-center gap-1"
          >
            <Copy className="w-3 h-3 text-[#718096]" />
            <span>{copied ? 'Copied TSV' : 'Copy TSV'}</span>
          </button>
          <button
            onClick={downloadCSV}
            className="px-3 py-1.5 bg-[#2878E5] hover:bg-[#1B65CD] text-white rounded-md text-xs font-semibold transition flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Raw MapReduce Output Table */}
      <div className="bg-white rounded-lg border border-[#E5EAF1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F7F9FC] text-[#718096] border-b border-[#E5EAF1]">
              <tr>
                <th className="py-2 px-3.5 font-sans font-semibold">Region Circle</th>
                <th className="py-2 px-3.5 font-semibold">Total Calls</th>
                <th className="py-2 px-3.5 font-semibold">Successful</th>
                <th className="py-2 px-3.5 font-semibold">Dropped</th>
                <th className="py-2 px-3.5 font-semibold">Failure %</th>
                <th className="py-2 px-3.5 font-semibold">SLA Success</th>
                <th className="py-2 px-3.5 font-semibold">Total Min</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF1] text-[#142B4A]">
              {filtered.map((r, idx) => (
                <tr key={idx} className="hover:bg-[#FAFBFD]">
                  <td className="py-2 px-3.5 font-sans font-bold text-[#142B4A]">{r.region}</td>
                  <td className="py-2 px-3.5">{(r.total_calls || 0).toLocaleString()}</td>
                  <td className="py-2 px-3.5 text-[#10B981] font-semibold">{(r.successful_calls || 0).toLocaleString()}</td>
                  <td className="py-2 px-3.5 text-[#EF4444] font-semibold">{(r.failed_calls || 0).toLocaleString()}</td>
                  <td className="py-2 px-3.5">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      r.drop_rate > 6.4 ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#F7F9FC] text-[#718096]'
                    }`}>
                      {r.drop_rate}%
                    </span>
                  </td>
                  <td className="py-2 px-3.5 text-[#10B981] font-semibold">{r.success_rate}%</td>
                  <td className="py-2 px-3.5 text-[#718096]">{(r.duration_minutes || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
