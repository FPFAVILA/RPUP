import React from 'react';

interface GlowTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'accent' | 'gold' | 'white';
  animate?: boolean;
}

export const GlowText: React.FC<GlowTextProps> = ({
  children,
  className = '',
  variant = 'accent',
  animate = false
}) => {
  const variantStyles = {
    accent: 'text-gradient-accent',
    gold: 'text-gradient-gold',
    white: 'text-white'
  };

  const animationClass = animate ? 'animate-text-glow' : '';

  return (
    <span className={`${variantStyles[variant]} ${animationClass} ${className}`}>
      {children}
    </span>
  );
};
