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
    <div>
      <h1>Login</h1>
      <form>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
          />
          {emailError && <p>Invalid email</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
          />
          {passwordError && <p>Password must be at least 8 characters</p>}
        </div>
        <Button disabled={!isFormValid} onClick={handleLogin}>
          Login
        </Button>
      </form>
    </div>
  )
}
