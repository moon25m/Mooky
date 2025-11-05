import React from 'react';
import '../styles/buttons.css';

export type CTAButtonVariant = 'primary' | 'secondary';

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CTAButtonVariant;
  label: string;
  icon?: 'play' | 'info' | React.ReactNode;
}

const PlayIcon = ({ fill = 'currentColor' }: { fill?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
    <path d="M5 3.3c0-1.02 1.11-1.64 1.98-1.12l12.9 7.45c.9.52.9 1.82 0 2.34l-12.9 7.45C6.11 20.94 5 20.32 5 19.3V3.3z" fill={fill} />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 6h-2V6h2v2zm-2 2h2v8h-2v-8z" fill="currentColor" />
  </svg>
);

const CTAButton: React.FC<CTAButtonProps> = ({ variant = 'primary', label, icon, className = '', ...rest }) => {
  const classes = `cta ${variant} ${className}`.trim();
  return (
    <button type="button" className={classes} aria-label={label} {...rest}>
      <span className="cta-icon" aria-hidden="true">
        {icon === 'play' ? <PlayIcon fill={variant === 'primary' ? '#fff' : 'currentColor'} /> : icon === 'info' ? <InfoIcon /> : icon}
      </span>
      <span className="cta-label">{label}</span>
    </button>
  );
};

export default CTAButton;
