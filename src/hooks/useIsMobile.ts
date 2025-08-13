import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      // 手機：寬度 < 768px 或 (寬度 >= 768px 且寬高比 > 2.5)
      // 這樣可以涵蓋 iPhone 12 Pro (844x390, 寬高比2.16) 等手機設備
      setIsMobile(width < 768 || (width >= 768 && aspectRatio > 2.5));
      
      // 平板：寬度 >= 768px 且 寬高比 <= 2.5 且 寬度 <= 1400px
      // 這樣可以涵蓋 iPad Air (1180x820, 寬高比1.44)、iPad Pro 等各種平板設備
      setIsTablet(width >= 768 && aspectRatio <= 2.5 && width <= 1400);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet };
}
