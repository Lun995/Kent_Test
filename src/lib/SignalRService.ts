import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

export class SignalRService {
    private signalRConnection: HubConnection | null = null;
    private dispatch: any;
    
    constructor(private username: string, dispatch?: any) {
        this.dispatch = dispatch;
    }
    
    public createUserRoomConnection() {
        console.log('🔧 建立 SignalR 連線...');
        console.log('📍 目標 URL:', 'https://localhost:5019/hubs/connectionuser');
        
        this.signalRConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:5019/hubs/connectionuser")
            .withAutomaticReconnect()
            .build();

        // 監聽 UserConnected 事件
        this.signalRConnection.on("UserConnected", () => {
            console.log("📡 收到 UserConnected 事件");
        });

        // 監聽其他事件
        this.signalRConnection.on("OrderUpdate", (data) => {
            console.log("📡 收到訂單更新事件:", data);
        });

        this.signalRConnection.on("StatusChange", (data) => {
            console.log("📡 收到狀態變更事件:", data);
        });

        this.signalRConnection.on("NewOrder", (data) => {
            console.log("📡 收到新訂單事件:", data);
        });

        this.signalRConnection.on("OrderComplete", (data) => {
            console.log("📡 收到訂單完成事件:", data);
        });

        // 監聽通用消息事件
        this.signalRConnection.on("ReceiveMessage", (data) => {
            console.log("📡 收到消息:", data);
        });

        this.signalRConnection.on("ReceiveNotification", (data) => {
            console.log("📡 收到通知:", data);
        });

        // 設置連線事件處理器
        this.signalRConnection.onreconnecting((error) => {
            console.log("🔄 SignalR 重新連線中...", error);
        });

        this.signalRConnection.onreconnected((connectionId) => {
            console.log("✅ SignalR 重新連線成功！ConnectionId:", connectionId);
        });

        this.signalRConnection.onclose((error) => {
            console.log("❌ SignalR 連線關閉", error);
        });
    }

    public async startConnection() {
        if (!this.signalRConnection) {
            this.createUserRoomConnection();
        }

        try {
            console.log("🔌 正在連線到 SignalR Hub...");
            console.log("📍 Hub URL:", this.signalRConnection!.baseUrl);
            console.log("👤 用戶名:", this.username);
            
            await this.signalRConnection!.start();
            console.log("✅ SignalR 連線成功！");
            console.log("📊 連線狀態:", this.signalRConnection!.state);
            console.log("🆔 ConnectionId:", this.signalRConnection!.connectionId);
            return true;
        } catch (error: any) {
            console.error("❌ SignalR 連線失敗:", error);
            console.error("🔍 錯誤詳情:", {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            
            // 提供具體的故障排除建議
            this.provideTroubleshootingTips(error);
            return false;
        }
    }

    private provideTroubleshootingTips(error: any) {
        console.log("\n🔧 故障排除建議:");
        
        if (error.message.includes('Failed to fetch')) {
            console.log("1. 確認 SignalR 服務器正在運行在 http://localhost:5019");
            console.log("2. 檢查服務器是否支援 WebSocket 連線");
            console.log("3. 確認 CORS 設定允許來自 http://localhost:3000 的連線");
        } else if (error.message.includes('404')) {
            console.log("1. 檢查 Hub 路徑是否正確: /hubs/connectionuser");
            console.log("2. 嘗試其他常見路徑: /signalrhub, /hub, /chathub");
        } else if (error.message.includes('CORS')) {
            console.log("1. 確認服務器端 CORS 設定正確");
            console.log("2. 檢查服務器是否允許 WebSocket 連線");
        } else {
            console.log("1. 檢查網路連線");
            console.log("2. 確認服務器狀態");
            console.log("3. 查看瀏覽器開發者工具的網路標籤");
        }
        
        console.log("4. 嘗試使用 Node.js 腳本測試: node test-signalr-new.js");
    }

    public async removeUserConnection() {
        if (this.signalRConnection) {
            try {
                console.log("🔌 正在斷開 SignalR 連線...");
                await this.signalRConnection.stop();
                console.log("✅ SignalR 斷線成功");
                this.signalRConnection = null;
            } catch (error) {
                console.error("❌ SignalR 斷線失敗:", error);
            }
        }
    }

    public async sendMessage(message: any) {
        if (!this.signalRConnection || this.signalRConnection.state !== 'Connected') {
            throw new Error('SignalR 未連線');
        }

        try {
            console.log("📤 發送消息:", message);
            await this.signalRConnection.invoke("SendMessage", message);
            console.log("✅ 消息發送成功");
        } catch (error) {
            console.error("❌ 消息發送失敗:", error);
            throw error;
        }
    }

    public async sendNotification(notification: any) {
        if (!this.signalRConnection || this.signalRConnection.state !== 'Connected') {
            throw new Error('SignalR 未連線');
        }

        try {
            console.log("📤 發送通知:", notification);
            await this.signalRConnection.invoke("SendNotification", notification);
            console.log("✅ 通知發送成功");
        } catch (error) {
            console.error("❌ 通知發送失敗:", error);
            throw error;
        }
    }

    public async joinGroup(groupName: string) {
        if (!this.signalRConnection || this.signalRConnection.state !== 'Connected') {
            throw new Error('SignalR 未連線');
        }

        try {
            console.log(`📤 加入群組: ${groupName}`);
            await this.signalRConnection.invoke("JoinGroup", groupName);
            console.log("✅ 群組加入成功");
        } catch (error) {
            console.error("❌ 群組加入失敗:", error);
            throw error;
        }
    }

    public async leaveGroup(groupName: string) {
        if (!this.signalRConnection || this.signalRConnection.state !== 'Connected') {
            throw new Error('SignalR 未連線');
        }

        try {
            console.log(`📤 離開群組: ${groupName}`);
            await this.signalRConnection.invoke("LeaveGroup", groupName);
            console.log("✅ 群組離開成功");
        } catch (error) {
            console.error("❌ 群組離開失敗:", error);
            throw error;
        }
    }

    public getConnectionState(): string {
        if (!this.signalRConnection) return 'Disconnected';
        return this.signalRConnection.state;
    }

    public getConnectionId(): string | undefined {
        return this.signalRConnection?.connectionId || undefined;
    }

    public isConnected(): boolean {
        return this.signalRConnection?.state === 'Connected';
    }
}

export default SignalRService; 