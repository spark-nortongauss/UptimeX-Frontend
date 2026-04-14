import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ className = '', size = 'default', text, fullScreen = false }) {
  const sizeClasses = {
    small: 'w-5 h-5',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-20 h-20'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.default;

  if (size === 'inline') {
    return <Loader2 className={`w-4 h-4 text-ng-teal animate-spin ${className}`} />;
  }

  const containerClasses = fullScreen 
    ? `fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm ${className}`
    : `flex flex-col items-center justify-center p-8 w-full h-full min-h-[150px] ${className}`;

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        {/* Outer decorative rings providing a premium isolated look */}
        <div className="absolute inset-[-60%] rounded-full border-t-2 border-l-2 border-ng-teal opacity-30 animate-[spin_3s_linear_infinite]" />
        <div className="absolute inset-[-30%] rounded-full border-b-2 border-r-2 border-ng-teal opacity-20 animate-[spin_2s_linear_infinite_reverse]" />
        
        {/* Main spinner symbol */}
        <Loader2 className={`${spinnerSize} text-ng-teal animate-spin`} />
      </div>
      
      {text && (
        <p className="mt-10 text-xs font-semibold text-ng-teal opacity-80 tracking-[0.2em] uppercase animate-pulse text-center max-w-[200px]">
          {text}
        </p>
      )}
    </div>
  );
}
