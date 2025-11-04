declare module '../components/BirthdayCountdown.jsx' {
  import type React from 'react';
  export interface BirthdayCountdownProps {
    label?: string;
    onReached?: () => void;
    autoRedirect?: boolean;
    doConfetti?: boolean;
  }
  const BirthdayCountdown: React.FC<BirthdayCountdownProps>;
  export default BirthdayCountdown;
}
