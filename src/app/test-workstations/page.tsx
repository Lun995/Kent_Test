'use client';

import { useState, useEffect } from 'react';

interface Workstation {
  uid: number;
  no: string;
  name: string;
  isDefault: number;
  serialNo: number;
  memo: string;
}

interface ApiResponse {
  message: string;
  code: string;
  data: Workstation[] | null;
}

export default function TestWorkstations() {
  const [taipeiWorkstations, setTaipeiWorkstations] = useState<Workstation[]>([]);
  const [taichungWorkstations, setTaichungWorkstations] = useState<Workstation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkstations = async (storeId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/main?storeId=${storeId}`);
      const data: ApiResponse = await response.json();
      
      if (data.code === '0000' && data.data) {
        if (storeId === 1) {
          setTaipeiWorkstations(data.data);
        } else {
          setTaichungWorkstations(data.data);
        }
      } else {
        throw new Error(data.message || '獲取工作站資料失敗');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkstations(1); // 台北店
    fetchWorkstations(2); // 台中店
  }, []);

  const getDefaultWorkstation = (workstations: Workstation[]) => {
    return workstations.find(ws => ws.isDefault === 1);
  };

  if (loading) {
    return <div className="p-8">載入中...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">錯誤: {error}</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">工作站預設設置測試</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 台北店 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">台北店 (Store ID: 1)</h2>
          
          <div className="mb-4">
            <strong className="text-green-600">預設工作站:</strong>
            {(() => {
              const defaultWS = getDefaultWorkstation(taipeiWorkstations);
              return defaultWS ? (
                <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  {defaultWS.name} (編號: {defaultWS.no})
                </span>
              ) : (
                <span className="ml-2 text-red-600">無預設工作站</span>
              );
            })()}
          </div>
          
          <div className="space-y-2">
            {taipeiWorkstations.map((ws) => (
              <div 
                key={ws.uid} 
                className={`p-3 rounded border ${
                  ws.isDefault === 1 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{ws.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">編號: {ws.no}</span>
                    {ws.isDefault === 1 && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                        預設
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{ws.memo}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 台中店 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">台中店 (Store ID: 2)</h2>
          
          <div className="mb-4">
            <strong className="text-green-600">預設工作站:</strong>
            {(() => {
              const defaultWS = getDefaultWorkstation(taichungWorkstations);
              return defaultWS ? (
                <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  {defaultWS.name} (編號: {defaultWS.no})
                </span>
              ) : (
                <span className="ml-2 text-red-600">無預設工作站</span>
              );
            })()}
          </div>
          
          <div className="space-y-2">
            {taichungWorkstations.map((ws) => (
              <div 
                key={ws.uid} 
                className={`p-3 rounded border ${
                  ws.isDefault === 1 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{ws.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">編號: {ws.no}</span>
                    {ws.isDefault === 1 && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                        預設
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{ws.memo}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button 
          onClick={() => {
            fetchWorkstations(1);
            fetchWorkstations(2);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          重新載入資料
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">預期結果:</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>✅ 台北店預設工作站: <strong>刨肉區</strong></li>
          <li>✅ 台中店預設工作站: <strong>台中袍肉區</strong></li>
          <li>✅ 預設工作站會以綠色邊框和「預設」標籤顯示</li>
        </ul>
      </div>
    </div>
  );
}
