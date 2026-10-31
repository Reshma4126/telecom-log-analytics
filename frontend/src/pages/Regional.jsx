import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { 
  ArrowRight, Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { useWorkflow } from '../context/WorkflowContext';

const DEFAULT_REGIONAL_DATA = [
  { region: 'Chennai', total_calls: 12839, successful_calls: 11584, failed_calls: 1255, drop_rate: 9.77, success_rate: 90.23, duration_seconds: 10510546, duration_minutes: 175176, avg_duration_min: '13.6' },
  { region: 'Mumbai', total_calls: 12671, successful_calls: 11190, failed_calls: 1481, drop_rate: 11.69, success_rate: 88.31, duration_seconds: 10204434, duration_minutes: 170074, avg_duration_min: '13.4' },
  { region: 'Coimbatore', total_calls: 12574, successful_calls: 12162, failed_calls: 412, drop_rate: 3.28, success_rate: 96.72, duration_seconds: 10887159, duration_minutes: 181453, avg_duration_min: '14.4' },
  { region: 'Pune', total_calls: 12460, successful_calls: 11496, failed_calls: 964, drop_rate: 7.74, success_rate: 92.26, duration_seconds: 10368663, duration_minutes: 172811, avg_duration_min: '13.9' },
  { region: 'Bengaluru', total_calls: 12458, successful_calls: 11960, failed_calls: 498, drop_rate: 4.0, success_rate: 96.0, duration_seconds: 10789088, duration_minutes: 179818, avg_duration_min: '14.4' },
  { region: 'Kochi', total_calls: 12396, successful_calls: 12132, failed_calls: 264, drop_rate: 2.13, success_rate: 97.87, duration_seconds: 11005876, duration_minutes: 183431, avg_duration_min: '14.8' },
  { region: 'Delhi', total_calls: 12332, successful_calls: 11649, failed_calls: 683, drop_rate: 5.54, success_rate: 94.46, duration_seconds: 10472676, duration_minutes: 174545, avg_duration_min: '14.1' },
  { region: 'Hyderabad', total_calls: 12270, successful_calls: 11672, failed_calls: 598, drop_rate: 4.87, success_rate: 95.13, duration_seconds: 10614224, duration_minutes: 176904, avg_duration_min: '14.4' }
];

export default function Regional() {
  const { currentJob, selectedDataset } = useWorkflow();
  const navigate = useNavigate();

  const [data, setData] = useState(DEFAULT_REGIONAL_DATA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRegional = async () => {
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
        console.error('Failed to load regional data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegional();
  }, []);

  // Bar chart: Call Volume by Region
  const volumeChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '3%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.region),
      axisLine: { lineStyle: { color: '#E5EAF1' } },
      axisLabel: { color: '#718096', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#F0F4F8' } },
      axisLabel: { color: '#718096', fontSize: 10 }
    },
    series: [
      {
        name: 'Successful',
        type: 'bar',
        stack: 'total',
        barWidth: '36%',
        itemStyle: { color: '#2878E5' },
        data: data.map(d => d.successful_calls)
      },
      {
        name: 'Dropped',
        type: 'bar',
        stack: 'total',
        barWidth: '36%',
        itemStyle: { color: '#EF4444', borderRadius: [3, 3, 0, 0] },
        data: data.map(d => d.failed_calls)
      }
    ]
  };

  // Drop Rate line
  const dropRateOption = {
    tooltip: { trigger: 'axis', formatter: '{b}: {c}% Failure Rate' },
    grid: { left: '3%', right: '3%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.region),
      axisLine: { lineStyle: { color: '#E5EAF1' } },
      axisLabel: { color: '#718096', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}%', color: '#718096', fontSize: 10 },
      splitLine: { lineStyle: { color: '#F0F4F8' } }
    },
    series: [{
      name: 'Drop Rate %',
      type: 'line',
      smooth: true,
      data: data.map(d => d.drop_rate),
      itemStyle: { color: '#F59E0B' },
      lineStyle: { width: 2.5, color: '#F59E0B' }
    }]
  };

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Context Banner */}
      <div className="bg-white border border-[#E5EAF1] rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-[#142B4A]">Derived from Job: </span>
          <span className="font-mono text-[#2878E5] font-semibold">{currentJob?.job_id || 'Baseline Job'}</span>
          <span className="text-[#CBD5E1] mx-2">|</span>
          <span className="text-[#718096]">Dataset: </span>
          <span className="font-semibold text-[#142B4A]">{selectedDataset?.filename || 'telecom_calls_large.csv'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/execution')}
            className="px-2.5 py-1 rounded-md border border-[#E5EAF1] text-xs font-semibold text-[#142B4A] hover:bg-[#F7F9FC]"
          >
            Job Details
          </button>
          <button
            onClick={() => navigate('/results')}
            className="px-3 py-1 rounded-md bg-[#2878E5] text-white text-xs font-semibold hover:bg-[#1B65CD] flex items-center gap-1"
          >
            <span>Results Explorer</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-[#E5EAF1]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[#142B4A]">Success vs. Dropped Volume</h3>
            <div className="flex items-center gap-2 text-[10px] text-[#718096]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#2878E5]"></span>Success</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#EF4444]"></span>Dropped</span>
            </div>
          </div>
          <div className="h-56">
            <ReactECharts option={volumeChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-[#E5EAF1]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[#142B4A]">Regional Drop Rate (%)</h3>
            <span className="text-[10px] text-[#718096]">Target &lt; 6.5%</span>
          </div>
          <div className="h-56">
            <ReactECharts option={dropRateOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Regional QoS Table */}
      <div className="bg-white rounded-lg border border-[#E5EAF1] overflow-hidden">
        <div className="px-3.5 py-2.5 bg-[#FAFBFD] border-b border-[#E5EAF1]">
          <h3 className="text-xs font-bold text-[#142B4A]">
            Regional Performance Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F7F9FC] text-[#718096] border-b border-[#E5EAF1]">
              <tr>
                <th className="py-2 px-3.5 font-sans font-semibold">Region</th>
                <th className="py-2 px-3.5 font-semibold">Total</th>
                <th className="py-2 px-3.5 font-semibold">Successful</th>
                <th className="py-2 px-3.5 font-semibold">Dropped</th>
                <th className="py-2 px-3.5 font-semibold">Drop %</th>
                <th className="py-2 px-3.5 font-semibold">SLA Success</th>
                <th className="py-2 px-3.5 font-semibold">Duration (Min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF1] text-[#142B4A]">
              {data.map((r, idx) => (
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
                  <td className="py-2 px-3.5 font-semibold text-[#10B981]">{r.success_rate}%</td>
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
