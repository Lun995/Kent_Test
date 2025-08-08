using SignalRTest.Hubs;

var builder = WebApplication.CreateBuilder(args);

// 加入 SignalR 服務
builder.Services.AddSignalR();

// 加入 CORS 服務（允許前端連線）
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("http://localhost:3000", "https://localhost:3000")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

var app = builder.Build();

// 使用 CORS
app.UseCors();

// 設定路由
app.MapHub<ChatHub>("/signalrhub");

// 測試端點
app.MapGet("/", () => "SignalR Hub 服務正在運行！");
app.MapGet("/health", () => "OK");

Console.WriteLine("SignalR Hub 服務啟動中...");
Console.WriteLine("Hub URL: https://localhost:7001/signalrhub");

app.Run("https://localhost:7001"); 