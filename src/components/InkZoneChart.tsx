
import React from 'react';

interface InkZoneChartProps {
  color: 'c' | 'm' | 'y' | 'k';
  data: number[];
  height?: number;
}

const colorMap = {
  c: 'bg-cyan',
  m: 'bg-magenta',
  y: 'bg-yellow',
  k: 'bg-black',
};

const labelMap = {
  c: 'Cyan',
  m: 'Magenta',
  y: 'Yellow',
  k: 'Black',
};

export const InkZoneChart: React.FC<InkZoneChartProps> = ({ color, data, height = 120 }) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-bold uppercase w-8 ${color === 'c' ? 'text-cyan-dim' : color === 'm' ? 'text-magenta-dim' : color === 'y' ? 'text-yellow-dim' : 'text-black'}`}>
          {labelMap[color]}
        </span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Chart Bars Area */}
      <div className="relative w-full border-b border-gray-400 flex items-end" style={{ height: `${height}px` }}>
        {/* Horizontal Guidelines */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between opacity-30">
          {[100, 50, 0].map((val) => (
            <div key={val} className="w-full border-t border-gray-400 text-[9px] text-gray-500 relative"></div>
          ))}
        </div>

        {data.map((value, idx) => (
          <div key={idx} className="flex-1 flex flex-col justify-end relative h-full border-r border-gray-100 last:border-r-0 group">
            {/* Bar */}
            <div
              className={`w-full ${colorMap[color]} transition-all duration-300 opacity-90 group-hover:opacity-100`}
              style={{ height: `${value}%` }}
            ></div>
          </div>
        ))}
      </div>

      {/* Data Scale Row (Values & Indexes) */}
      <div className="flex w-full">
        {data.map((value, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center pt-1 border-r border-gray-100 last:border-r-0 bg-gray-50/50 pb-1">
            {/* Value */}
            <span className={`text-[9px] font-bold leading-tight ${value > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
              {value}
            </span>
            {/* Zone Index */}
            <span className="text-[7px] text-gray-400 leading-tight mt-0.5">
              {idx + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
