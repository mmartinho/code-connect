import { useState } from 'react'
import Button from '../atoms/Button'
import Checkbox from '../atoms/Checkbox'
import Icon from '../atoms/Icon'
import FormField from '../molecules/FormField'

export default function RegisterForm({ onSubmit }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit?.({ name, email, password, remember })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="Nome"
        name="name"
        placeholder="Nome completo"
        autoComplete="name"
        required
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
      <Button type="submit" className="mt-4" icon={<Icon name="arrow-right" />}>
        Cadastrar
      </Button>
    </form>
  )
}
