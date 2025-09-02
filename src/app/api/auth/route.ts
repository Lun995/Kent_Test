import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 登入請求的資料驗證 schema
const LoginSchema = z.object({
  username: z.string().min(1, '使用者名稱不能為空'),
  password: z.string().min(1, '密碼不能為空'),
  rememberMe: z.boolean().optional().default(false),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional()
  }).optional()
});

// 登入回應的介面
interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      displayName: string;
      role: 'admin' | 'staff' | 'manager';
      permissions: string[];
      lastLoginAt: string;
    };
    token: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    session: {
      sessionId: string;
      expiresAt: string;
    };
  };
  error?: string;
  details?: any;
}

// 使用者介面
interface User {
  id: string;
  username: string;
  password: string; // 實際應用中應該是 hashed password
  displayName: string;
  role: 'admin' | 'staff' | 'manager';
  permissions: string[];
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 登入記錄介面
interface LoginLog {
  id: string;
  userId: string;
  username: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  success: boolean;
  timestamp: Date;
  failureReason?: string;
}

// 模擬使用者資料庫
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123', // 實際應用中應該是 hashed password
    displayName: '系統管理員',
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'manage_users'],
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    username: 'staff',
    password: 'staff123',
    displayName: '一般員工',
    role: 'staff',
    permissions: ['read', 'write'],
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
];

// 模擬登入記錄
const mockLoginLogs: LoginLog[] = [];

// 驗證使用者憑證
async function validateCredentials(username: string, password: string): Promise<User | null> {
  // 模擬資料庫查詢延遲
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const user = mockUsers.find(u => 
    u.username === username && 
    u.password === password && 
    u.isActive
  );
  
  return user || null;
}

// 記錄登入嘗試
async function logLoginAttempt(
  username: string, 
  success: boolean, 
  userId?: string, 
  failureReason?: string,
  deviceInfo?: any
): Promise<void> {
  const logEntry: LoginLog = {
    id: Date.now().toString(),
    userId: userId || 'unknown',
    username,
    ipAddress: deviceInfo?.ipAddress,
    userAgent: deviceInfo?.userAgent,
    deviceType: deviceInfo?.deviceType,
    success,
    timestamp: new Date(),
    failureReason
  };
  
  mockLoginLogs.push(logEntry);
  
  // 實際應用中這裡會寫入資料庫
  console.log('登入記錄:', logEntry);
}

// 生成 JWT Token (模擬)
function generateTokens(user: User): { accessToken: string; refreshToken: string; expiresIn: number } {
  // 實際應用中這裡會使用 JWT 庫生成真實的 token
  const accessToken = `access_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const refreshToken = `refresh_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expiresIn = 3600; // 1 小時
  
  return { accessToken, refreshToken, expiresIn };
}

// 更新使用者最後登入時間
async function updateLastLoginTime(userId: string): Promise<void> {
  // 模擬資料庫更新
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();
  }
  
  console.log(`更新使用者 ${userId} 的最後登入時間`);
}

// 登入 API 端點
export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    // 解析請求內容
    const body = await request.json();
    
    // 驗證請求資料
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
      return NextResponse.json({
        success: false,
        message: '請求資料驗證失敗',
        error: 'VALIDATION_ERROR',
        details: errors
      }, { status: 400 });
    }
    
    const { username, password, rememberMe, deviceInfo } = validationResult.data;
    
    // 特殊密碼情境處理
    if (password === '1234') {
      // 情境1: 密碼為1234，登入成功
      const user = {
        id: 'admin',
        username: 'admin',
        password: '1234',
        displayName: '管理者',
        role: 'admin' as const,
        permissions: ['read', 'write', 'delete', 'manage_users'],
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      };
      
      // 生成 JWT Token
      const tokens = generateTokens(user);
      
      // 更新最後登入時間
      await updateLastLoginTime(user.id);
      
      // 記錄成功的登入嘗試
      await logLoginAttempt(username, true, user.id, undefined, deviceInfo);
      
      // 準備回應資料
      const responseData: LoginResponse = {
        success: true,
        message: '登入成功',
        data: {
          user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            role: user.role,
            permissions: user.permissions,
            lastLoginAt: user.lastLoginAt.toISOString()
          },
          token: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn
          },
          session: {
            sessionId: `session_${user.id}_${Date.now()}`,
            expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()
          }
        }
      };
      
      // 設定 Cookie
      const response = NextResponse.json(responseData);
      
      // 設定 access token cookie
      response.cookies.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: tokens.expiresIn,
        path: '/'
      });
      
      // 設定 refresh token cookie (如果記住我)
      if (rememberMe) {
        response.cookies.set('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60, // 30 天
          path: '/'
        });
      }
      
      return response;
      
    } else if (password === '12345') {
      // 情境2: 密碼為12345，顯示無開班資料
      await logLoginAttempt(username, false, undefined, '無開班資料', deviceInfo);
      
      return NextResponse.json({
        success: false,
        message: '無開班資料',
        error: 'NO_SHIFT_DATA'
      }, { status: 403 });
      
    } else {
      // 情境3: 其他密碼，顯示帳號密碼錯誤
      await logLoginAttempt(username, false, undefined, '帳號密碼資訊錯誤', deviceInfo);
      
      return NextResponse.json({
        success: false,
        message: '帳號密碼資訊錯誤',
        error: 'INVALID_CREDENTIALS'
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('登入 API 錯誤:', error);
    
    return NextResponse.json({
      success: false,
      message: '登入處理過程中發生錯誤',
      error: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

// 登出 API 端點
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // 實際應用中這裡會：
    // 1. 驗證 token
    // 2. 將 token 加入黑名單
    // 3. 清除 session
    
    const response = NextResponse.json({
      success: true,
      message: '登出成功'
    });
    
    // 清除 cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    
    return response;
    
  } catch (error) {
    console.error('登出 API 錯誤:', error);
    
    return NextResponse.json({
      success: false,
      message: '登出處理過程中發生錯誤'
    }, { status: 500 });
  }
}

// 取得當前使用者資訊 (需要驗證 token)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 實際應用中這裡會：
    // 1. 從 cookie 或 header 取得 token
    // 2. 驗證 token 有效性
    // 3. 返回使用者資訊
    
    // 暫時返回錯誤，因為需要實作 token 驗證機制
    return NextResponse.json({
      success: false,
      message: '需要實作 token 驗證機制',
      error: 'NOT_IMPLEMENTED'
    }, { status: 501 });
    
  } catch (error) {
    console.error('取得使用者資訊 API 錯誤:', error);
    
    return NextResponse.json({
      success: false,
      message: '取得使用者資訊過程中發生錯誤'
    }, { status: 500 });
  }
}
