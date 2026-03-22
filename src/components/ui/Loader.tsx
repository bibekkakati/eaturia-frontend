import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/** Loading spinner component that can be displayed inline or as a full-screen overlay. */
export const Loader: React.FC<LoaderProps> = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const Icon = <Loader2 className={`${sizes[size]} text-[#8b5cf6] animate-spin`} />;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          {Icon}
          <span className="text-slate-600 font-medium animate-pulse">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      {Icon}
    </div>
  );
};
