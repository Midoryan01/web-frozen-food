// app/dashboard/components/ThSortable.tsx
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Tipe props menjadi lebih umum menggunakan `string`
interface ThSortableProps {
    name: string;
    sortKey: string | null;
    requestSort: (key: string) => void;
    sortConfig: { 
        key: string | null; 
        direction: 'ascending' | 'descending';
    };
    align?: 'left' | 'right' | 'center';
    className?: string;
}

const ThSortable: React.FC<ThSortableProps> = ({ name, sortKey, requestSort, sortConfig, align = 'left', className = '' }) => {
    const isSorted = sortConfig.key === sortKey;
    const directionIcon = isSorted ? (sortConfig.direction === 'ascending' ? <ChevronUp size={14} className="ml-1"/> : <ChevronDown size={14} className="ml-1"/>) : <ChevronUp size={14} className="ml-1 opacity-30 hover:opacity-70"/>;
    
    return (
        <th 
            className={`p-3 text-${align} text-xs font-semibold text-slate-500 uppercase tracking-wider ${sortKey ? 'cursor-pointer hover:bg-slate-200/70' : ''} transition-colors ${className}`}
            onClick={() => sortKey && requestSort(sortKey)}
        >
            <div className={`flex items-center ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
                {name} {sortKey && directionIcon}
            </div>
        </th>
    );
};

export default ThSortable;