interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const workstationSwitchButtonStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  container: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: '2px solid #ffffff',
    borderRadius: '16px',
    padding: isMobile ? '16px' : '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'relative' as const,
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
    minWidth: isMobile ? '280px' : '320px',
    overflow: 'hidden',
  },

  hoveredContainer: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
    borderColor: '#ffffff',
  },

  pressedContainer: {
    transform: 'translateY(0px)',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  },

  disabledContainer: {
    opacity: 0.6,
    cursor: 'not-allowed',
    background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
  },

  iconContainer: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: isMobile ? '2rem' : '2.5rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  },

  statusIndicator: {
    position: 'absolute' as const,
    top: '-4px',
    right: '-4px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid #ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },

  infoContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },

  workstationName: {
    color: '#ffffff',
    fontSize: isMobile ? '1.1rem' : '1.3rem',
    fontWeight: 700,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  workstationDetails: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },

  workstationNo: {
    background: 'rgba(255,255,255,0.2)',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: '8px',
    fontSize: '0.7rem',
    fontWeight: 600,
    backdropFilter: 'blur(10px)',
  },

  workstationStatus: {
    background: 'rgba(255,255,255,0.15)',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: '8px',
    fontSize: '0.7rem',
    fontWeight: 600,
    backdropFilter: 'blur(10px)',
  },

  switchIndicator: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    padding: '8px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
  },

  switchIcon: {
    fontSize: '1rem',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
  },

  switchText: {
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },

  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(102, 126, 234, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    backdropFilter: 'blur(4px)',
  },

  loadingSpinner: {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
});
