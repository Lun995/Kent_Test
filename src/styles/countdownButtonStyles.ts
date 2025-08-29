interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const countdownButtonStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  button: {
    width: 'calc(100% - 8px)',
    height: 'calc(100% - 8px)',
    fontSize: isMobile ? '0.8rem' : isTablet ? '1.0rem' : '1.2rem',
    fontWeight: 700,
    margin: '0',
    marginTop: '8px', // 調整上方縮排，與其他按鈕保持一致
    padding: '4px',
    boxSizing: 'border-box' as const,
    overflow: 'visible',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderRadius: 8,
    background: '#f8f9fa',
    color: '#495057',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    border: '2px solid #222',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    minHeight: '12vh',
  },

  countdownText: {
    fontSize: isMobile ? '0.9rem' : isTablet ? '1.7rem' : '1.3rem',
    fontWeight: 700,
    color: '#495057'
  },
});
