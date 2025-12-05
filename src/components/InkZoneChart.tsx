
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
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-bold uppercase w-8 ${color === 'c' ? 'text-cyan-dim' : color === 'm' ? 'text-magenta-dim' : color === 'y' ? 'text-yellow-dim' : 'text-black'}`}>
          {labelMap[color]}
        </span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <div className="relative w-full border-b border-gray-400 flex items-end" style={{ height: `${height}px` }}>
        {/* Horizontal Guidelines */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between opacity-30">
          {[100, 50, 0].map((val) => (
            <div key={val} className="w-full border-t border-gray-400 text-[9px] text-gray-500 relative"></div>
          ))}
        </div>

        {data.map((value, idx) => (
          <div key={idx} className="flex-1 flex flex-col justify-end relative h-full border-r border-gray-100 last:border-r-0 group">
            {/* Value Text - Always visible, Vertical */}
            {value > 0 && (
              <div className="absolute w-full flex justify-center pointer-events-none" style={{ bottom: `${Math.max(value, 15)}%`, marginBottom: '2px' }}>
                <span className="text-[9px] text-gray-700 font-bold -rotate-90 origin-bottom whitespace-nowrap">
                  {value}
                </span>
              </div>
            )}

            <div
              className={`w-full ${colorMap[color]} transition-all duration-300 opacity-90 group-hover:opacity-100`}
              style={{ height: `${value}%` }}
            ></div>

            <div className="text-[8px] text-center text-gray-400 mt-0.5 border-t border-gray-200 pt-0.5">{idx + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
