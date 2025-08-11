interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const leftSidebarStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  container: {
    width: isMobile ? '20vw' : isTablet ? '15vw' : '8vw',
    minWidth: isMobile ? 60 : isTablet ? 100 : 40,
    maxWidth: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    background: '#f5f5f5',
    borderRight: '2px solid #222',
    borderBottom: '2px solid #222',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    padding: 0,
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    flexShrink: 0,
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    position: 'relative' as const,
    ...(isTablet && {
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      height: '100vh',
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
    padding: '4px',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    maxHeight: 'auto',
    ...(isTablet && {
      minHeight: '10vh',
      maxHeight: '12vh',
    }),
  },

  settingButtonContainer: {
    flex: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    maxHeight: 'auto',
    zIndex: 9999,
    position: 'relative' as const,
    minHeight: '80px',
    ...(isTablet && {
      minHeight: '12vh',
      maxHeight: 'auto',
    }),
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
