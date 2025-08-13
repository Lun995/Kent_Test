"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 直接跳轉到主頁面，不需要驗證
    router.push('/main');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
                 {/* Logo Section */}
         <div className="bg-white p-8 text-center">
           <h1 className="text-4xl font-bold text-red-600 mb-2" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)' }}>
             KDS
           </h1>
           <p className="text-gray-600 text-lg font-medium">
             wowprime
           </p>
         </div>

        {/* Wave Divider */}
        <div className="h-8 relative overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full" style={{ animation: 'wave 3s ease-in-out infinite' }}>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#3b82f6" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19.77,81.84-31.16,126.6-31.16,44.76,0,85.68,11.39,126.6,31.16,29.58,13.73,58.52,29.65,89.67,39.8,59.18,19.38,125.17,19.69,176.89,9.37C1029.36,56.86,1044,36.92,1057,15.81V0Z" opacity=".5" fill="#3b82f6" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#3b82f6" />
          </svg>
        </div>

        {/* Form Section */}
        <div className="bg-blue-500 p-8" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
          <form onSubmit={handleSubmit}>
                         <div className="space-y-8">
               <div className="flex justify-center">
                 <input
                   type="text"
                   placeholder="Username"
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-3/4 px-6 py-4 text-lg rounded-xl border-0 focus:ring-2 focus:ring-white focus:ring-opacity-30 transition-all duration-200 text-center"
                   style={{ fontSize: '1.125rem' }}
                 />
               </div>
               
               <div className="flex justify-center">
                 <input
                   type="password"
                   placeholder="Password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-3/4 px-6 py-4 text-lg rounded-xl border-0 focus:ring-2 focus:ring-white focus:ring-opacity-30 transition-all duration-200 text-center"
                   style={{ fontSize: '1.125rem' }}
                 />
               </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-blue-600 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 transition-all duration-200 disabled:opacity-50 text-lg"
                style={{ fontSize: '1.125rem' }}
              >
                {isLoading ? '登入中...' : 'Signin'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
        }
      `}</style>
    </div>
  );
}
