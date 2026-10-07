import { useState } from 'react'
import Alert from '../atoms/Alert'
import Button from '../atoms/Button'
import Checkbox from '../atoms/Checkbox'
import Icon from '../atoms/Icon'
import FormField from '../molecules/FormField'
import { emailMessage, focusFirstInvalid, hasErrors, minLengthMessage, requiredMessage } from '../../utils/validation'

export default function RegisterForm({ onSubmit, submitting = false, error }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {
      name: requiredMessage(name, 'Informe o seu nome.'),
      email: emailMessage(email),
      password:
        requiredMessage(password, 'Informe uma senha.') ??
        minLengthMessage(password, 8, 'A senha deve ter pelo menos 8 caracteres.'),
    }
    setErrors(nextErrors)

    if (hasErrors(nextErrors)) {
      focusFirstInvalid(event.currentTarget, nextErrors)
      return
    }
    onSubmit?.({ name, email, password, remember })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="text-[15px] text-muted">* Campos obrigatórios</p>
      <Alert>{error}</Alert>
      <FormField
        label="Nome"
        name="name"
        placeholder="Nome completo"
        autoComplete="name"
        required
        error={errors.name}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="Digite seu email"
        autoComplete="email"
        required
        error={errors.email}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <div className="flex flex-col gap-2">
        <FormField
          label="Senha"
          name="password"
          type="password"
          placeholder="******"
          autoComplete="new-password"
          required
          error={errors.password}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Checkbox
          label="Lembrar-me"
          name="remember"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        />
      </div>
      <Button type="submit" className="mt-4" disabled={submitting} icon={<Icon name="arrow-right" />}>
        {submitting ? 'Cadastrando…' : 'Cadastrar'}
      </Button>
    </form>
  )
}
