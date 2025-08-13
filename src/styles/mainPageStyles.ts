interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const mainPageStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  mainContainer: {
    border: '3px solid #222',
    borderRadius: 0,
    height: '100vh',
    width: '100vw',
    minHeight: 0,
    minWidth: 0,
    maxWidth: '100vw',
    maxHeight: '100vh',
    background: '#fff',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'stretch',
    margin: 0,
    overflow: 'visible',
    boxSizing: 'border-box' as const,
  },

  rightContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
    height: '100vh',
    minHeight: '100vh',
    maxHeight: '100vh',
    overflow: 'visible',
    boxSizing: 'border-box' as const,
    flexShrink: 1,
    position: 'relative' as const,
    zIndex: 1,
  },
});
