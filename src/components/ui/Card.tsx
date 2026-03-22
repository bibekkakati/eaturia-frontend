import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/** Versatile card container for grouping related content with optional borders and elevations. */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const base = 'rounded-2xl bg-white';

  const variants: Record<string, string> = {
    default:  'border border-gray-100 shadow-sm',
    bordered: 'border border-gray-300',
    elevated: 'shadow-lg border border-gray-100',
  };

  const paddings: Record<string, string> = {
    none: '',
    sm:   'p-4',
    md:   'p-6',
    lg:   'p-8',
  };

  return (
    <div
      className={`${base} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
