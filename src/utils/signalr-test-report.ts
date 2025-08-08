export interface SignalRTestResult {
  testName: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  message: string
  timestamp: Date
}

export interface SignalRTestReport {
  summary: {
    totalTests: number
    passedTests: number
    failedTests: number
    skippedTests: number
    totalDuration: number
    averageDuration: number
  }
  results: SignalRTestResult[]
  performance: {
    eventsPerSecond: number
    memoryUsage: number
    connectionTime: number
  }
  recommendations: string[]
  timestamp: Date
}

export class SignalRTestReporter {
  private results: SignalRTestResult[] = []
  private startTime: Date = new Date()

  addResult(testName: string, status: 'passed' | 'failed' | 'skipped', duration: number, message: string) {
    this.results.push({
      testName,
      status,
      duration,
      message,
      timestamp: new Date()
    })
  }

  generateReport(): SignalRTestReport {
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.status === 'passed').length
    const failedTests = this.results.filter(r => r.status === 'failed').length
    const skippedTests = this.results.filter(r => r.status === 'skipped').length
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0

    // 計算效能指標
    const connectionTests = this.results.filter(r => r.testName.includes('connection'))
    const eventTests = this.results.filter(r => r.testName.includes('event'))
    
    const connectionTime = connectionTests.length > 0 
      ? connectionTests.reduce((sum, r) => sum + r.duration, 0) / connectionTests.length 
      : 0

    const eventsPerSecond = eventTests.length > 0 
      ? eventTests.length / (totalDuration / 1000) 
      : 0

    const memoryUsage = process.memoryUsage ? process.memoryUsage().heapUsed / 1024 / 1024 : 0

    // 生成建議
    const recommendations = this.generateRecommendations()

    return {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        totalDuration,
        averageDuration
      },
      results: this.results,
      performance: {
        eventsPerSecond,
        memoryUsage,
        connectionTime
      },
      recommendations,
      timestamp: new Date()
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const failedTests = this.results.filter(r => r.status === 'failed')
    const slowTests = this.results.filter(r => r.duration > 1000)

    if (failedTests.length > 0) {
      recommendations.push(`發現 ${failedTests.length} 個失敗的測試，建議檢查網路連線和事件處理邏輯`)
    }

    if (slowTests.length > 0) {
      recommendations.push(`發現 ${slowTests.length} 個執行時間較長的測試，建議優化效能`)
    }

    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length
    if (avgDuration > 500) {
      recommendations.push('平均測試時間較長，建議檢查系統效能')
    }

    const successRate = this.results.filter(r => r.status === 'passed').length / this.results.length
    if (successRate < 0.9) {
      recommendations.push('測試成功率低於 90%，建議檢查系統穩定性')
    }

    if (recommendations.length === 0) {
      recommendations.push('所有測試通過，系統運作正常')
    }

    return recommendations
  }

  exportToJSON(): string {
    return JSON.stringify(this.generateReport(), null, 2)
  }

  exportToMarkdown(): string {
    const report = this.generateReport()
    
    return `# SignalR 測試報告

## 📊 測試摘要

- **總測試數**: ${report.summary.totalTests}
- **通過**: ${report.summary.passedTests} ✅
- **失敗**: ${report.summary.failedTests} ❌
- **跳過**: ${report.summary.skippedTests} ⏭️
- **總耗時**: ${report.summary.totalDuration}ms
- **平均耗時**: ${report.summary.averageDuration.toFixed(2)}ms

## 📈 效能指標

- **事件處理速度**: ${report.performance.eventsPerSecond.toFixed(2)} 事件/秒
- **記憶體使用**: ${report.performance.memoryUsage.toFixed(2)}MB
- **連線時間**: ${report.performance.connectionTime.toFixed(2)}ms

## 📋 測試結果

${report.results.map(result => {
  const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️'
  return `- ${statusIcon} **${result.testName}** (${result.duration}ms)
  - ${result.message}
  - ${result.timestamp.toLocaleString()}`
}).join('\n')}

## 💡 建議

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## 📅 報告時間

${report.timestamp.toLocaleString()}

---
*此報告由 SignalR 測試系統自動生成*
`
  }

  exportToHTML(): string {
    const report = this.generateReport()
    
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SignalR 測試報告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-item { background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .results { margin: 20px 0; }
        .result-item { background: #fff; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 4px solid #ddd; }
        .result-item.passed { border-left-color: #28a745; }
        .result-item.failed { border-left-color: #dc3545; }
        .result-item.skipped { border-left-color: #ffc107; }
        .recommendations { background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SignalR 測試報告</h1>
        <p>生成時間: ${report.timestamp.toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="summary-item">
            <h3>總測試數</h3>
            <p>${report.summary.totalTests}</p>
        </div>
        <div class="summary-item passed">
            <h3>通過</h3>
            <p>${report.summary.passedTests} ✅</p>
        </div>
        <div class="summary-item failed">
            <h3>失敗</h3>
            <p>${report.summary.failedTests} ❌</p>
        </div>
        <div class="summary-item skipped">
            <h3>跳過</h3>
            <p>${report.summary.skippedTests} ⏭️</p>
        </div>
    </div>

    <h2>效能指標</h2>
    <ul>
        <li>事件處理速度: ${report.performance.eventsPerSecond.toFixed(2)} 事件/秒</li>
        <li>記憶體使用: ${report.performance.memoryUsage.toFixed(2)}MB</li>
        <li>連線時間: ${report.performance.connectionTime.toFixed(2)}ms</li>
    </ul>

    <h2>測試結果</h2>
    <div class="results">
        ${report.results.map(result => {
          const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️'
          return `<div class="result-item ${result.status}">
            <strong>${statusIcon} ${result.testName}</strong> (${result.duration}ms)<br>
            ${result.message}<br>
            <small>${result.timestamp.toLocaleString()}</small>
          </div>`
        }).join('')}
    </div>

    <div class="recommendations">
        <h2>建議</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`
  }
}

// 使用範例
export function createTestReporter(): SignalRTestReporter {
  return new SignalRTestReporter()
} 