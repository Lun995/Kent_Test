interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const clockStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  container: {
    width: '100%',
    textAlign: 'center' as const,
    fontWeight: 700,
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
    padding: '8px 0',
    userSelect: 'none' as const,
    pointerEvents: 'none' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});
