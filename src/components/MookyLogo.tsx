import React from 'react';
import './MookyLogo.css';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export default function MookyLogo({ className = '', ...props }: Props) {
  return (
    <div
      className={`mooky-logo ${className}`}
      role="img"
      aria-label="Mooky"
      {...props}
    >
      <span>M</span>
      <span>O</span>
      <span>O</span>
      <span>K</span>
      <span>Y</span>
    </div>
  );
}
