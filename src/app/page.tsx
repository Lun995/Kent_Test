"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useIsMobile } from '../hooks/useIsMobile';

export default function LoginPage() {
  const { isTablet } = useIsMobile();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNoShiftModal, setShowNoShiftModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [activeType, setActiveType] = useState('pos');
  const [loginMessage, setLoginMessage] = useState('');

  const router = useRouter();

  // 設定頁面背景圖片
  useEffect(() => {
    document.body.style.backgroundImage = 'url(/background.png)';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center bottom';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundColor = 'rgb(0, 163, 232)';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // 清理函數
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundColor = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setLoginMessage('密碼錯誤！');
      setShowSuccessModal(false);
      setShowNoShiftModal(false);
      return;
    }

    setIsLoading(true);

    // 清除所有之前的訊息狀態
    setLoginMessage('');
    setShowSuccessModal(false);
    setShowNoShiftModal(false);

    // 立即處理登入邏輯，無延遲
    if (password === '1234') {
      // 情境1: 密碼為1234，登入成功
      setIsLoading(false);
      setShowSuccessModal(true);
      // 1秒後自動跳轉到主頁面
      setTimeout(() => {
        router.push('/main');
      }, 1000);
    } else if (password === '12345') {
      // 情境2: 密碼為12345，顯示無開班資料
      setIsLoading(false);
      setShowNoShiftModal(true);
    } else {
      // 情境3: 其他密碼，顯示帳號密碼錯誤
      setIsLoading(false);
      setLoginMessage('密碼錯誤！');
    }
  };

  const handleInputBlur = () => {
    if (username && password) {
      // 強制滾輪回到最上方
      window.scrollTo(0, 0);
    }
  };

  // 清除所有訊息狀態
  const clearAllMessages = () => {
    setLoginMessage('');
    setShowSuccessModal(false);
    setShowNoShiftModal(false);
  };

  // 當用戶開始輸入時清除舊訊息
  const handleInputChange = () => {
    clearAllMessages();
  };

  // 打卡機功能處理
  const handleAttendance = () => {
    console.log('打卡機功能被點擊');
    // 這裡可以添加打卡機的具體邏輯
  };

  // 機台變更功能處理
  const handleDeviceChange = () => {
    console.log('機台變更功能被點擊');
    // 這裡可以添加機台變更的具體邏輯
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center" style={{ overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     
      {/* 主要登入區域 */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative'
      }}>
        <div 
          id="loginWrap"
                                           style={{
              width: '380px',
              height: '600px',
              padding: '2rem',
              borderRadius: '50px',
              border: '2px solid rgba(181, 181, 182, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(5px)',
              position: 'relative',
                           // 平板時往下調整 35px
             marginTop: isTablet ? '85px' : '60px',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
        >
          {/* Logo 區域 */}
          <div id="posLogo" style={{ 
            padding: '80px 0 30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}>
            <div style={{ marginBottom: '16px', marginTop: '20px' }}>
              <Image 
                src="/login-logo.png" 
                alt="Login Logo" 
                width={200} 
                height={120} 
                className="object-contain"
              />
            </div>
          </div>

                     {/* 登入表單 */}
           <div style={{ 
             marginTop: isTablet ? '-5px' : '0px',
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             width: '100%'
           }}>
            {/* KDS 功能選項卡 - 移動到登入表單上方 */}
            <div style={{ 
              padding: '0 40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              marginBottom: '20px'
            }}>
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: '600',
                  color: '#fff',
                  cursor: 'pointer',
                  opacity: '100%',
                  textAlign: 'center'
                }}
              >
                <span>KDS</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* 用戶名輸入框 */}
              <div style={{ position: 'relative', width: '100%', marginBottom: '10px' }}>
                <img 
                  src="/img-user.png" 
                  style={{ 
                    position: 'absolute',
                    top: '50%', 
                    left: '22px', 
                    width: '26px', 
                    height: '26px',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }}
                  alt="User Icon"
                />
                <input
                  type="text"
                  id="txUserNo"
                  autoComplete="off"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    handleInputChange();
                  }}
                  onBlur={handleInputBlur}
                  style={{
                    height: '55px',
                    paddingLeft: '80px',
                    fontSize: '25px',
                    borderRadius: '30px',
                    border: 'none',
                    boxShadow: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    color: '#000',
                    textAlign: 'left'
                  }}
                />
              </div>

              {/* 密碼輸入框 */}
              <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
                <img 
                  src="/img-lock.png" 
                  style={{ 
                    position: 'absolute',
                    top: '50%', 
                    left: '23px', 
                    width: '22px', 
                    height: '22px',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }}
                  alt="Lock Icon"
                />
                <input
                  type="password"
                  id="txPassword"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    handleInputChange();
                  }}
                  onBlur={handleInputBlur}
                  style={{
                    height: '55px',
                    paddingLeft: '80px',
                    fontSize: '25px',
                    borderRadius: '30px',
                    border: 'none',
                    boxShadow: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    color: '#000',
                    textAlign: 'left'
                  }}
                />
              </div>

              {/* 登入按鈕 */}
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                <button
                  id="btnLogin"
                  type="submit"
                  disabled={isLoading}
                  style={{
                    height: '55px',
                    padding: '1px 35px',
                    fontSize: '30px',
                    letterSpacing: '2px',
                    borderRadius: '30px',
                    color: '#fff',
                    border: '1px solid #fff',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {isLoading ? '登入中...' : 'Signin'}
                </button>
              </div>

              {/* 統一訊息顯示區域 */}
              {(loginMessage || showSuccessModal || showNoShiftModal) && (
                <div style={{ 
                  marginTop: '10px',
                  paddingTop: '5px', 
                  textAlign: 'center',
                  width: '100%',
                  fontSize: '18px',
                  fontWeight: '500',
                  minHeight: '30px' // 確保訊息區域有固定高度
                }}>
                  {showSuccessModal && (
                    <span style={{ color: '#4ade80' }}>登入成功！正在跳轉到主頁面...</span>
                  )}
                  {showNoShiftModal && (
                    <span style={{ color: '#f97316' }}>無開班資料，請聯繫管理員確認開班狀態</span>
                  )}
                  {loginMessage && !showSuccessModal && !showNoShiftModal && (
                    <span style={{ color: '#fff' }}>{loginMessage}</span>
                  )}
                </div>
              )}

            </form>
          </div>

        </div>

        {/* 打卡機按鈕 - 中央區塊左側 */}
        <div 
          id="btnAttendance" 
          className="position-absolute pointer" 
          onClick={handleAttendance}
          style={{
            position: 'absolute',
            left: 'calc(50% - 360px)',
            top: 'calc(50% + 120px)',
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.3s ease',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
            e.currentTarget.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
            e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
          }}
        >
          <img 
            src="/img-attendance.png" 
            style={{ width: '100px' }}
            alt="打卡機"
          />
          <div style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            textAlign: 'center'
          }}>
            打卡機
          </div>
        </div>

        {/* 機台變更按鈕 - 右側 */}
        <div 
          id="btnDeviceChange" 
          className="position-absolute pointer" 
          onClick={handleDeviceChange}
          style={{
            position: 'absolute',
            left: 'calc(50% + 360px)',
            top: 'calc(50% + 120px)',
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.3s ease',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
            e.currentTarget.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
            e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
          }}
        >
                    <img 
            src="/img-device.png" 
            style={{ width: '100px' }}
            alt="機台變更"
          />
          <div style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            textAlign: 'center'
          }}>
            機台變更
          </div>
        </div>

        
      </div>

      

      {/* 機台資訊 - 視窗底部中央（固定） */}
      <div
        id="machineInfo"
        style={{
          position: 'fixed',
          bottom: '26px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          fontSize: '18px',
          fontWeight: '700',
          textAlign: 'center',
          zIndex: 20
        }}
      >
        機號: 012 KDS 2025.8.1.0103023
      </div>

      {/* 帳號密碼錯誤視窗 */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h3 className="text-red-600 text-xl font-semibold mb-4">帳號密碼錯誤</h3>
            <p className="text-gray-600 mb-6">請檢查您的帳號密碼是否正確</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="bg-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
