/**
 * 文字處理工具函數
 */

/**
 * 處理品項備註文字，根據顯示模式調整最大長度
 * @param text 原始文字
 * @param celltype 顯示模式：'3'為3列模式，'4'為4列模式
 * @returns 處理後的文字
 */
export function truncateNoteText(text: string, celltype?: '3' | '4'): string {
  if (!text) {
    return text;
  }
  
  // 根據 celltype 決定最大長度
  let maxLength: number;
  if (celltype === '4') {
    maxLength = 12; // 4列模式：12個字
  } else if (celltype === '3') {
    maxLength = 18; // 3列模式：18個字
  } else {
    maxLength = 18; // 預設：18個字（3列模式）
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // 如果超過最大長度，取前N個字加上...
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
