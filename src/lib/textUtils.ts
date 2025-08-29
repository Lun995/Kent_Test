/**
 * 文字處理工具函數
 */

import { getNoteTextLimit } from './constants';

/**
 * 處理品項備註文字，根據顯示模式和設備類型調整最大長度
 * @param text 原始文字
 * @param celltype 顯示模式：'3'為3列模式，'4'為4列模式
 * @param isTablet 是否為平板設備
 * @param isMobile 是否為移動設備
 * @returns 處理後的文字
 */
export function truncateNoteText(
  text: string, 
  celltype?: '3' | '4',
  isTablet: boolean = false,
  isMobile: boolean = false
): string {
  if (!text) {
    return text;
  }
  
  // 使用全域配置獲取字數限制
  const maxLength = getNoteTextLimit(celltype, isTablet, isMobile);
  
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
