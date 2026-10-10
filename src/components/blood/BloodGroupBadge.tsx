import React from 'react';
import { BloodGroup } from '@/lib/types';
import { getBloodBadgeStyle } from '@/lib/utils';

interface BloodGroupBadgeProps {
  bloodGroup: BloodGroup;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

export const BloodGroupBadge: React.FC<BloodGroupBadgeProps> = ({
  bloodGroup,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const style = getBloodBadgeStyle(bloodGroup);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-semibold rounded-md min-w-[32px] text-center',
    md: 'text-sm px-2.5 py-1 font-bold rounded-lg min-w-[42px] text-center shadow-sm',
    lg: 'text-base px-3.5 py-1.5 font-extrabold rounded-xl min-w-[54px] text-center shadow-md',
    xl: 'text-2xl px-5 py-2.5 font-black rounded-2xl min-w-[70px] text-center shadow-lg',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-mono transition-transform duration-200 hover:scale-105 ${style.bg} ${style.text} ${sizeClasses[size]} ${className}`}
      title={`Blood Group ${bloodGroup}`}
    >
      {bloodGroup}
      {showLabel && <span className="ml-1.5 text-xs font-normal opacity-90">Type</span>}
    </span>
  );
};
