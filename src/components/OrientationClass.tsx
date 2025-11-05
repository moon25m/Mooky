import { useEffect } from 'react';

export default function OrientationClass(){
  useEffect(()=>{
    const update = () => {
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      document.body.classList.toggle('is-landscape', !!isLandscape);
    };
    update();
    window.addEventListener('orientationchange', update);
    window.addEventListener('resize', update);
    return ()=>{
      window.removeEventListener('orientationchange', update);
      window.removeEventListener('resize', update);
    };
  },[]);
  return null;
}
