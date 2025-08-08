const http = require('http');
const https = require('https');
const { HubConnectionBuilder, LogLevel } = require('@microsoft/signalr');

// 詳細診斷 localhost:5019 的 SignalR 服務器
async function detailedDiagnose5019() {
    console.log('🔍 詳細診斷 SignalR 服務器...\n');
    console.log('📍 目標服務器: localhost:5019');
    console.log('⏰ 診斷時間:', new Date().toLocaleString());
    console.log('');

    // 1. 檢查 HTTP 服務器
    console.log('1️⃣ 檢查 HTTP 服務器...');
    try {
        const response = await new Promise((resolve, reject) => {
            const req = http.get('http://localhost:5019', (res) => {
                resolve(res);
            });
            req.on('error', reject);
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
        
        console.log(`✅ HTTP 服務器回應正常 (狀態碼: ${response.statusCode})`);
        console.log(`📋 回應標頭:`, response.headers);
        
        // 檢查是否有重定向
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
            console.log('🔄 檢測到重定向，服務器可能使用 HTTPS');
        }
    } catch (error) {
        console.log(`❌ HTTP 服務器無法連線: ${error.message}`);
    }

    // 2. 檢查 HTTPS 服務器
    console.log('\n2️⃣ 檢查 HTTPS 服務器...');
    try {
        const response = await new Promise((resolve, reject) => {
            const req = https.get('https://localhost:5019', {
                rejectUnauthorized: false // 忽略 SSL 憑證驗證
            }, (res) => {
                resolve(res);
            });
            req.on('error', reject);
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
        
        console.log(`✅ HTTPS 服務器回應正常 (狀態碼: ${response.statusCode})`);
        console.log(`📋 回應標頭:`, response.headers);
    } catch (error) {
        console.log(`❌ HTTPS 服務器無法連線: ${error.message}`);
    }

    // 3. 測試不同的 Hub 路徑
    console.log('\n3️⃣ 測試不同的 Hub 路徑...');
    const hubPaths = [
        '/hubs/connectionuser',
        '/signalrhub',
        '/hub',
        '/chathub',
        '/notificationhub',
        '/hubs/chathub',
        '/hubs/notificationhub'
    ];

    for (const path of hubPaths) {
        console.log(`\n🔍 測試路徑: ${path}`);
        
        try {
            const connection = new HubConnectionBuilder()
                .withUrl(`https://localhost:5019${path}`, {
                    skipNegotiation: false,
                    transport: 1
                })
                .configureLogging(LogLevel.Warning)
                .build();

            await connection.start();
            console.log(`✅ 路徑 ${path} 可用`);
            console.log(`📊 連線狀態: ${connection.state}`);
            console.log(`🆔 ConnectionId: ${connection.connectionId}`);
            
            // 測試基本功能
            try {
                await connection.invoke('SendMessage', { message: 'Test connection' });
                console.log('✅ 消息發送功能正常');
            } catch (error) {
                console.log(`⚠️ 消息發送功能: ${error.message}`);
            }

            await connection.stop();
            console.log(`✅ 路徑 ${path} 測試完成`);
            break; // 找到可用路徑後停止測試
        } catch (error) {
            console.log(`❌ 路徑 ${path} 不可用: ${error.message}`);
        }
    }

    // 4. 檢查 CORS 設定
    console.log('\n4️⃣ 檢查 CORS 設定...');
    try {
        const response = await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: 'localhost',
                port: 5019,
                path: '/hubs/connectionuser',
                method: 'OPTIONS',
                headers: {
                    'Origin': 'http://localhost:3000',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                }
            }, (res) => {
                resolve(res);
            });
            req.on('error', reject);
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
            req.end();
        });
        
        console.log(`✅ CORS 預檢請求回應 (狀態碼: ${response.statusCode})`);
        console.log(`📋 CORS 標頭:`, {
            'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
            'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
            'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
        });
    } catch (error) {
        console.log(`❌ CORS 檢查失敗: ${error.message}`);
    }

    // 5. 提供建議
    console.log('\n5️⃣ 故障排除建議:');
    console.log('1. 確認您的 ASP.NET Core 服務器配置:');
    console.log('   - 檢查 Program.cs 中的 CORS 設定');
    console.log('   - 確認 SignalR Hub 路徑配置');
    console.log('   - 檢查是否啟用了 HTTPS');
    
    console.log('\n2. 常見的配置問題:');
    console.log('   - CORS 設定不正確');
    console.log('   - Hub 路徑不匹配');
    console.log('   - SSL 憑證問題');
    console.log('   - 防火牆阻擋');
    
    console.log('\n3. 建議的 ASP.NET Core 配置:');
    console.log('```csharp');
    console.log('// Program.cs');
    console.log('var builder = WebApplication.CreateBuilder(args);');
    console.log('');
    console.log('// 添加 CORS');
    console.log('builder.Services.AddCors(options =>');
    console.log('{');
    console.log('    options.AddPolicy("AllowAll", policy =>');
    console.log('    {');
    console.log('        policy.AllowAnyOrigin()');
    console.log('              .AllowAnyMethod()');
    console.log('              .AllowAnyHeader()');
    console.log('              .AllowCredentials();');
    console.log('    });');
    console.log('});');
    console.log('');
    console.log('// 添加 SignalR');
    console.log('builder.Services.AddSignalR();');
    console.log('');
    console.log('var app = builder.Build();');
    console.log('');
    console.log('// 使用 CORS');
    console.log('app.UseCors("AllowAll");');
    console.log('');
    console.log('// 配置 SignalR Hub');
    console.log('app.MapHub<ConnectionUserHub>("/hubs/connectionuser");');
    console.log('');
    console.log('app.Run();');
    console.log('```');
}

// 執行診斷
detailedDiagnose5019().catch(console.error);

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n🛑 正在關閉診斷...');
    process.exit(0);
}); 