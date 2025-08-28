interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
  variant: 'workstation' | 'setting';
}

export const settingButtonStyles = ({ isMobile, isTablet, variant }: ResponsiveProps) => ({
  button: {
    width: '100%',
    height: '100%',
    fontSize: variant === 'workstation' 
      ? (isMobile ? '0.8rem' : isTablet ? '1.0rem' : '1.2rem')
      : (isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.6rem'),
    fontWeight: 700,
    margin: '0',
    padding: '4px',
    boxSizing: 'border-box' as const,
    overflow: 'visible',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: 0,
    border: 'none',
    background: '#f8f9fa',
    color: '#495057',
    display: 'flex',
    flexDirection: variant === 'workstation' ? 'column' as const : 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: variant === 'workstation' ? 2 : 0,
    opacity: 1,
    minHeight: variant === 'workstation' 
      ? '12vh' 
      : (isTablet ? '12vh' : '80px'),
    zIndex: variant === 'setting' ? 10000 : 1,
    position: 'relative' as const,
    ...(variant === 'workstation' && {
      borderTop: '2px solid #222', // 保持工作站按鈕的上邊線
      borderBottom: 'none', // 移除工作站按鈕的下邊線
    }),
    ...(variant === 'setting' && {
      borderTop: '2px solid #222', // 保持設定按鈕的上邊線
      borderBottom: 'none', // 移除設定按鈕的下邊線
      boxShadow: 'none',
    }),
  },
});
