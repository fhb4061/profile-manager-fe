import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { isValidEmail, isValidPassword } from '@/lib/validation'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const emailError = emailTouched && !isValidEmail(email)
  const passwordError = passwordTouched && !isValidPassword(password)
  const isFormValid = isValidEmail(email) && isValidPassword(password)

  const handleLogin = () => {
    navigate('/')
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Login
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to manage your profile
        </p>
        <form className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
            />
            {emailError && (
              <p className="text-sm text-destructive">Invalid email</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
            />
            {passwordError && (
              <p className="text-sm text-destructive">
                Password must be at least 8 characters
              </p>
            )}
          </div>
          <Button
            size="lg"
            className="w-full"
            disabled={!isFormValid}
            onClick={handleLogin}
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  )
}
