import React from 'react';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'glow' | 'gradient';
  hover?: boolean;
  onClick?: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  onClick
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variantStyles = {
    default: 'glass-premium',
    glass: 'glass',
    glow: 'glass-premium shadow-glow-accent',
    gradient: 'gradient-card'
  };

  const hoverStyles = hover ? 'hover:scale-[1.02] hover:shadow-glow-accent cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  );
};
