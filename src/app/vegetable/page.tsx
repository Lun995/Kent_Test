"use client";
import { useState, useEffect } from 'react';
import React from 'react'; // Added for useEffect
import { Button, Paper, Group, Stack, Text, Badge, Box, Flex, Modal } from '@mantine/core';

// 型別定義
interface OrderItem {
  name: string;
  count: number;
  table: string;
}

interface CategoryItems {
  making: OrderItem[];
  hold: OrderItem[];
  waiting: OrderItem[];
}

interface SelectedItem {
  category: keyof CategoryItems;
  name: string;
  table?: string;
}

export default function Home() {
  // 管理各項目的數量狀態
  const [counts, setCounts] = useState({
    allOrders: 10,
    dineIn: 3,
    takeaway: 5,
    delivery: 2,
  });
  // 新增：管理選取的品項
  const [selectedType, setSelectedType] = useState<string>('allOrders');
  // 新增：管理 Modal 顯示狀態
  const [showModal, setShowModal] = useState<boolean>(false);
  // 新增：選取的品項（{ category, name, table? } 或 null）
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  // Modal 選取的桌號行 index
  const [modalSelectedRow, setModalSelectedRow] = useState<number>(0);
  // Modal 每行的數量（初始為品項原本數量）
  const [modalRowCounts, setModalRowCounts] = useState<number[]>([]);
  // 新增：部分銷單暫存數字
  const [editCount, setEditCount] = useState<number>(0);
  // 新增：每行的更新數量
  const [editCounts, setEditCounts] = useState<number[]>([]);

  // 測試資料：每一筆都帶有桌號
  const [categoryItems, setCategoryItems] = useState<CategoryItems>({
    making: [
      { name: '雪花牛', count: 2, table: '內用A1' },
      { name: '雪花牛', count: 1, table: '內用A2' },
      { name: '豬牛雙拼', count: 1, table: '內用B1' },
    ],
    hold: [],
    waiting: [
      { name: '雪花牛', count: 1, table: 'C1' },
      { name: '豬牛雙拼', count: 1, table: 'C2' },
    ],
  });

  // Modal 內桌號行的資料（含桌號與數量）
  const [modalRows, setModalRows] = useState<OrderItem[]>([]);

  // Modal 開啟時初始化桌號行
  React.useEffect(() => {
    if (showModal && selectedItem) {
      // 取得該品項所有細項
      const rows = categoryItems[selectedItem.category].filter(item => item.name === selectedItem.name).map(item => ({ ...item }));
      setModalRows(rows);
      setModalSelectedRow(0);
      setEditCounts(Array(rows.length).fill(0)); // 每行預設更新數量為0
      setEditCount(0);
    }
  }, [showModal, selectedItem, categoryItems]);

  // Modal + 按鈕
  const handleModalPlus = () => {
    setModalRowCounts(counts => counts.map((c, i) => i === modalSelectedRow ? c + 1 : c));
  };
  // Modal - 按鈕
  const handleModalMinus = () => {
    setModalRowCounts(counts => counts.map((c, i) => i === modalSelectedRow ? Math.max(1, c - 1) : c));
  };
  // Modal 單行 +
  const handleModalRowPlus = (idx: number) => {
    setModalRows(rows => {
      const total = rows.reduce((sum, r) => sum + r.count, 0);
      if (!selectedItem) return rows;
      const item = categoryItems[selectedItem.category].find(i => i.name === selectedItem.name);
      if (!item || total >= item.count) return rows;
      return rows.map((r, i) => i === idx ? { ...r, count: r.count + 1 } : r);
    });
  };
  // Modal 單行 -
  const handleModalRowMinus = (idx: number) => {
    setModalRows(rows => rows.map((r, i) => i === idx ? { ...r, count: Math.max(1, r.count - 1) } : r));
  };
  // Modal 新增桌號 - 移除自動生成邏輯
  const handleModalAddRow = () => {
    if (!selectedItem) return;
    const item = categoryItems[selectedItem.category].find(i => i.name === selectedItem.name);
    if (!item) return;
    const total = modalRows.reduce((sum, r) => sum + r.count, 0);
    if (total >= item.count) return;
    
    // 使用固定的內用A1~A5
    const fixedTables = ['內用A1', '內用A2', '內用A3', '內用A4', '內用A5'];   const nextTableIndex = modalRows.length;
    const newTable = fixedTables[nextTableIndex] || `內用A${nextTableIndex + 1}`;
    
    setModalRows(rows => [...rows, { table: newTable, count: 1, name: item.name }]);
  };
  // Modal Hold 按鈕
  const handleModalHold = () => {
    if (!selectedItem || selectedItem.category !== 'making') return;
    setCategoryItems(prev => {
      // 1. 針對 making，扣除 editCounts 指定的數量
      const updatedMaking = prev.making.map((item, idx) => {
        const modalIdx = modalRows.findIndex(row => row.name === item.name && row.table === item.table);
        if (modalIdx !== -1) {
          const holdCount = editCounts[modalIdx] || 0;
          if (holdCount > 0) {
            return { ...item, count: item.count - holdCount };
          }
        }
        return item;
      }).filter(item => item.count > 0);

      // 2. 新增到 Hold（合併同名同桌號品項）
      let holdMap = new Map<string, OrderItem>();
      // 先把舊的 hold 放進 map
      prev.hold.forEach(h => {
        holdMap.set(`${h.name}__${h.table}`, { ...h });
      });
      // 再把新轉移的加進去（有的話加總數量）
      modalRows.forEach((row, idx) => {
        const holdCount = editCounts[idx] || 0;
        if (holdCount > 0 && row.name && row.table) {
          const key = `${row.name}__${row.table}`;
          if (holdMap.has(key)) {
            holdMap.set(key, {
              ...row,
              count: holdMap.get(key)!.count + holdCount
            });
          } else {
            holdMap.set(key, { name: row.name, table: row.table, count: holdCount });
          }
        }
      });
      return {
        ...prev,
        making: updatedMaking,
        hold: Array.from(holdMap.values()),
      };
    });
    setShowModal(false);
  };

  // 模擬桌號資料
  const mockTables = ['內用-A1', '內用-B2', '外帶01'];

  // 處理數量增加
  const handleIncrease = (category: keyof CategoryItems, idx: number) => {
    setCategoryItems(prev => {
      const newItems = { ...prev };
      newItems[category] = newItems[category].map((item, i) =>
        i === idx ? { ...item, count: item.count + 1 } : item
      );
      return newItems;
    });
  };

  // 彙總同名品項的數量
  function summarizeItems(items: OrderItem[]): { name: string; count: number }[] {
    const summary: Record<string, number> = {};
    items.forEach(item => {
      if (!summary[item.name]) {
        summary[item.name] = 0;
      }
      summary[item.name] += item.count;
    });
    return Object.entries(summary).map(([name, count]) => ({ name, count }));
  }

  // 品項資料陣列化，方便渲染
  const itemTypes = [
    { key: 'allOrders', label: '所有訂單', count: counts.allOrders },
    { key: 'dineIn', label: '內用', count: counts.dineIn },
    { key: 'takeaway', label: '外帶', count: counts.takeaway },
    { key: 'delivery', label: '外送', count: counts.delivery },
  ];

  // 時間顯示 state
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${mm}/${dd} ${hh}:${min}`);
    }
    updateTime();
    const timer = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  return (
    <Flex mih="100vh" bg="dark.9" c="white" p="md">
      {/* 左側按鈕區域 */}
      <Paper w={260} bg="dark.8" p="md" radius="md" mr="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 600, height: '90vh' }}>
        {/* 上方：時間與主要按鈕 */}
        <div>
          <Text ta="center" size="lg" fw={700} mb="md" style={{ letterSpacing: 2 }}>{currentTime ?? ""}</Text>
          <Button fullWidth color="blue" mb="sm" onClick={() => { /* 可加更新邏輯 */ }}>更新</Button>
          <Button fullWidth color="blue" mb="sm" onClick={() => selectedItem && setShowModal(true)}>部分銷單</Button>
        </div>
        {/* 下方：所有功能按鈕 */}
        <Stack mt="md" gap="sm">
          <Button fullWidth color="blue">已點餐</Button>
          <Button fullWidth color="blue">待製作</Button>
          <Button fullWidth color="blue">已完成</Button>
          <Button fullWidth color="blue">歷史紀錄</Button>
          <Button fullWidth color="blue">工作站</Button>
        </Stack>
      </Paper>

      {/* 主要內容區域 */}
      <Box style={{ flex: 1 }}>
        {/* 上排四個 div 顯示項目及數量 */}
        <Group justify="space-between" mb="md">
          {itemTypes.map((item) => (
            <Paper
              key={item.key}
              bg="green.6"
              p="sm"
              radius="md"
              w="25%"
              style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, cursor: 'pointer', border: selectedType === item.key ? '2px solid #FFD700' : '2px solid transparent', transform: selectedType === item.key ? 'scale(1.05)' : undefined, transition: 'all 0.2s' }}
              onClick={() => setSelectedType(item.key)}
            >
              <Text>{item.label}</Text>
              <Badge color="dark" variant="filled">{item.count}</Badge>
            </Paper>
          ))}
        </Group>

        {/* 主要內容區塊（三個類別，每個品項可增加數量，名稱可選取） */}
        <Group align="stretch" gap="md" bg="dark.8" p="md" /* radius="md" */>
          {/* 製作中 */}
          <Paper flex={1} bg="dark.7" radius="md" p="md">
            <Text size="lg" fw={700} mb="sm">製作中</Text>
            <Stack gap="xs">
              {summarizeItems(categoryItems.making).map((item, idx) => (
                <Group
                  key={item.name}
                  justify="space-between"
                  bg={selectedItem && selectedItem.category === 'making' && selectedItem.name === item.name ? 'white' : 'dark.6'}
                  c={selectedItem && selectedItem.category === 'making' && selectedItem.name === item.name ? 'black' : 'white'}
                  px="sm"
                  py={4}
                  style={{ border: selectedItem && selectedItem.category === 'making' && selectedItem.name === item.name ? '2px solid white' : '2px solid transparent', transition: 'all 0.2s', borderRadius: 8 }}
                >
                  <Text
                    style={{ cursor: 'pointer', borderRadius: 4, padding: '2px 8px' }}
                    onClick={() => setSelectedItem({ category: 'making', name: item.name })}
                    onDoubleClick={() => {
                      setCategoryItems(prev => ({
                        ...prev,
                        making: prev.making.filter(m => m.name !== item.name)
                      }));
                      // removeMakingItemFromServer(item); // 預留未來呼叫 API
                    }}
                  >
                    {item.name}
                  </Text>
                  <Badge color={selectedItem && selectedItem.category === 'making' && selectedItem.name === item.name ? 'dark' : 'gray'}>{item.count}</Badge>
                </Group>
              ))}
            </Stack>
          </Paper>
          {/* Hold */}
          <Paper flex={1} bg="dark.7" radius="md" p="md">
            <Text size="lg" fw={700} mb="sm">Hold</Text>
            <Stack gap="xs">
              {summarizeItems(categoryItems.hold).map((item, idx) => (
                <Group
                  key={item.name}
                  justify="space-between"
                  bg="dark.6"
                  px="sm"
                  py={4}
                  style={{ cursor: 'pointer', transition: 'all 0.2s', borderRadius: 8 }}
                  onDoubleClick={() => {
                    setCategoryItems(prev => ({
                      ...prev,
                      hold: prev.hold.filter(h => h.name !== item.name)
                    }));
                    // removeHoldItemFromServer(item); // 預留未來呼叫 API
                  }}
                >
                  <Text>{item.name}</Text>
                  <Badge color="gray">{item.count}</Badge>
                </Group>
              ))}
            </Stack>
          </Paper>
          {/* 待製作 */}
          <Paper flex={1} bg="dark.7" radius="md" p="md">
            <Text size="lg" fw={700} mb="sm">待製作</Text>
            <Stack gap="xs">
              {summarizeItems(categoryItems.waiting).map((item, idx) => (
                <Group key={item.name} justify="space-between" bg="dark.6" px="sm" py={4} style={{ opacity: 0.5, cursor: 'not-allowed', borderRadius: 8 }}>
                  <Text>{item.name}</Text>
                  <Badge color="gray">{item.count}</Badge>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Group>
      </Box>

      {/* Modal 視窗（部分銷單） */}
      <Modal
        opened={showModal && !!selectedItem}
        onClose={() => setShowModal(false)}
        title={selectedItem ? `部分銷單 - ${selectedItem.name}` : ''}
        centered
        size="md"
        overlayProps={{ opacity: 0.55, blur: 3 }}
      >
        {selectedItem && (() => {
          // 找到選中的品項（使用 name 來查找）
          const item = categoryItems[selectedItem.category].find(
            i => i.name === selectedItem.name && (selectedItem.table ? i.table === selectedItem.table : true)
          );
          if (!item) return null;
          const total = modalRows.reduce((sum, r) => sum + r.count, 0);
          return (
            <Stack gap="md">
              {/* 桌號行列表 */}
              <Stack gap="xs">
                {modalRows.map((row, idx) => (
                  <Group
                    key={row.table}
                    justify="space-between"
                    bg={modalSelectedRow === idx ? 'white' : 'dark.6'}
                    c={modalSelectedRow === idx ? 'black' : 'white'}
                    px="sm"
                    py={4}
                    style={{ border: modalSelectedRow === idx ? '2px solid white' : '2px solid transparent', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => {
                      setModalSelectedRow(idx);
                      setEditCount(editCounts[idx] || 0);
                    }}
                  >
                    <Text flex={1}>{row.table}</Text>
                    <Badge color="dark" mx={4}>{row.count}</Badge>
                    {modalSelectedRow === idx && (
                      <Group gap={4} ml={8}>
                        <Button
                          color="red"
                          size="xs"
                          variant="filled"
                          onClick={e => {
                            e.stopPropagation();
                            setEditCount(c => {
                              const newVal = Math.max(0, c - 1);
                              setEditCounts(arr => arr.map((v, i) => i === idx ? newVal : v));
                              return newVal;
                            });
                          }}
                          disabled={editCount <= 0}
                        >
                          -
                        </Button>
                        <Text size="md" fw={700} style={{ minWidth: 32, textAlign: 'center' }}>{editCount}</Text>
                        <Button
                          color="green"
                          size="xs"
                          variant="filled"
                          onClick={e => {
                            e.stopPropagation();
                            const originalRowCount = row.count;
                            if (editCount < originalRowCount) {
                              setEditCount(c => {
                                const newVal = c + 1;
                                setEditCounts(arr => arr.map((v, i) => i === idx ? newVal : v));
                                return newVal;
                              });
                            }
                          }}
                          disabled={editCount >= row.count}
                        >
                          +
                        </Button>
                      </Group>
                    )}
                  </Group>
                ))}
              </Stack>
              {/* 按鈕區域 */}
              <Group gap="md">
                <Button
                  fullWidth
                  color="yellow"
                  onClick={() => {
                    if (modalSelectedRow !== null && editCount !== 0) {
                      setEditCounts(arr => arr.map((v, i) => i === modalSelectedRow ? editCount : v));
                      setEditCount(0);
                      setModalSelectedRow(0);
                    }
                    handleModalHold(); // 只呼叫這個
                  }}
                >
                  Hold
                </Button>
                <Button
                  fullWidth
                  color="gray"
                  onClick={() => setShowModal(false)}
                >
                  取消
                </Button>
              </Group>
            </Stack>
          );
        })()}
      </Modal>
    </Flex>
  );
} 