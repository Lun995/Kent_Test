/**
 * 常量配置测试文件
 * 用于验证所有配置组合的正确性
 */

import { getNoteTextLimit, NOTE_TEXT_LIMITS } from './constants';

// 测试所有配置组合
function testAllConfigurations() {
  console.log('🧪 开始测试所有配置组合...\n');
  
  // 测试组合情境（最高优先级）
  console.log('📱 组合情境测试（最高优先级）：');
  console.log(`isMobile + celltype='3': ${getNoteTextLimit('3', false, true)} (期望: ${NOTE_TEXT_LIMITS.MOBILE_CELLTYPE_3})`);
  console.log(`isMobile + celltype='4': ${getNoteTextLimit('4', false, true)} (期望: ${NOTE_TEXT_LIMITS.MOBILE_CELLTYPE_4})`);
  console.log(`isTablet + celltype='3': ${getNoteTextLimit('3', true, false)} (期望: ${NOTE_TEXT_LIMITS.TABLET_CELLTYPE_3})`);
  console.log(`isTablet + celltype='4': ${getNoteTextLimit('4', true, false)} (期望: ${NOTE_TEXT_LIMITS.TABLET_CELLTYPE_4})`);
  
  console.log('\n📋 单独 celltype 测试（次优先级）：');
  console.log(`celltype='3': ${getNoteTextLimit('3')} (期望: ${NOTE_TEXT_LIMITS.CELLTYPE_3})`);
  console.log(`celltype='4': ${getNoteTextLimit('4')} (期望: ${NOTE_TEXT_LIMITS.CELLTYPE_4})`);
  
  console.log('\n📱 单独设备类型测试（再次优先级）：');
  console.log(`isMobile: ${getNoteTextLimit(undefined, false, true)} (期望: ${NOTE_TEXT_LIMITS.MOBILE})`);
  console.log(`isTablet: ${getNoteTextLimit(undefined, true, false)} (期望: ${NOTE_TEXT_LIMITS.TABLET})`);
  
  console.log('\n🔧 默认值测试：');
  console.log(`无参数: ${getNoteTextLimit()} (期望: ${NOTE_TEXT_LIMITS.DEFAULT})`);
  
  console.log('\n✅ 测试完成！');
}

// 导出测试函数
export { testAllConfigurations };

// 如果直接运行此文件，则执行测试
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  testAllConfigurations();
}






