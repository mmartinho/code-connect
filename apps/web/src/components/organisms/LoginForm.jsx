import { useState } from 'react'
import Button from '../atoms/Button'
import Checkbox from '../atoms/Checkbox'
import Icon from '../atoms/Icon'
import TextLink from '../atoms/TextLink'
import FormField from '../molecules/FormField'
import { focusFirstInvalid, hasErrors, requiredMessage } from '../../utils/validation'

export default function LoginForm({ onSubmit }) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {
      login: requiredMessage(login, 'Informe o seu email ou usuário.'),
      password: requiredMessage(password, 'Informe a sua senha.'),
    }
    setErrors(nextErrors)

    if (hasErrors(nextErrors)) {
      focusFirstInvalid(event.currentTarget, nextErrors)
      return
    }
    onSubmit?.({ login, password, remember })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="text-[15px] text-muted">* Campos obrigatórios</p>
      <FormField
        label="Email ou usuário"
        name="login"
        placeholder="usuario123"
        autoComplete="username"
        required
        error={errors.login}
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
          error={errors.password}
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
      <Button type="submit" className="mt-4" icon={<Icon name="arrow-right" />}>
        Login
      </Button>
    </form>
  )
}
