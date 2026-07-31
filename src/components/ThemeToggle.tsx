import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Sun className="size-4 text-muted-foreground" />
      <Switch
        aria-label="Toggle dark mode"
        checked={theme === 'dark'}
        onCheckedChange={toggle}
      />
      <Moon className="size-4 text-muted-foreground" />
    </div>
  )
}
