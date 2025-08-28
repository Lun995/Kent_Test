interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const mainPageStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  mainContainer: {
    border: '4px solid #696969', // 加上外框線，顏色為 HEX #696969
    borderRadius: '12px', // 加上圓角
    height: 'calc(100vh - 16px)', // 上下各縮排8px
    width: 'calc(100vw - 14px)', // 左右各縮排7px
    minHeight: 0,
    minWidth: 0,
    maxWidth: 'calc(100vw - 14px)',
    maxHeight: 'calc(100vh - 16px)',
    background: '#fff',
    position: 'fixed' as const,
    top: '8px', // 上方縮排8px
    left: '7px', // 左方縮排7px
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'stretch',
    margin: 0,
    overflow: 'visible',
    boxSizing: 'border-box' as const,
    boxShadow: '0 8px 32px rgba(105, 105, 105, 0.3), 0 4px 16px rgba(105, 105, 105, 0.2)', // 深灰色陰影效果
  },

  rightContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
    height: '100%', // 調整為100%以配合父容器
    minHeight: '100%',
    maxHeight: '100%',
    overflow: 'visible',
    boxSizing: 'border-box' as const,
    flexShrink: 1,
    position: 'relative' as const,
    zIndex: 1,
  },
});
