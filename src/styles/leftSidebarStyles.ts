interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const leftSidebarStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  container: {
    width: isMobile ? '20vw' : isTablet ? '15vw' : '8vw',
    minWidth: isMobile ? 60 : isTablet ? 100 : 40,
    maxWidth: '100vw',
    height: 'calc(100vh - 24px)', // 與主區塊高度保持一致
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    background: '#f5f5f5',
    borderRight: '4px solid #696969', // 右邊線顏色調整為與畫面外框線相同
    borderBottom: 'none', // 移除下邊線
    borderTopLeftRadius: 12, // 調整為與主容器一致的圓角
    borderBottomLeftRadius: 12, // 調整為與主容器一致的圓角
    borderTopRightRadius: 0, // 右邊線改為直線，不需要圓弧
    borderBottomRightRadius: 0, // 右邊線改為直線，不需要圓弧
    padding: 0,
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    flexShrink: 0,
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    position: 'relative' as const,
    ...(isTablet && {
      minHeight: 'calc(100vh - 20px)', // 與主區塊高度保持一致
      maxHeight: 'calc(100vh - 20px)', // 與主區塊高度保持一致
      overflow: 'hidden',
      height: 'calc(100vh - 20px)', // 與主區塊高度保持一致
      width: '15vw',
      zIndex: 2000,
      position: 'relative' as const,
    }),
  },

  buttonContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    height: '100%',
    padding: '0',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    maxHeight: '100%',
    minHeight: '100%',
    justifyContent: 'space-between',
    ...(isTablet && {
      minHeight: '100%',
      maxHeight: '100%',
    }),
  },

  buttonField: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0', // 移除 padding，避免按鈕與邊界有間距
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    maxHeight: 'auto',
    minHeight: 'calc((100vh - 66px) / 7)', // 7個欄位均分高度，與主區塊保持一致，減少50px
    ...(isTablet && {
      minHeight: 'calc((100vh - 20px) / 7)', // 平板模式下與主區塊高度保持一致
      maxHeight: 'auto',
    }),
  },

  settingButtonContainer: {
    flex: 1, // 改為 flex: 1，讓它與其他按鈕欄位高度一致
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0', // 確保沒有 padding
    margin: '0', // 確保沒有 margin
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    maxHeight: 'auto',
    zIndex: 9999,
    position: 'relative' as const,
    minHeight: 'calc((100vh - 66px) / 7)', // 與其他欄位保持一致的高度，減少50px
    borderBottom: 'none', // 移除下邊線
    borderBottomLeftRadius: 0, // 移除左下角圓弧框限
    ...(isTablet && {
      minHeight: 'calc((100vh - 20px) / 7)', // 平板模式下與主區塊高度保持一致
      maxHeight: 'auto',
    }),
  },

  currentSettingDisplay: {
    marginTop: '8px',
    padding: '4px 8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    fontSize: isMobile ? '0.8rem' : isTablet ? '0.9rem' : '1.0rem',
    color: '#495057',
    fontWeight: 500,
    textAlign: 'center' as const,
    border: '1px solid #dee2e6',
  },

  settingLabel: {
    display: 'block',
    lineHeight: 1.2,
  },

  buttonText: {
    fontSize: isMobile ? '1.0rem' : isTablet ? '1.2rem' : '1.4rem',
    fontWeight: 700,
    color: '#495057'
  },

  workstationText: {
    color: '#495057',
    fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem',
    fontWeight: 700
  },

  settingText: {
    color: '#495057',
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem',
    fontWeight: 700
  },

  // 工作站選單樣式
  workstationMenu: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#fff',
    zIndex: 999999,
    width: isMobile ? '320px' : '380px',
    maxWidth: '90vw',
    minWidth: isMobile ? '240px' : '280px',
    minHeight: isMobile ? '200px' : '240px',
    maxHeight: '80vh',
    border: '3px solid #222',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  workstationMenuHeader: {
    background: '#ffc107',
    color: '#222',
    fontWeight: 900,
    fontSize: isMobile ? '1.6rem' : isTablet ? '1.8rem' : '2.0rem',
    textAlign: 'center' as const,
    borderRadius: '13px 13px 0 0',
    padding: isMobile ? '16px 0' : '20px 0',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid #222',
    fontFamily: 'Microsoft JhengHei, 微軟正黑體, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  workstationMenuContent: {
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: isMobile ? '20px' : '24px',
    minHeight: 0,
    overflow: 'hidden'
  },

  workstationMenuItem: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 16px'
  },

  workstationMenuButton: {
    width: '100%',
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
    fontWeight: 700,
    padding: isMobile ? '16px 20px' : '20px 24px',
    borderRadius: 0,
    border: 'none',
    color: '#222',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isMobile ? '60px' : '70px',
  },

  workstationMenuFooter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: isMobile ? '16px' : '20px',
    borderTop: '1px solid #ddd'
  },

  cancelButton: {
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem',
    fontWeight: 700,
    padding: isMobile ? '12px 20px' : '16px 28px',
    borderRadius: 8,
    minWidth: isMobile ? '80px' : '100px',
  },
});
