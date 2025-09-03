interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

// HOLD模态框网格布局样式配置
export const holdModalGridStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  // 主要数据行网格布局
  dataRow: {
    display: 'grid',
    // 桌号20% | 品项名称备注30% | 原本数量20% | 异动数量按钮30%
    gridTemplateColumns: '2fr 3fr 2fr 3fr',
    alignItems: 'center',
    background: '#fff',
    color: '#222',
    borderRadius: 0,
    padding: isMobile ? '12px 8px' : '16px 12px',
    marginBottom: isMobile ? 12 : 16,
    fontWeight: 700,
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem',
    border: 'none',
    overflow: 'visible',
    width: isMobile ? '92%' : '88%',
    gap: isMobile ? 16 : 20,
    margin: '0 auto',
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
  },

  // 桌号栏位 (20%)
  tableColumn: {
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
    marginLeft: isMobile ? -4 : -6,
    maxWidth: '100%',
    minWidth: 0,
    width: '100%',
  },

  // 品项名称备注栏位 (30%)
  itemColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    justifyContent: 'center',
    textAlign: 'left' as const,
    overflow: 'visible',
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
    paddingLeft: 0,
    marginLeft: isMobile ? -2 : -3,
    maxWidth: '100%',
    minWidth: 0,
    width: '100%',
  },

  // 原本数量栏位 (20%)
  countColumn: {
    textAlign: 'center' as const,
    color: '#888',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  // 异动数量按钮栏位 (30%)
  actionColumn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    width: '100%',
    gap: isMobile ? 8 : 10,
  },

  // 桌号文字样式
  tableText: {
    fontSize: isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.6rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },

  // 品项名称文字样式
  itemText: {
    fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },

  // 备注文字样式
  noteText: {
    fontSize: isMobile ? '0.8rem' : isTablet ? '1.0rem' : '1.2rem',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },

  // 操作按钮样式
  actionButton: {
    minWidth: isMobile ? 36 : 44,
    padding: '10px 14px',
    marginRight: 8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: isMobile ? '1rem' : '1.2rem',
    fontWeight: 700,
  },

  // 数量显示样式
  editCount: {
    minWidth: isMobile ? 24 : 32,
    textAlign: 'center' as const,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.7rem',
  },
});

// 预设的网格模板配置
export const gridTemplates = {
  // 标准HOLD布局：桌号20% | 品项名称备注30% | 原本数量20% | 异动数量按钮30%
  holdStandard: '2fr 3fr 2fr 3fr',
  
  // 紧凑布局：桌号15% | 品项名称备注40% | 原本数量15% | 异动数量按钮30%
  holdCompact: '1.5fr 4fr 1.5fr 3fr',
  
  // 宽裕布局：桌号25% | 品项名称备注35% | 原本数量20% | 异动数量按钮20%
  holdSpacious: '2.5fr 3.5fr 2fr 2fr',
  
  // 移动端优化：桌号25% | 品项名称备注40% | 原本数量15% | 异动数量按钮20%
  holdMobile: '2.5fr 4fr 1.5fr 2fr',
};

// 响应式网格模板选择器
export const getResponsiveGridTemplate = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return gridTemplates.holdMobile;
  if (isTablet) return gridTemplates.holdCompact;
  return gridTemplates.holdStandard;
};






