interface CellTypeSettingModalStylesProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const cellTypeSettingModalStyles = ({ isMobile, isTablet }: CellTypeSettingModalStylesProps) => {
  // 添加 CSS 動畫
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
          max-height: 0;
        }
        to {
          opacity: 1;
          transform: translateY(0);
          max-height: 300px;
        }
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .modal-enter {
        animation: fadeIn 0.3s ease-out;
      }
    `;
    
    // 檢查是否已經存在相同的樣式
    if (!document.querySelector('style[data-celltype-modal]')) {
      style.setAttribute('data-celltype-modal', 'true');
      document.head.appendChild(style);
    }
  }

  return {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  modal: {
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '20px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    width: isMobile ? '90%' : isTablet ? '450px' : '550px',
    maxWidth: '550px',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  
  header: {
    padding: '24px 28px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  titleIcon: {
    fontSize: '24px',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
  },
  
  title: {
    margin: 0,
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: 700,
    color: 'white',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    letterSpacing: '0.5px',
  },
  
  closeButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    fontSize: '18px',
    color: 'white',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  
  content: {
    padding: '28px',
    flex: 1,
    overflowY: 'auto' as const,
    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
  },
  
  mainMenuContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  
  settingSection: {
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
  },
  
  mainMenuButton: {
    width: '100%',
    padding: '20px 24px',
    border: 'none',
    borderRadius: '0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left' as const,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  
  buttonIcon: {
    fontSize: '20px',
    marginRight: '12px',
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
  },
  
  buttonText: {
    flex: 1,
    textAlign: 'left' as const,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
  },
  
  expandIcon: {
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'transform 0.3s ease',
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
  },
  
  expandedContent: {
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    padding: '24px',
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
    animation: 'slideDown 0.3s ease-out',
  },
  
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  
  option: {
    display: 'flex',
    alignItems: 'center',
    padding: '18px 20px',
    border: '2px solid #e1e5e9',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  
  radio: {
    marginRight: '16px',
    width: '20px',
    height: '20px',
    accentColor: '#667eea',
    transform: 'scale(1.2)',
  },
  
  optionText: {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: 600,
    color: '#333',
    marginRight: '8px',
  },
  
  placeholderContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center' as const,
    gap: '16px',
  },
  
  placeholderIcon: {
    fontSize: '48px',
    opacity: '0.6',
  },
  
  placeholderText: {
    fontSize: isMobile ? '16px' : '18px',
    color: '#666',
    fontStyle: 'italic',
    margin: 0,
  },
  
  footer: {
    padding: '20px 28px 24px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
  },
  
  cancelButton: {
    padding: '12px 24px',
    border: '2px solid #e1e5e9',
    borderRadius: '12px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  
  confirmButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
  },
  };
};
