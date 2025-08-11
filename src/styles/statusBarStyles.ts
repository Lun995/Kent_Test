interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const statusBarStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  container: {
    background: '#f8f9fa',
    borderBottom: '3px solid #dee2e6',
    borderRadius: 0,
    alignItems: 'center',
    padding: isMobile ? '16px 20px' : '20px 24px',
    justifyContent: 'space-between',
    display: 'flex',
    marginBottom: 0,
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
    overflow: 'visible',
    flexShrink: 0,
    gap: isMobile ? '24px' : '36px',
    zIndex: 1,
    position: 'relative' as const,
  },

  statusItem: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    borderRadius: 0,
    padding: isMobile ? '12px 16px' : '16px 20px',
    border: '3px solid #28a745',
    boxShadow: '0 3px 8px rgba(40, 167, 69, 0.25)',
    flex: 1,
    justifyContent: 'center',
    gap: isMobile ? 12 : 16,
    position: 'relative' as const,
    overflow: 'hidden',
  },

  statusNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: isMobile ? 32 : 40,
    height: isMobile ? 28 : 36,
    border: '2px solid #28a745',
    borderRadius: 0,
    background: '#28a745',
    color: '#fff',
    fontWeight: 900,
    fontSize: isMobile ? '1.2rem' : '1.6rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  },

  statusText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 700,
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.6rem' : '1.8rem',
    color: '#28a745'
  },
});
