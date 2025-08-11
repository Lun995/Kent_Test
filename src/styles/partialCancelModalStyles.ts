interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const partialCancelModalStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modal: {
    background: '#fff',
    width: isMobile ? '95vw' : 480,
    maxWidth: '98vw',
    minWidth: isMobile ? '70vw' : 360,
    minHeight: isMobile ? '25vh' : 250,
    maxHeight: '85vh',
    border: '3px solid #222',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },

  header: {
    background: '#ffc107',
    color: '#222',
    fontWeight: 900,
    fontSize: isMobile ? '1.5rem' : isTablet ? '1.7rem' : '1.9rem',
    textAlign: 'center' as const,
    borderRadius: '13px 13px 0 0',
    padding: isMobile ? '16px 0' : '20px 0',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid #222',
    fontFamily: 'Microsoft JhengHei, 微軟正黑體, sans-serif'
  },

  content: {
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    padding: isMobile ? '20px' : '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },

  row: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 2.5fr 0.8fr auto',
    alignItems: 'center',
    background: '#fff',
    color: '#222',
    borderRadius: 0,
    padding: isMobile ? '12px 16px' : '16px 20px',
    marginBottom: isMobile ? 12 : 16,
    fontWeight: 700,
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem',
    border: 'none',
    overflow: 'hidden',
    width: isMobile ? '85%' : '80%',
    gap: isMobile ? 8 : 12,
    margin: '0 auto',
  },

  tableCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    overflow: 'hidden',
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
    justifySelf: 'start',
    paddingLeft: isMobile ? 1 : 2,
    gap: 1,
  },

  tableText: {
    fontSize: isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.6rem'
  },

  nameCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    overflow: 'hidden',
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
  },

  nameText: {
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem'
  },

  noteText: {
    fontSize: isMobile ? '1.1rem' : isTablet ? '1.3rem' : '1.5rem',
    color: '#d7263d',
    fontStyle: 'italic',
    marginTop: 2,
  },

  countCell: {
    textAlign: 'center' as const,
    color: '#888',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },

  actionButton: {
    minWidth: isMobile ? 32 : 40,
    padding: '8px 12px',
    marginRight: 8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: isMobile ? '1rem' : '1.2rem',
    fontWeight: 700
  },

  editCount: {
    minWidth: isMobile ? 24 : 32,
    textAlign: 'center' as const,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem'
  },

  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: isMobile ? 12 : 16,
    width: '100%',
    padding: isMobile ? '20px 0' : '24px 0',
    borderTop: '1px solid #ddd',
    overflow: 'hidden',
  },

  holdButton: {
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem',
    fontWeight: 700,
    padding: isMobile ? '12px 20px' : '16px 28px',
    borderRadius: 8,
    minWidth: isMobile ? '80px' : '100px',
    maxWidth: isMobile ? '120px' : '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: '0 0 auto',
    margin: '0 auto',
  },

  closeButton: {
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem',
    fontWeight: 700,
    padding: isMobile ? '12px 20px' : '16px 28px',
    borderRadius: 8,
    minWidth: isMobile ? '80px' : '100px',
    maxWidth: isMobile ? '120px' : '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: '0 0 auto',
    margin: '0 auto',
  },
});
