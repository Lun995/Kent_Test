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
    fontSize: isMobile ? '1.0rem' : isTablet ? '1.8rem' : '1.4rem',
    fontWeight: 700,
    color: '#495057'
  },

  workstationText: {
    color: '#495057',
    fontSize: isMobile ? '0.9rem' : isTablet ? '1.7rem' : '1.3rem',
    fontWeight: 700
  },

  settingText: {
    color: '#495057',
    fontSize: isMobile ? '1.3rem' : isTablet ? '2.1rem' : '1.7rem',
    fontWeight: 700
  },


});
