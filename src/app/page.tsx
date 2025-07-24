"use client";
import { Paper, Group, Stack, Button, Badge, Text, Box, Divider, Table, Modal, Group as MantineGroup, Button as MantineButton, TextInput } from '@mantine/core';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// 新增：響應式判斷
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 900);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

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

export default function WorkstationBoard() {
  // 共用 style
  const summaryBoxStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 700,
    fontSize: '1rem',
    border: '2px solid #222',
    borderRadius: 12,
    background: '#fff',
    padding: '4px 8px',
    flex: 1,
    justifyContent: 'center',
    marginRight: 0,
    minWidth: 0,
    maxWidth: '100%',
  };
  // 時鐘元件
  function Clock() {
    const [time, setTime] = useState(() => {
      const now = new Date();
      return now.toLocaleTimeString('zh-TW', { hour12: false });
    });
    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date();
        setTime(now.toLocaleTimeString('zh-TW', { hour12: false }));
      }, 1000);
      return () => clearInterval(timer);
    }, []);
    return (
      <div style={{
        width: '100%',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '1.2rem',
        padding: '8px 0',
        userSelect: 'none',
        pointerEvents: 'none',
      }}>{time}</div>
    );
  }
  // 狀態管理
  const [counts, setCounts] = useState({
    allOrders: 10,
    dineIn: 3,
    takeaway: 5,
    delivery: 2,
  });
  const [selectedType, setSelectedType] = useState<string>('allOrders');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
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
  const [modalRows, setModalRows] = useState<OrderItem[]>([]);
  const [modalSelectedRow, setModalSelectedRow] = useState<number>(0);
  const [editCount, setEditCount] = useState<number>(0);
  const [editCounts, setEditCounts] = useState<number[]>([]);
  // 部分銷單異動數量 state
  const [holdEditCounts, setHoldEditCounts] = useState<number[]>([]);

  // 時間顯示 state
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const sec = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hh}:${min}:${sec}`);
    }
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // 左側按鈕資料
  const leftButtons = [
    { label: '更新', onClick: undefined },
    {
      label: '部分銷單',
      onClick: () => {
        if (!selectedItem) {
          setShowSelectItemModal(true);
          return;
        }
        // 依據選取品項自動生成 modalRows（桌號、名稱、數量）
        const items = categoryItems[selectedItem.category].filter(item => item.name === selectedItem.name);
        // 產生桌號（如內用A1、外帶01...）
        const rows = items.map((item, i) => ({
          name: item.name,
          table: item.table || `外帶${String(i + 1).padStart(2, '0')}`,
          count: item.count,
        }));
        setModalRows(rows);
        setHoldEditCounts(Array(rows.length).fill(0));
        setShowModal(true);
      },
    },
    { label: '已點餐', onClick: () => {} },
    { label: '待製作', onClick: () => {} },
    { label: '已完成', onClick: () => {} },
    { label: '歷史紀錄', onClick: () => {} },
    { label: '工作站', onClick: () => {} },
  ];

  // Modal直接渲染在主return最外層

  // 若 handleModalHold 尚未定義，補上一個空函式避免 linter error
  const handleModalHold = () => {};

  // 部分銷單 Hold 處理
  const handleHold = () => {
    // 1. 更新 making: 扣除異動數量
    const newMaking = [...categoryItems.making];
    const newHold = [...categoryItems.hold];
    modalRows.forEach((row, idx) => {
      const minus = holdEditCounts[idx] || 0;
      if (minus > 0) {
        // making 扣除
        const makingIdx = newMaking.findIndex(m => m.name === row.name && m.table === row.table);
        if (makingIdx !== -1) {
          newMaking[makingIdx] = { ...newMaking[makingIdx], count: Math.max(0, newMaking[makingIdx].count - minus) };
        }
        // Hold 累加或新增
        const holdIdx = newHold.findIndex(h => h.name === row.name && h.table === row.table);
        if (holdIdx !== -1) {
          newHold[holdIdx] = { ...newHold[holdIdx], count: newHold[holdIdx].count + minus };
        } else {
          newHold.push({ name: row.name, table: row.table, count: minus });
        }
      }
    });
    // 過濾 making 為 0 的品項
    const filteredMaking = newMaking.filter(m => m.count > 0);
    setCategoryItems(prev => ({ ...prev, making: filteredMaking, hold: newHold }));
    setShowModal(false);
  };

  const [showTestPortal, setShowTestPortal] = useState(false);
  // 新增：選取品項提示 modal 狀態
  const [showSelectItemModal, setShowSelectItemModal] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <Paper
        radius="xl"
        p={0}
        style={{
          border: '3px solid #222',
          height: '100vh',
          width: 'calc(100vw - 6px)',
          minHeight: 0,
          minWidth: 0,
          maxWidth: '100vw',
          background: '#fff',
          position: 'relative',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'stretch',
          margin: 0,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* 左側功能列 */}
        <Box
          style={{
            width: isMobile ? '100%' : '12vw',
            maxWidth: '100vw',
            minWidth: 0,
            background: '#f5f5f5',
            borderRight: isMobile ? 0 : '2px solid #222',
            borderBottom: '2px solid #222',
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: isMobile ? 24 : 0,
            borderTopRightRadius: isMobile ? 24 : 0,
            borderBottomRightRadius: 0,
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            alignItems: 'center',
            padding: 0,
            height: isMobile ? 'auto' : '100vh',
            minHeight: 0,
            justifyContent: isMobile ? 'flex-start' : undefined,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {/* 時間顯示 */}
          <Box style={{ width: '100%', textAlign: 'center', fontWeight: 700, fontSize: isMobile ? '1rem' : '1.2rem', padding: isMobile ? '4px 0' : '8px 0', userSelect: 'none', pointerEvents: 'none', borderBottom: '1px solid #ccc' }}>{currentTime}</Box>

          {/* 上方按鈕：更新、部分銷單 */}
          <Box style={{ width: '100%', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? 4 : 8, marginTop: 12, minWidth: 0, maxWidth: '100vw', overflow: 'hidden' }}>
            {leftButtons.slice(0, 2).map((btn, idx) => (
              <Button
                key={btn.label}
                variant="outline"
                color="dark"
                size={isMobile ? 'sm' : 'md'}
                style={{
                  width: '100%',
                  flex: 1,
                  minWidth: 0,
                  maxWidth: '100%',
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  fontWeight: 700,
                  margin: 0,
                  padding: 0,
                  boxSizing: 'border-box',
                }}
                onClick={btn.onClick}
              >
                {btn.label}
              </Button>
            ))}
          </Box>

          {/* 下方按鈕：已點餐及其下方按鈕，靠下排列 */}
          <Box style={{ width: '100%', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? 4 : 8, marginTop: isMobile ? 0 : 'auto', marginBottom: isMobile ? 0 : 40, minWidth: 0, maxWidth: '100vw', overflow: 'hidden' }}>
            {leftButtons.slice(2).map((btn, idx) => (
              <Button
                key={btn.label}
                variant="outline"
                color="dark"
                size={isMobile ? 'sm' : 'md'}
                style={{
                  width: '100%',
                  flex: 1,
                  minWidth: 0,
                  maxWidth: '100%',
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  fontWeight: 700,
                  margin: 0,
                  padding: 0,
                  boxSizing: 'border-box',
                }}
                onClick={btn.onClick}
              >
                {btn.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* 右側主內容 */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            width: '100%',
            maxWidth: '100vw',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <Group
            gap={8}
            style={{
              background: '#f5f5f5',
              borderBottom: '2px solid #222',
              borderRadius: '24px 24px 0 0',
              alignItems: 'center',
              padding: '8px 4px',
              justifyContent: 'flex-start',
              display: 'flex',
              marginBottom: 0,
              minWidth: 0,
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* 所有訂單 */}
            <span style={summaryBoxStyle}>
              <span style={{ marginRight: 4, overflowWrap: 'break-word' }}>所有訂單</span>
              <Badge color="gray" size="lg" style={{ fontWeight: 700, fontSize: '1.1rem', overflowWrap: 'break-word' }}>22</Badge>
            </span>
            {/* 內用 */}
            <span style={summaryBoxStyle}>
              <span style={{ marginRight: 4, overflowWrap: 'break-word' }}>內用</span>
              <Badge color="gray" size="lg" style={{ fontWeight: 700, fontSize: '1.1rem', overflowWrap: 'break-word' }}>22</Badge>
            </span>
            {/* 外帶 */}
            <span style={summaryBoxStyle}>
              <span style={{ marginRight: 4, overflowWrap: 'break-word' }}>外帶</span>
              <Badge color="gray" size="lg" style={{ fontWeight: 700, fontSize: '1.1rem', overflowWrap: 'break-word' }}>22</Badge>
            </span>
            {/* 外送 */}
            <span style={summaryBoxStyle}>
              <span style={{ marginRight: 0, overflowWrap: 'break-word' }}>外送</span>
              <Badge color="gray" size="lg" style={{ fontWeight: 700, fontSize: '1.1rem', overflowWrap: 'break-word' }}>22</Badge>
            </span>
          </Group>
          <Box style={{ flex: 1, padding: 0, margin: 0 }}>
            {/* 三欄看板（Table） */}
            <Table
              highlightOnHover={false}
              style={{
                tableLayout: 'fixed',
                width: '100%',
                minWidth: 0,
                maxWidth: '100vw',
                marginTop: 0,
                boxSizing: 'border-box',
                overflow: 'hidden',
                padding: 0,
              }}>
              <thead>
                <tr>
                  <th style={{ background: '#009944', color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: 20, borderRight: '2px solid #222', borderBottom: '2px solid #222' }}>#1-製作中</th>
                  <th style={{ background: '#009944', color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: 20, borderRight: '2px solid #222', borderBottom: '2px solid #222' }}>#2-Hold</th>
                  <th style={{ background: '#009944', color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: 20, borderBottom: '2px solid #222' }}>#3-待製作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* 製作中 */}
                  <td style={{ verticalAlign: 'top', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', padding: 0 }}>
                    {summarizeItems(categoryItems.making).map((item, idx, arr) => (
                      <div
                        key={item.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 12,
                          background: selectedItem && selectedItem.category === 'making' && selectedItem.name === item.name ? '#ff8fa3' : '#f5f5f5',
                          color: selectedItem && selectedItem.category === 'making' && selectedItem.name === item.name ? '#222' : '#222',
                          fontWeight: selectedItem && selectedItem.category === 'making' && selectedItem.name === item.name ? 900 : 500,
                          borderRadius: 10,
                          padding: '4px 4px',
                          marginBottom: 4,
                          cursor: 'pointer',
                          borderTop: selectedItem && selectedItem.category === 'making' && selectedItem.name === item.name ? '2.5px solid #222' : '1px solid #222',
                          borderLeft: selectedItem && selectedItem.category === 'making' && selectedItem.name === item.name ? '2.5px solid #222' : '1px solid #222',
                          borderRight: selectedItem && selectedItem.category === 'making' && selectedItem.name === item.name ? '2.5px solid #222' : '1px solid #222',
                          borderBottom: idx === arr.length - 1 ? '1px solid #222' : 'none',
                          boxShadow: 'none',
                        }}
                        onClick={() => setSelectedItem({ category: 'making', name: item.name })}
                        onDoubleClick={() => setCategoryItems(prev => ({ ...prev, making: prev.making.filter(m => m.name !== item.name) }))}
                      >
                        <span>{item.name}</span>
                        <Badge color="gray" size="md" style={{ marginLeft: 8 }}>{item.count}</Badge>
                      </div>
                    ))}
                  </td>
                  {/* Hold */}
                  <td style={{ verticalAlign: 'top', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', padding: 0 }}>
                    {summarizeItems(categoryItems.hold).map((item, idx, arr) => (
                      <div
                        key={item.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          background: '#f5f5f5',
                          color: '#222',
                          fontWeight: 500,
                          borderRadius: 6,
                          padding: '4px 4px',
                          marginBottom: 4,
                          cursor: 'pointer',
                          border: '1px solid #222',
                          borderBottom: idx === arr.length - 1 ? '1px solid #222' : undefined,
                        }}
                        onDoubleClick={() => setCategoryItems(prev => ({ ...prev, hold: prev.hold.filter(h => h.name !== item.name) }))}
                      >
                        <span>{item.name}</span>
                        <Badge color="gray" size="md" style={{ marginLeft: 8 }}>{item.count}</Badge>
                      </div>
                    ))}
                  </td>
                  {/* 待製作 */}
                  <td style={{ verticalAlign: 'top', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', padding: 0 }}>
                    {summarizeItems(categoryItems.waiting).map((item, idx, arr) => (
                      <div
                        key={item.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          background: '#f5f5f5',
                          color: '#222',
                          fontWeight: 500,
                          borderRadius: 6,
                          padding: '4px 4px',
                          marginBottom: 4,
                          opacity: 0.5,
                          cursor: 'not-allowed',
                          border: '1px solid #222',
                          borderBottom: idx === arr.length - 1 ? '1px solid #222' : undefined,
                        }}
                      >
                        <span>{item.name}</span>
                        <Badge color="gray" size="md" style={{ marginLeft: 8 }}>{item.count}</Badge>
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Box>
        </Box>
        {/* 部分銷單 React Portal 浮層 */}
        {showModal && typeof window !== 'undefined' && createPortal(
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            zIndex: 99999,
            width: isMobile ? '90vw' : 420,
            maxWidth: '95vw',
            minWidth: isMobile ? '60vw' : 320,
            minHeight: isMobile ? '20vh' : 200,
            border: '3px solid #222',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: isMobile ? '4vw' : 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}>
            <div style={{ background: '#ffc107', color: '#fff', fontWeight: 900, fontSize: isMobile ? '1.1rem' : '1.2rem', textAlign: 'center', borderRadius: 8, padding: isMobile ? '6px 0' : '8px 0', width: '100%', marginBottom: 16 }}>
              部分銷單(HOLD)品項
            </div>
            <div style={{ width: '100%' }}>
              {modalRows.map((row, idx) => (
                <div
                  key={row.table}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#fff',
                    color: '#222',
                    borderRadius: 8,
                    padding: isMobile ? '6px 4vw' : '8px 10px',
                    marginBottom: isMobile ? 6 : 10,
                    fontWeight: 700,
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    border: '1px solid #ccc',
                  }}
                >
                  <span style={{ minWidth: isMobile ? 60 : 80 }}>{row.table}</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>{row.name}</span>
                  <span style={{ minWidth: isMobile ? 32 : 40, textAlign: 'right', color: '#888' }}>{row.count}</span>
                  {/* 加減按鈕與異動數量 */}
                  <span style={{ display: 'flex', alignItems: 'center', marginLeft: isMobile ? 8 : 16 }}>
                    <MantineButton
                      size="xs"
                      color="gray"
                      variant="outline"
                      style={{ minWidth: isMobile ? 22 : 28, padding: 0, marginRight: 4 }}
                      onClick={() => setHoldEditCounts(arr => arr.map((v, i) => i === idx ? Math.max(0, v - 1) : v))}
                      disabled={holdEditCounts[idx] <= 0}
                    >
                      -
                    </MantineButton>
                    <span style={{ minWidth: isMobile ? 18 : 24, textAlign: 'center', fontWeight: 700, color: holdEditCounts[idx] > 0 ? 'red' : '#888' }}>{holdEditCounts[idx]}</span>
                    <MantineButton
                      size="xs"
                      color="gray"
                      variant="outline"
                      style={{ minWidth: isMobile ? 22 : 28, padding: 0, marginLeft: 4 }}
                      onClick={() => setHoldEditCounts(arr => arr.map((v, i) => i === idx ? Math.min(row.count, v + 1) : v))}
                      disabled={holdEditCounts[idx] >= row.count}
                    >
                      +
                    </MantineButton>
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 8 : 16, width: '100%', marginTop: 16 }}>
              <MantineButton
                variant="outline"
                color="dark"
                size={isMobile ? 'sm' : 'md'}
                style={{ width: isMobile ? '40vw' : 80, minWidth: 60, maxWidth: 120, fontSize: isMobile ? '0.95rem' : '1rem', fontWeight: 700 }}
                onClick={handleHold}
              >
                Hold
              </MantineButton>
              <MantineButton
                variant="outline"
                color="dark"
                size={isMobile ? 'sm' : 'md'}
                style={{ width: isMobile ? '40vw' : 80, minWidth: 60, maxWidth: 120, fontSize: isMobile ? '0.95rem' : '1rem', fontWeight: 700 }}
                onClick={() => setShowModal(false)}
              >
                關閉
              </MantineButton>
            </div>
          </div>,
          document.body
        )}
      </Paper>
      {/* React Portal 測試浮層 */}
      {showTestPortal && typeof window !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'blue',
          color: '#fff',
          zIndex: 99999,
          width: 300,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 24,
          borderRadius: 12,
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
        onClick={() => setShowTestPortal(false)}
        >
          React Portal 測試 (點擊關閉)
        </div>,
        document.body
      )}
      {/* 選取品項提示 Modal */}
      {showSelectItemModal && typeof window !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          zIndex: 100000,
          width: isMobile ? '80vw' : 340,
          maxWidth: '95vw',
          minWidth: isMobile ? '50vw' : 240,
          minHeight: isMobile ? '12vh' : 120,
          border: '3px solid #222',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: isMobile ? '4vw' : 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          <div style={{ fontWeight: 900, fontSize: isMobile ? '1.05rem' : '1.2rem', color: '#d7263d', marginBottom: 16 }}>
            請先選取一個品項
          </div>
          <MantineButton
            variant="filled"
            color="dark"
            size={isMobile ? 'sm' : 'md'}
            style={{ width: isMobile ? '40vw' : 100, minWidth: 60, maxWidth: 120, fontWeight: 700, fontSize: isMobile ? '0.95rem' : '1rem', borderRadius: 8 }}
            onClick={() => setShowSelectItemModal(false)}
          >
            確認
          </MantineButton>
        </div>,
        document.body
      )}
    </>
  );
}