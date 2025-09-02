"use client";
import { useEffect } from 'react';

export default function BreathingBorders() {
  useEffect(() => {
    // 動態添加 CSS 動畫樣式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes glowPulse {
        0%   { box-shadow: 0 0 10px rgba(34, 211, 238, 0.3); }
        50%  { box-shadow: 0 0 30px rgba(34, 211, 238, 1); }
        100% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.3); }
      }

      @keyframes gradientBorder {
        0% {
          border-image: linear-gradient(45deg, #ff00cc, #3333ff) 1;
        }
        50% {
          border-image: linear-gradient(45deg, #33ffcc, #ff33ff) 1;
        }
        100% {
          border-image: linear-gradient(45deg, #ff00cc, #3333ff) 1;
        }
      }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // 清理函數
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1f2937',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '40px',
      padding: '40px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        color: 'white',
        fontSize: '2rem',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        邊框呼吸效果展示
      </h1>

      {/* 邊線顏色呼吸 */}
      <div style={{
        width: '256px',
        height: '256px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.125rem',
        borderRadius: '12px',
        border: '4px solid #ef4444',
        animation: 'pulse 2s ease-in-out infinite',
        backgroundColor: 'rgba(239, 68, 68, 0.1)'
      }}>
        邊線顏色呼吸
      </div>

      {/* 邊框光暈呼吸 */}
      <div style={{
        width: '256px',
        height: '256px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.125rem',
        borderRadius: '12px',
        border: '2px solid #22d3ee',
        animation: 'glowPulse 2s ease-in-out infinite',
        backgroundColor: 'rgba(34, 211, 238, 0.1)'
      }}>
        邊框光暈呼吸
      </div>

      {/* 漸層邊框呼吸 */}
      <div style={{
        width: '256px',
        height: '256px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.125rem',
        borderRadius: '12px',
        border: '4px solid transparent',
        animation: 'gradientBorder 3s ease-in-out infinite',
        backgroundColor: 'rgba(255, 0, 204, 0.1)'
      }}>
        漸層邊框呼吸
      </div>

      {/* 返回按鈕 */}
      <a 
        href="/main" 
        style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'background-color 0.2s',
          marginTop: '20px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#3b82f6';
        }}
      >
        返回工作站
      </a>
    </div>
  );
}
