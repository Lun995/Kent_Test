interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const backupScreenStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  container: {
    position: 'fixed' as const,
    top: 0,
    left: isMobile ? '20vw' : isTablet ? '15vw' : '8vw',
    width: isMobile ? '80vw' : isTablet ? '85vw' : '92vw',
    height: '100vh',
    backgroundColor: '#000',
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },

  title: {
    fontSize: isMobile ? '2.2rem' : isTablet ? '2.8rem' : '3.2rem',
    fontWeight: 700,
    marginBottom: isMobile ? '2rem' : '3rem',
    textAlign: 'center' as const,
  },

  subtitle: {
    fontSize: isMobile ? '1.7rem' : isTablet ? '2.2rem' : '2.4rem',
    fontWeight: 600,
    marginBottom: isMobile ? '3rem' : '4rem',
    textAlign: 'center' as const,
  },

  closeButton: {
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.7rem' : '1.9rem',
    fontWeight: 700,
    padding: isMobile ? '12px 24px' : '16px 32px',
    borderRadius: 12,
  },
});
