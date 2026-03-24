import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

const mobileUAPattern =
  /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i;

export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;

  if (window.Capacitor?.isNativePlatform()) return true;

  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const narrowViewport = window.matchMedia(
    `(max-width: ${MOBILE_BREAKPOINT}px)`
  ).matches;

  const mobileUA = mobileUAPattern.test(navigator.userAgent);

  return (hasTouch && narrowViewport) || mobileUA;
}

export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(isMobileDevice);

  useEffect(() => {
    const check = () => setIsMobile(isMobileDevice());

    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);

    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return isMobile;
}
