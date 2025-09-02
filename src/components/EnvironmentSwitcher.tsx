"use client";

import { useState, useEffect } from 'react';
import { getCurrentEnvironment, isLocalEnvironment, isDevEnvironment, isProdEnvironment } from '../lib/api-config';

/**
 * 環境切換器組件
 * 用於開發時快速切換 API 環境
 */
export function EnvironmentSwitcher() {
  const [currentEnv, setCurrentEnv] = useState<string>('local');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 只在開發環境顯示
    if (process.env.NODE_ENV === 'development') {
      setCurrentEnv(getCurrentEnvironment());
      setIsVisible(true);
    }
  }, []);

  const handleEnvironmentChange = (env: string) => {
    // 更新環境變數 (僅在開發環境有效)
    if (process.env.NODE_ENV === 'development') {
      // 注意：這只是前端顯示，實際的環境變數需要在 .env.local 中設定
      setCurrentEnv(env);
      console.log(`環境切換為: ${env}`);
      console.log('請在 .env.local 中設定 NEXT_PUBLIC_API_ENV 並重新啟動開發伺服器');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        API 環境: {currentEnv.toUpperCase()}
      </div>
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleEnvironmentChange('local')}
          style={{
            padding: '2px 6px',
            fontSize: '10px',
            backgroundColor: isLocalEnvironment() ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          LOCAL
        </button>
        <button
          onClick={() => handleEnvironmentChange('dev')}
          style={{
            padding: '2px 6px',
            fontSize: '10px',
            backgroundColor: isDevEnvironment() ? '#FF9800' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          DEV
        </button>
        <button
          onClick={() => handleEnvironmentChange('prod')}
          style={{
            padding: '2px 6px',
            fontSize: '10px',
            backgroundColor: isProdEnvironment() ? '#F44336' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          PROD
        </button>
      </div>
      <div style={{ marginTop: '5px', fontSize: '10px', opacity: 0.7 }}>
        實際切換需修改 .env.local
      </div>
    </div>
  );
}
