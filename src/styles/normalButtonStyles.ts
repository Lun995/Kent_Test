interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const normalButtonStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  button: {
    width: 'calc(100% - 8px)',
    height: 'calc(100% - 8px)',
    fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem',
    fontWeight: 700,
    margin: '0',
    padding: '4px',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    background: '#f8f9fa',
    color: '#495057',
    border: '2px solid #222',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
});
