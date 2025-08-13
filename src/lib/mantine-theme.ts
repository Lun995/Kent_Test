import { MantineThemeOverride } from '@mantine/core';

export const mantineTheme: MantineThemeOverride = {
  // 色彩系統
  colors: {
    // 自訂藍色色階
    blue: [
      '#eff6ff', // 0: 最淺
      '#dbeafe', // 1
      '#bfdbfe', // 2
      '#93c5fd', // 3
      '#60a5fa', // 4
      '#3b82f6', // 5: 主要藍色
      '#2563eb', // 6
      '#1d4ed8', // 7: 深藍色
      '#1e40af', // 8
      '#1e3a8a', // 9: 最深
    ],
    // 自訂紅色色階
    red: [
      '#fef2f2', // 0: 最淺
      '#fecaca', // 1
      '#fca5a5', // 2
      '#f87171', // 3
      '#ef4444', // 4: 主要紅色
      '#dc2626', // 5
      '#b91c1c', // 6
      '#991b1b', // 7
      '#7f1d1d', // 8
      '#450a0a', // 9: 最深
    ],
    // 自訂綠色色階
    green: [
      '#f0fdf4', // 0: 最淺
      '#dcfce7', // 1
      '#bbf7d0', // 2
      '#86efac', // 3
      '#4ade80', // 4
      '#22c55e', // 5: 主要綠色
      '#16a34a', // 6
      '#15803d', // 7
      '#166534', // 8
      '#14532d', // 9: 最深
    ],
  },

  // 字體系統
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  
  // 字體大小
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },

  // 間距系統
  spacing: {
    xs: '0.5rem',     // 8px
    sm: '0.75rem',    // 12px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // 圓角系統
  radius: {
    xs: '0.25rem',    // 4px
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
  },

  // 陰影系統
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // 斷點系統
  breakpoints: {
    xs: '36em',   // 576px
    sm: '48em',   // 768px
    md: '62em',   // 992px
    lg: '75em',   // 1200px
    xl: '88em',   // 1408px
  },

  // 組件預設樣式
  components: {
    // Button 組件預設樣式
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: 'all 0.2s ease',
        },
      },
    },

    // Input 組件預設樣式
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },

    // Paper 組件預設樣式
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },

    // Modal 組件預設樣式
    Modal: {
      defaultProps: {
        radius: 'lg',
        shadow: 'xl',
      },
    },
  },

  // 其他設定
  primaryColor: 'blue',
  primaryShade: 5,
  
  // 載入狀態
  loader: 'oval',
  
  // 日期格式
  dateFormat: 'YYYY/MM/DD',
  
  // 數字格式
  numberFormat: {
    decimal: '.',
    thousands: ',',
  },
};

