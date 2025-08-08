import Link from 'next/link'
import { Container, Button, Group } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'

export default function SignalRTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Container size="xl" py="md">
        <Group>
          <Button
            component={Link}
            href="/"
            leftSection={<IconArrowLeft size={16} />}
            variant="outline"
            size="sm"
          >
            返回主頁
          </Button>
        </Group>
      </Container>
      {children}
    </div>
  )
} 