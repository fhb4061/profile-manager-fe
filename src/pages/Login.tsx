import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
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
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Login
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your profile
          </p>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field data-invalid={emailError || undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                />
                {emailError && <FieldError>Invalid email</FieldError>}
              </Field>
              <Field data-invalid={passwordError || undefined}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                />
                {passwordError && (
                  <FieldError>Password must be at least 8 characters</FieldError>
                )}
              </Field>
              <Button
                size="lg"
                className="w-full"
                disabled={!isFormValid}
                onClick={handleLogin}
              >
                Login
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
