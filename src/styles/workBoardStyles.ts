interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const workBoardStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  container: {
    flex: 1,
    padding: 0,
    margin: 0,
    overflow: 'hidden',
    maxHeight: '100%'
  },

  table: {
    tableLayout: 'fixed' as const,
    width: '100%',
    height: '100%',
    minWidth: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    marginTop: 0,
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    padding: 0,
    borderCollapse: 'collapse' as const,
  },

  tbody: {
    overflow: 'hidden',
    maxHeight: '100%'
  },

  tableRow: {
    overflow: 'hidden',
    maxHeight: '100%'
  },

  tableCell: {
    verticalAlign: 'top' as const,
    minWidth: 0,
    maxWidth: '100%',
    width: '33.33%',
    boxSizing: 'border-box' as const,
    padding: 0,
    overflow: 'hidden',
    maxHeight: '100%',
    borderBottom: '2px solid #222',
    borderRight: '2px solid #222'
  },

  columnHeader: {
    textAlign: 'center' as const,
    background: '#FFA042',
    color: '#fff',
    fontWeight: 900,
    fontSize: isMobile ? '1.5rem' : isTablet ? '1.7rem' : '1.9rem',
    padding: isMobile ? '2px 1px' : '3px 2px',
    border: 'none',
    borderBottom: '2px solid #222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '0.2em',
    fontFamily: 'Arial, sans-serif',
  },

  orderCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    background: '#f5f5f5',
    color: '#222',
    fontWeight: 500,
    borderRadius: 12,
    padding: 0,
    margin: isMobile ? '4px 2px' : '6px 4px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minHeight: isMobile ? 80 : 100,
    maxWidth: '100%',
  },

  cardHeader: {
    padding: isMobile ? '4px 8px' : '6px 12px',
    fontSize: isMobile ? '1.2rem' : isTablet ? '1.5rem' : '1.7rem',
    fontWeight: 700,
    textAlign: 'center' as const,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottom: '1px solid #222',
    color: '#fff',
  },

  cardContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? '8px 4px' : '12px 8px',
    flex: 1,
    gap: 4,
  },

  itemRow: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  itemName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: isMobile ? '1.1rem' : isTablet ? '1.4rem' : '1.6rem',
    fontWeight: 700
  },

  itemBadge: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: isMobile ? '1.0rem' : isTablet ? '1.3rem' : '1.5rem',
    fontWeight: 700
  },

  itemNote: {
    fontSize: isMobile ? '0.7rem' : isTablet ? '0.9rem' : '1.0rem',
    color: '#d7263d',
    fontStyle: 'italic',
    textAlign: 'left' as const,
    overflow: 'visible',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    alignSelf: 'flex-start',
    marginRight: isMobile ? '8px' : '12px',
    marginTop: '4px',
    lineHeight: '1.3',
    maxWidth: '100%',
  },
});
