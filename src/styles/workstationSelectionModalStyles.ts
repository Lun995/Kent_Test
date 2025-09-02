interface ResponsiveProps {
  isMobile: boolean;
  isTablet: boolean;
}

export const workstationSelectionModalStyles = ({ isMobile, isTablet }: ResponsiveProps) => ({
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? '16px' : '24px',
  },

  modal: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    width: isMobile ? '95vw' : isTablet ? '80vw' : '600px',
    maxWidth: '90vw',
    maxHeight: '85vh',
    border: 'none',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2)',
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    animation: 'modalSlideIn 0.3s ease-out',
  },

  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    padding: isMobile ? '20px 16px' : '24px 20px',
    borderRadius: '20px 20px 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'relative' as const,
  },

  headerIcon: {
    fontSize: isMobile ? '2rem' : '2.5rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },

  headerContent: {
    flex: 1,
  },

  title: {
    margin: 0,
    fontSize: isMobile ? '1.5rem' : isTablet ? '1.8rem' : '2rem',
    fontWeight: 700,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },

  subtitle: {
    margin: '4px 0 0 0',
    fontSize: isMobile ? '0.9rem' : '1rem',
    opacity: 0.9,
    fontWeight: 400,
  },

  closeButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: '#ffffff',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
  },



  workstationList: {
    flex: 1,
    overflow: 'auto',
    padding: isMobile ? '16px' : '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },

  workstationItem: {
    background: '#ffffff',
    border: '2px solid #e9ecef',
    borderRadius: '16px',
    padding: isMobile ? '16px' : '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },

  selectedItem: {
    border: '2px solid #667eea',
    background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)',
    transform: 'translateY(-2px)',
  },

  disabledItem: {
    opacity: 0.5,
    cursor: 'not-allowed',
    background: '#f8f9fa',
  },

  workstationInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  workstationName: {
    fontSize: isMobile ? '1.2rem' : '1.4rem',
    fontWeight: 700,
    color: '#495057',
    textAlign: 'center' as const,
  },

  defaultBadge: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: 700,
    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)',
  },

  selectionIndicator: {
    position: 'absolute' as const,
    bottom: '12px',
    right: '12px',
    background: '#667eea',
    color: '#ffffff',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 700,
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
  },

  currentWorkstationBadge: {
    position: 'absolute' as const,
    top: '12px',
    left: '12px',
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: 700,
    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)',
    zIndex: 1,
  },

  currentWorkstationItem: {
    border: '2px solid #28a745',
    background: 'linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%)',
    boxShadow: '0 4px 16px rgba(40, 167, 69, 0.2)',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '16px',
  },

  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  loadingText: {
    color: '#6c757d',
    fontSize: '1rem',
    margin: 0,
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '16px',
    color: '#6c757d',
  },

  emptyIcon: {
    fontSize: '3rem',
    opacity: 0.5,
  },

  emptyText: {
    fontSize: '1rem',
    margin: 0,
    textAlign: 'center' as const,
  },

  footer: {
    padding: isMobile ? '16px' : '20px',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    background: '#f8f9fa',
    borderRadius: '0 0 20px 20px',
  },

  cancelButton: {
    background: '#6c757d',
    color: '#ffffff',
    border: 'none',
    padding: isMobile ? '10px 20px' : '12px 24px',
    borderRadius: '10px',
    fontSize: isMobile ? '0.9rem' : '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  confirmButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    padding: isMobile ? '10px 20px' : '12px 24px',
    borderRadius: '10px',
    fontSize: isMobile ? '0.9rem' : '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },

  disabledConfirmButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
});
