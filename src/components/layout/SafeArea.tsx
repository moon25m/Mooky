import React from 'react';

export type SafeAreaProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

// Adds iOS/Android browser safe-area insets so content doesn't collide with notches/home bars.
// This is a lightweight wrapper; it won’t change layout beyond padding the edges where needed.
export default function SafeArea({ children, className = '', style }: SafeAreaProps) {
  return (
    <div
      className={className}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
