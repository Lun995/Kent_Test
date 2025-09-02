import { useEffect, useState } from 'react';

export function usePWA() {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // 檢查網路狀態
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 註冊 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          setSwRegistration(registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });

      // 監聽 Service Worker 更新
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated');
        window.location.reload();
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkForUpdate = async () => {
    if (swRegistration) {
      await swRegistration.update();
    }
  };

  return {
    isOnline,
    swRegistration,
    checkForUpdate,
  };
}
