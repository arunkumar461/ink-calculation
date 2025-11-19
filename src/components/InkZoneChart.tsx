
import React from 'react';

interface InkZoneChartProps {
  color: 'c' | 'm' | 'y' | 'k';
  data: number[];
  height?: number;
}

const colorMap = {
  c: 'bg-cyan-500',
  m: 'bg-magenta-500',
  y: 'bg-yellow-500',
  k: 'bg-black',
};

const labelMap = {
  c: 'Cyan',
  m: 'Magenta',
  y: 'Yellow',
  k: 'Black',
};

export const InkZoneChart: React.FC<InkZoneChartProps> = ({ color, data, height = 150 }) => {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-sm uppercase text-gray-600">{labelMap[color]}</span>
        <span className="text-xs text-gray-400">Max: {Math.max(...data)}%</span>
      </div>
      <div className="relative w-full border-b border-gray-300 flex items-end gap-[1px]" style={{ height: `${height}px` }}>
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
          {[100, 75, 50, 25, 0].map((val) => (
            <div key={val} className="w-full border-t border-gray-100 text-[10px] text-gray-300 relative">
              <span className="absolute -top-2 -left-6">{val}</span>
            </div>
          ))}
        </div>

        {data.map((value, idx) => (
          <div key={idx} className="flex-1 flex flex-col justify-end group relative h-full">
            <div
              className={`w-full ${colorMap[color]} transition-all duration-500 ease-out hover:opacity-80`}
              style={{ height: `${value}%` }}
            >
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none z-10 whitespace-nowrap">
                Key {idx + 1}: {value}%
              </div>
            </div>
            <div className="text-[8px] text-center text-gray-400 mt-1 hidden sm:block">{idx + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
