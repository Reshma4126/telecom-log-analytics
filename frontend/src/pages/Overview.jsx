import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { 
  Phone, CheckCircle2, XCircle, Clock, Server, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useWorkflow } from '../context/WorkflowContext';

const DEFAULT_KPIS = {
  total_calls: 100000,
  successful_calls: 93845,
  failed_calls: 6155,
  duration_hours: 23570.2,
  duration_minutes: 1414211,
  completion_rate: 93.84,
  drop_rate: 6.16
};

export default function Overview() {
  const { 
    currentJob, jobs, clusterOnline, 
    setSelectedJobId 
  } = useWorkflow();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.getOverview()
      .then(res => setData(res))
      .catch(err => console.error("Failed to load overview:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = {
    total_calls: data?.kpis?.total_calls ?? DEFAULT_KPIS.total_calls,
    successful_calls: data?.kpis?.successful_calls ?? DEFAULT_KPIS.successful_calls,
    failed_calls: data?.kpis?.failed_calls ?? DEFAULT_KPIS.failed_calls,
    duration_hours: data?.kpis?.duration_hours ?? DEFAULT_KPIS.duration_hours,
    duration_minutes: data?.kpis?.duration_minutes ?? DEFAULT_KPIS.duration_minutes,
    completion_rate: data?.kpis?.completion_rate ?? DEFAULT_KPIS.completion_rate,
    drop_rate: data?.kpis?.drop_rate ?? DEFAULT_KPIS.drop_rate,
  };

  const regionsVolume = data?.regions_volume || [
    { region: 'Chennai', total_calls: 12839 },
    { region: 'Mumbai', total_calls: 12671 },
    { region: 'Coimbatore', total_calls: 12574 },
    { region: 'Pune', total_calls: 12460 },
    { region: 'Bengaluru', total_calls: 12458 },
    { region: 'Kochi', total_calls: 12396 },
    { region: 'Delhi', total_calls: 12332 },
    { region: 'Hyderabad', total_calls: 12270 }
  ];

  // Call Completion Donut
  const donutOption = {
    tooltip: { 
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: ['60%', '80%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: () => `{val|${(kpis.total_calls || 0).toLocaleString()}}\n{lbl|Total Calls}`,
        rich: {
          val: { fontSize: 16, fontWeight: 'bold', color: '#142B4A', lineHeight: 22 },
          lbl: { fontSize: 10, color: '#718096' }
        }
      },
      data: [
        { value: kpis.successful_calls, name: 'Successful', itemStyle: { color: '#2878E5' } },
        { value: kpis.failed_calls, name: 'Dropped', itemStyle: { color: '#EF4444' } }
      ]
    }]
  };

  // Regional Volume Bar
  const volumeChartOption = {
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' }
    },
    grid: { left: '3%', right: '3%', bottom: '5%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: regionsVolume.map(r => r.region),
      axisLine: { lineStyle: { color: '#E5EAF1' } },
      axisTick: { show: false },
      axisLabel: { color: '#718096', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#F0F4F8' } },
      axisLabel: { color: '#A0AEC0', fontSize: 10 }
    },
    series: [{
      data: regionsVolume.map(r => r.total_calls),
      type: 'bar',
      barWidth: '36%',
      itemStyle: {
        color: '#2878E5',
        borderRadius: [3, 3, 0, 0]
      }
    }]
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Cluster Health Summary */}
      <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#2878E5] flex items-center justify-center flex-shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${clusterOnline ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></span>
              <h3 className="text-xs font-bold text-[#142B4A]">
                {clusterOnline ? 'Hadoop Cluster Active (3/3 Nodes)' : 'Cluster Offline / Standby'}
              </h3>
            </div>
            <p className="text-[11px] text-[#718096]">
              Master (<span className="font-mono text-[#142B4A]">telecom-master</span>) · Workers (<span className="font-mono text-[#142B4A]">worker-01, worker-02</span>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/ingestion')}
            className="px-3 py-1.5 bg-[#2878E5] text-white text-xs font-semibold rounded-md hover:bg-[#1B65CD] transition-all"
          >
            Upload Data
          </button>
          <button
            onClick={() => navigate('/execution')}
            className="px-3 py-1.5 border border-[#E5EAF1] text-[#142B4A] text-xs font-semibold rounded-md hover:bg-[#F7F9FC] transition-all"
          >
            Monitor Execution
          </button>
        </div>
      </div>

      {/* 4 Important KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-[#718096] font-medium">Total Calls</span>
              <div className="text-xl font-bold text-[#142B4A] mt-0.5">
                {(kpis.total_calls || 0).toLocaleString()}
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-[#EBF3FE] text-[#2878E5] flex items-center justify-center">
              <Phone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[11px] text-[#718096] mt-2 pt-2 border-t border-[#F0F4F8]">
            Total processed CDR records
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-[#718096] font-medium">Successful Calls</span>
              <div className="text-xl font-bold text-[#10B981] mt-0.5">
                {(kpis.successful_calls || 0).toLocaleString()}
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[11px] text-[#10B981] font-semibold mt-2 pt-2 border-t border-[#F0F4F8]">
            {kpis.completion_rate}% completion rate
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-[#718096] font-medium">Dropped Calls</span>
              <div className="text-xl font-bold text-[#EF4444] mt-0.5">
                {(kpis.failed_calls || 0).toLocaleString()}
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[11px] text-[#EF4444] font-semibold mt-2 pt-2 border-t border-[#F0F4F8]">
            {kpis.drop_rate}% drop rate
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-[#718096] font-medium">Total Duration</span>
              <div className="text-xl font-bold text-[#142B4A] mt-0.5">
                {(kpis.duration_hours || 0).toLocaleString()} hrs
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-[#F3E8FF] text-[#8B5CF6] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[11px] text-[#718096] mt-2 pt-2 border-t border-[#F0F4F8]">
            {(kpis.duration_minutes || 0).toLocaleString()} minutes total
          </div>
        </div>
      </div>

      {/* Row: Regional Volume + Call Completion + Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Regional Volume Bar Chart */}
        <div className="lg:col-span-5 bg-white border border-[#E5EAF1] rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-[#142B4A]">Regional Call Volume</h3>
              <p className="text-[11px] text-[#718096]">Calls distributed across circles</p>
            </div>
            <button 
              onClick={() => navigate('/regional')}
              className="text-[11px] text-[#2878E5] font-semibold hover:underline"
            >
              Details
            </button>
          </div>
          <div className="h-48">
            <ReactECharts option={volumeChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Call Completion Visualization */}
        <div className="lg:col-span-3 bg-white border border-[#E5EAF1] rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#142B4A]">Call Completion</h3>
            <p className="text-[11px] text-[#718096]">Success vs. dropped</p>
          </div>
          <div className="h-40">
            <ReactECharts option={donutOption} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="flex justify-around border-t border-[#E5EAF1] pt-2 text-[11px]">
            <span className="text-[#2878E5] font-semibold">{kpis.completion_rate}% Success</span>
            <span className="text-[#EF4444] font-semibold">{kpis.drop_rate}% Drop</span>
          </div>
        </div>

        {/* Recent Executed Jobs */}
        <div className="lg:col-span-4 bg-white border border-[#E5EAF1] rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-[#142B4A]">Recent Executed Jobs</h3>
                <p className="text-[11px] text-[#718096]">YARN MapReduce history</p>
              </div>
              <button 
                onClick={() => navigate('/history')}
                className="text-[11px] text-[#2878E5] font-semibold hover:underline"
              >
                All Jobs
              </button>
            </div>
            <div className="space-y-1.5 mt-2">
              {jobs.slice(0, 3).map((j, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setSelectedJobId(j.job_id); navigate('/execution'); }}
                  className="p-2 bg-[#F7F9FC] hover:bg-[#EBF3FE] border border-[#E5EAF1] rounded-md cursor-pointer transition-all text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-[#2878E5] truncate max-w-[150px]">{j.job_id}</span>
                    <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.2 rounded">
                      {j.final_status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#718096] mt-0.5">
                    <span className="truncate max-w-[140px]">{j.input_file}</span>
                    <span className="font-medium text-[#142B4A]">{j.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/execution')}
            className="w-full mt-2 py-1.5 text-center text-xs font-semibold text-[#2878E5] bg-[#EBF3FE] hover:bg-[#DCEBFE] rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <span>Open Execution Monitor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
