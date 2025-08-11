interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const selectItemModalStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modal: {
    background: '#fff',
    width: isMobile ? '80vw' : 340,
    maxWidth: '95vw',
    minWidth: isMobile ? '50vw' : 240,
    minHeight: isMobile ? '12vh' : 120,
    maxHeight: '90vh',
    border: '3px solid #222',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    padding: isMobile ? '4vw' : 32,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    overflow: 'hidden',
  },

  message: {
    fontWeight: 900,
    fontSize: isMobile ? '1.25rem' : isTablet ? '1.4rem' : '1.6rem',
    color: '#d7263d',
    marginBottom: 16,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  confirmButton: {
    width: isMobile ? '40vw' : 100,
    minWidth: 60,
    maxWidth: 120,
    fontWeight: 700,
    fontSize: isMobile ? '1.15rem' : isTablet ? '1.3rem' : '1.5rem',
    borderRadius: 8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
});
