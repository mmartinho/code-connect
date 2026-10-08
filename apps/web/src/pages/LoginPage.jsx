import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import AuthSwitchPrompt from '../components/molecules/AuthSwitchPrompt'
import SocialLogin from '../components/molecules/SocialLogin'
import LoginForm from '../components/organisms/LoginForm'
import AuthTemplate from '../components/templates/AuthTemplate'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/errors'

export default function LoginPage({ onSocialLogin }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState()

  async function handleLogin(credentials) {
    setSubmitting(true)
    setError(undefined)
    try {
      await login(credentials)
      navigate(location.state?.from?.pathname ?? '/feed', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <>
      <title>Login · Code Connect</title>
      <meta name="description" content="Entre na sua conta do Code Connect para compartilhar projetos e ideias." />
      <AuthTemplate
        bannerSrc="/banner-login.webp"
        bannerWidth={407}
        bannerHeight={636}
        bannerAlt="Pessoa programando em um ambiente iluminado por telas verdes"
        title="Login"
        subtitle="Boas-vindas! Faça seu login."
        footer={
          <AuthSwitchPrompt question="Ainda não tem conta?" linkText="Crie seu cadastro!" to="/cadastro" icon="clipboard" />
        }
      >
        <LoginForm onSubmit={handleLogin} submitting={submitting} error={error} />
        <SocialLogin onSelect={onSocialLogin} />
      </AuthTemplate>
    </>
  )
}
