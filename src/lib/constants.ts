/**
 * 全域常量配置文件
 */

/**
 * 品项备注文字字数限制配置
 */
export const NOTE_TEXT_LIMITS = {
  // 默认字数限制
  DEFAULT: 18,
  
  // 根据显示模式的字数限制
  CELLTYPE_3: 32,  // 3列模式：32个字（每行16字，最多2行）
  CELLTYPE_4: 19,  // 4列模式：19个字（已更新）
  
  // 移动设备字数限制
  MOBILE: 15,
  
  // 平板设备字数限制
  TABLET: 20,
  
  // 组合情境的字数限制（优先级最高）
  MOBILE_CELLTYPE_3: 32,    // 移动设备 + 3列模式：与 3列统一为 32 个字
  MOBILE_CELLTYPE_4: 10,    // 移动设备 + 4列模式：10个字
  TABLET_CELLTYPE_3: 21,    // 平板 + 3列：上限 21
  TABLET_CELLTYPE_4: 15,    // 平板 + 4列：上限 15（超過15個字顯示...）
  
  // 特殊情境的字数限制
  COMPACT: 8,               // 紧凑模式：8个字
  SPACIOUS: 30,             // 宽松模式：30个字
} as const;

/**
 * 品項備註換行寬度（每行字數）
 * 需求：celltype=3 時每行 16 字
 */
export const NOTE_WRAP_SIZES = {
  DEFAULT: 12,
  CELLTYPE_3: 16,
  CELLTYPE_4: 12,
} as const;

export function getNoteWrapSize(celltype?: '3' | '4'): number {
  if (celltype === '3') return NOTE_WRAP_SIZES.CELLTYPE_3;
  if (celltype === '4') return NOTE_WRAP_SIZES.CELLTYPE_4;
  return NOTE_WRAP_SIZES.DEFAULT;
}

/**
 * 获取品项备注文字的字数限制
 * @param celltype 显示模式：'3'为3列模式，'4'为4列模式
 * @param isTablet 是否为平板设备
 * @param isMobile 是否为移动设备
 * @returns 字数限制
 */
export function getNoteTextLimit(
  celltype?: '3' | '4',
  isTablet: boolean = false,
  isMobile: boolean = false
): number {
  // 最高优先级：组合情境判断
  if (isMobile && celltype === '3') {
    return NOTE_TEXT_LIMITS.MOBILE_CELLTYPE_3;
  }
  
  if (isMobile && celltype === '4') {
    return NOTE_TEXT_LIMITS.MOBILE_CELLTYPE_4;
  }
  
  if (isTablet && celltype === '3') {
    return NOTE_TEXT_LIMITS.TABLET_CELLTYPE_3; // 您的特殊需求：26个字
  }
  
  if (isTablet && celltype === '4') {
    return NOTE_TEXT_LIMITS.TABLET_CELLTYPE_4;
  }
  
  // 次优先级：单独根据 celltype 判断
  if (celltype === '3') {
    return NOTE_TEXT_LIMITS.CELLTYPE_3;
  }
  
  if (celltype === '4') {
    return NOTE_TEXT_LIMITS.CELLTYPE_4;
  }
  
  // 再次优先级：根据设备类型判断
  if (isMobile) {
    return NOTE_TEXT_LIMITS.MOBILE;
  }
  
  if (isTablet) {
    return NOTE_TEXT_LIMITS.TABLET;
  }
  
  // 默认返回
  return NOTE_TEXT_LIMITS.DEFAULT;
}
