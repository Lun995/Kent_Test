/**
 * 文字處理工具函數
 */

/**
 * 處理品項備註文字，如果超過22個字則用...取代後面顯示的文字
 * @param text 原始文字
 * @param maxLength 最大長度，預設為22
 * @returns 處理後的文字
 */
export function truncateNoteText(text: string, maxLength: number = 20): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  // 如果超過22個字，取前22個字加上...
  return text.substring(0, maxLength) + '...';
}

/**
 * 檢查文字是否超過指定長度
 * @param text 要檢查的文字
 * @param maxLength 最大長度
 * @returns 是否超過長度
 */
export function isTextOverflow(text: string, maxLength: number = 20): boolean {
  return Boolean(text) && text.length > maxLength;
}
