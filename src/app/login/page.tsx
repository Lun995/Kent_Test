"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  TextInput, 
  PasswordInput, 
  Button, 
  Stack, 
  Alert,
  Group,
  Box
} from '@mantine/core';
import { IconUser, IconLock, IconAlertCircle } from '@tabler/icons-react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          rememberMe: false,
          deviceInfo: {
            userAgent: navigator.userAgent,
            deviceType: 'desktop'
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 登入成功，導向主頁面
        router.push('/');
      } else {
        setError(data.message || '登入失敗');
      }
    } catch (err) {
      setError('網路連線錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container 
      size="xs" 
      py="xl" 
      style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}
    >
      <Paper 
        shadow="xl" 
        p={0} 
        radius="xl" 
        style={{ 
          width: '100%', 
          maxWidth: '28rem',
          overflow: 'hidden'
        }}
      >
        {/* 上方白色區域 - 應用程式標誌 */}
        <Box 
          bg="white" 
          p="xl" 
          style={{ textAlign: 'center' }}
        >
          <Title 
            order={1} 
            c="red.6" 
            size="3rem" 
            mb="xs"
            style={{ 
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
              fontWeight: 'bold'
            }}
          >
            KDS
          </Title>
          <Text c="gray.6" size="sm" fw={500}>
            wowprime
          </Text>
        </Box>

        {/* 中間波浪分隔線 */}
        <Box 
          style={{ 
            height: '2rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{
              width: '100%',
              height: '100%',
              animation: 'wave 3s ease-in-out infinite'
            }}
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              fill="#3b82f6"
            />
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19.77,81.84-31.16,126.6-31.16,44.76,0,85.68,11.39,126.6,31.16,29.58,13.73,58.52,29.65,89.67,39.8,59.18,19.38,125.17,19.69,176.89,9.37C1029.36,56.86,1044,36.92,1057,15.81V0Z"
              opacity=".5"
              fill="#3b82f6"
            />
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              fill="#3b82f6"
            />
          </svg>
        </Box>

        {/* 下方藍色區域 - 登入表單 */}
        <Box 
          bg="blue.5" 
          p="xl"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              {/* 使用者名稱輸入框 */}
              <TextInput
                placeholder="admin"
                leftSection={<IconUser size={16} />}
                size="md"
                radius="md"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                styles={{
                  input: {
                    backgroundColor: 'white',
                    border: '1px solid transparent',
                    '&:focus': {
                      borderColor: 'white',
                      boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.3)'
                    }
                  }
                }}
                leftSectionProps={{
                  style: { color: '#9ca3af' }
                }}
              />

              {/* 密碼輸入框 */}
              <PasswordInput
                placeholder="Password"
                leftSection={<IconLock size={16} />}
                size="md"
                radius="md"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                styles={{
                  input: {
                    backgroundColor: 'white',
                    border: '1px solid transparent',
                    '&:focus': {
                      borderColor: 'white',
                      boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.3)'
                    }
                  }
                }}
                leftSectionProps={{
                  style: { color: '#9ca3af' }
                }}
              />

              {/* 錯誤訊息 */}
              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="登入錯誤"
                  color="red"
                  variant="light"
                  radius="md"
                >
                  {error}
                </Alert>
              )}

              {/* 登入按鈕 */}
              <Button
                fullWidth
                size="md"
                radius="md"
                variant="white"
                color="blue"
                type="submit"
                loading={isLoading}
                styles={{
                  root: {
                    border: '2px solid #60a5fa',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      backgroundColor: '#f0f9ff'
                    }
                  }
                }}
              >
                {isLoading ? '登入中...' : 'Signin'}
              </Button>
            </Stack>
          </form>
        </Box>
      </Paper>

      {/* 波浪動畫 CSS */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-10px);
          }
        }
      `}</style>
    </Container>
  );
}
