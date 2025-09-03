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
    width: isMobile ? '95vw' : 700,
    maxWidth: '98vw',
    minWidth: isMobile ? '80vw' : 600,
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
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: isMobile ? '20px 0' : '24px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16
  },

  row: {
    display: 'grid',
    // 平均欄寬（移除 20/40/20/20 比例）
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    alignItems: 'center',
    background: '#fff',
    color: '#222',
    borderRadius: 0,
    padding: isMobile ? '12px 0 12px 30px' : '16px 0 16px 30px',
    marginBottom: isMobile ? 12 : 16,
    fontWeight: 700,
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem',
    border: 'none',
    overflow: 'visible',
    width: '100%',
    gap: 8,
    margin: '0 auto',
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
  },

  tableCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    overflow: 'visible',
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
    justifySelf: 'start',
    gap: 4,
    paddingLeft: 0,
    marginLeft: isMobile ? 0 : 0,
    maxWidth: '100%',
    minWidth: 0,
  },

  tableText: {
    fontSize: isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.6rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    fontFamily: 'Microsoft JhengHei, 微軟正黑體, PingFang TC, PingFang SC, Helvetica Neue, Arial, sans-serif',
  },

  nameCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    justifyContent: 'center',
    textAlign: 'left' as const,
    overflow: 'visible',
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
    paddingLeft: 0,
    marginLeft: 0,
    maxWidth: '100%',
    minWidth: 0,
    wordBreak: 'break-word' as const,
    overflowWrap: 'break-word' as const,
  },

  nameText: {
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
    overflow: 'visible',
    textOverflow: 'clip',
    whiteSpace: 'normal',
    wordBreak: 'break-word' as const,
    overflowWrap: 'break-word' as const,
    maxWidth: '100%',
    fontFamily: 'Microsoft JhengHei, 微軟正黑體, PingFang TC, PingFang SC, Helvetica Neue, Arial, sans-serif',
  },

  noteText: {
    fontSize: isMobile ? '0.8rem' : isTablet ? '1.0rem' : '1.2rem',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
    // 在 HOLD 視窗中完整顯示備註內容，不截斷
    whiteSpace: 'normal',
    wordBreak: 'break-word' as const,
    overflowWrap: 'break-word' as const,
    maxWidth: '100%',
    fontFamily: 'Microsoft JhengHei, 微軟正黑體, PingFang TC, PingFang SC, Helvetica Neue, Arial, sans-serif',
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
    alignItems: 'center',
    fontFamily: 'Microsoft JhengHei, 微軟正黑體, PingFang TC, PingFang SC, Helvetica Neue, Arial, sans-serif',
  },

  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },

  actionButton: {
    minWidth: isMobile ? 36 : 44,
    padding: '10px 14px',
    marginRight: 8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: isMobile ? '1.8rem' : isTablet ? '2.0rem' : '2.2rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    fontFamily: 'Microsoft JhengHei, 微軟正黑體, PingFang TC, PingFang SC, Helvetica Neue, Arial, sans-serif'
  },

  maxButton: {
    minWidth: isMobile ? 36 : 44,
    padding: '10px 14px',
    marginRight: 8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: isMobile ? '1.1rem' : isTablet ? '1.3rem' : '1.5rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    fontFamily: 'Microsoft JhengHei, 微軟正黑體, PingFang TC, PingFang SC, Helvetica Neue, Arial, sans-serif'
  },

  editCount: {
    minWidth: isMobile ? 24 : 32,
    textAlign: 'center' as const,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem',
    fontFamily: 'Microsoft JhengHei, 微軟正黑體, PingFang TC, PingFang SC, Helvetica Neue, Arial, sans-serif'
  },

  // 退餐资料新框限样式
  returnItemContainer: {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    border: '2px solid #dee2e6',
    borderRadius: '12px',
    padding: isMobile ? '12px 16px' : '16px 20px',
    marginTop: '3px',
    width: 'calc(100% - 64px)',
    maxWidth: 'calc(100% - 64px)',
    boxSizing: 'border-box' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    position: 'relative' as const,
    marginLeft: '16px',
    marginRight: '48px',
  },

  returnItemHeader: {
    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
    color: '#fff',
    padding: isMobile ? '6px 12px' : '8px 16px',
    borderRadius: '8px',
    fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.0rem',
    fontWeight: 700,
    marginBottom: '12px',
    textAlign: 'left' as const,
    boxShadow: '0 2px 6px rgba(220, 53, 69, 0.3)',
  },

  returnItemRow: {
    display: 'grid',
    // 与主数据行保持一致的列宽比例：桌号20% | 品项名称备注30% | 原本数量20% | 异动数量按钮30%
    gridTemplateColumns: '2fr 3fr 2fr 3fr',
    alignItems: 'center',
    gap: isMobile ? 12 : 16,
    width: '100%',
    maxWidth: '100%',
    padding: isMobile ? '8px 0' : '10px 0',
  },

  returnItemCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    textAlign: 'left' as const,
  },

  returnItemText: {
    fontSize: isMobile ? '1.1rem' : isTablet ? '1.3rem' : '1.2rem',
    fontWeight: 600,
    color: '#495057',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },

  returnItemCount: {
    fontSize: isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.3rem',
    fontWeight: 700,
    color: '#dc3545',
    textAlign: 'left' as const,
  },

  returnItemLabel: {
    fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.0rem',
    fontWeight: 700,
    color: '#dc3545',
    textAlign: 'left' as const,
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
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
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
    boxSizing: 'border-box' as const,
    fontFamily: 'Microsoft JhengHei, 微軟正黑體, PingFang TC, PingFang SC, Helvetica Neue, Arial, sans-serif',
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
    boxSizing: 'border-box' as const,
    fontFamily: 'Microsoft JhengHei, 微軟正黑體, PingFang TC, PingFang SC, Helvetica Neue, Arial, sans-serif',
  },
});
