import { useState } from 'react'
import Button from '../atoms/Button'
import Checkbox from '../atoms/Checkbox'
import Icon from '../atoms/Icon'
import TextLink from '../atoms/TextLink'
import FormField from '../molecules/FormField'

export default function LoginForm({ onSubmit }) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit?.({ login, password, remember })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="Email ou usuário"
        name="login"
        placeholder="usuario123"
        autoComplete="username"
        required
        value={login}
        onChange={(event) => setLogin(event.target.value)}
      />
      <div className="flex flex-col gap-2">
        <FormField
          label="Senha"
          name="password"
          type="password"
          placeholder="******"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="flex items-center justify-between">
          <Checkbox
            label="Lembrar-me"
            name="remember"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <TextLink to="/esqueci-a-senha">Esqueci a senha</TextLink>
        </div>
      </div>
      <Button type="submit" className="mt-4" icon={<Icon name="arrow-right" className="size-4" />}>
        Login
      </Button>
    </form>
  )
}
