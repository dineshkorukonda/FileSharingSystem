import React, { useState, useEffect } from 'react';

const FileActivityChart = ({ isLoading }) => {
  const [activeView, setActiveView] = useState('week');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    generateChartData(activeView);
  }, [activeView]);

  const generateChartData = (view) => {
    let data = [];
    if (view === 'week') {
      data = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        label: day,
        uploads: Math.floor(Math.random() * 6),
        downloads: Math.floor(Math.random() * 8),
      }));
    } else if (view === 'month') {
      data = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week) => ({
        label: week,
        uploads: Math.floor(Math.random() * 15) + 5,
        downloads: Math.floor(Math.random() * 20) + 10,
      }));
    } else {
      data = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => ({
        label: month,
        uploads: Math.floor(Math.random() * 50) + 20,
        downloads: Math.floor(Math.random() * 70) + 30,
      }));
    }
    setChartData(data);
  };

  const maxValue = chartData.reduce((max, item) => Math.max(max, item.uploads, item.downloads), 0);

  if (isLoading) {
    return <p className="text-sm text-base-content/70">Loading activity</p>;
  }

  return (
    <div className="space-y-3">
      <div role="tablist" className="tabs tabs-border">
        {['week', 'month', 'year'].map((view) => (
          <button
            key={view}
            type="button"
            role="tab"
            className={`tab capitalize ${activeView === view ? 'tab-active' : ''}`}
            onClick={() => setActiveView(view)}
          >
            {view}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2 h-40">
        {chartData.map((item) => (
          <div key={item.label} className="flex-1 text-center">
            <div className="flex items-end justify-center gap-1 h-32">
              <div className="bg-base-content/70 w-2" style={{ height: `${maxValue ? (item.uploads / maxValue) * 100 : 0}%` }} />
              <div className="bg-base-content/30 w-2" style={{ height: `${maxValue ? (item.downloads / maxValue) * 100 : 0}%` }} />
            </div>
            <div className="text-[10px] mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileActivityChart;
