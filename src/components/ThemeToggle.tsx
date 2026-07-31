import { Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <div className="flex items-center gap-2">
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
