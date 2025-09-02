interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
  celltype: '3' | '4';
}

export const cardItemStyles = ({ isMobile, isTablet, celltype }: ResponsiveProps) => ({
  rowContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column' as const,
    gap: '4px',
    justifyContent: 'center',
    height: '100%'
  },

  lineContainer: {
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
    gap: '8px'
  },

  nameCell: {
    flex: '0 0 65%',
    textAlign: 'left' as const,
    minWidth: 0,
    overflow: 'visible',
    paddingLeft: celltype === '4' ? (isTablet ? '5px' : '15px') : '15px'
  },

  qtyCell: {
    flex: '0 0 35%',
    textAlign: 'center' as const,
    minWidth: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: celltype === '4' ? '155px' : '130px',
    alignSelf: 'center' as const
  },

  nameText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    fontSize: isMobile ? '1.1rem' : isTablet ? '1.4rem' : '1.6rem',
    fontWeight: 700
  },

  noteText: {
    fontSize: isMobile ? '0.7rem' : isTablet ? '0.9rem' : '1.0rem',
    color: '#666',
    textAlign: 'left' as const,
    lineHeight: '1.2',
    maxWidth: '100%',
    wordWrap: 'break-word' as const,
    overflowWrap: 'break-word' as const,
    whiteSpace: 'normal' as const,
    display: 'block',
    overflow: 'hidden',
  },

  qtyBadge: {
    display: 'inline-block',
    padding: '6px 10px',
    backgroundColor: '#6c757d',
    color: 'white',
    borderRadius: '4px',
    fontSize: '1.4rem',
    fontWeight: 600,
    width: '25px',
    textAlign: 'center' as const
  }
});
