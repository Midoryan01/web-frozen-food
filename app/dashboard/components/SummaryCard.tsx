"use client";

import React from 'react';
import { LucideProps } from 'lucide-react'; // Impor tipe untuk ikon Lucide

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType<LucideProps>; 
  color?: string; 
  description?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'bg-sky-600', 
  description,
}) => {
  return (
    <div className={`p-5 rounded-xl shadow-lg text-white ${color} transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        <Icon className="h-7 w-7 sm:h-8 sm:w-8 opacity-80" />
      </div>
      <p className="text-2xl sm:text-3xl font-bold mb-1">
        {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
      </p>
      {description && (
        <p className="text-xs sm:text-sm opacity-90">{description}</p>
      )}
    </div>
  );
};

export default SummaryCard;
