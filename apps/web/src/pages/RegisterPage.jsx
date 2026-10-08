import { useState } from 'react'
import { useNavigate } from 'react-router'
import AuthSwitchPrompt from '../components/molecules/AuthSwitchPrompt'
import SocialLogin from '../components/molecules/SocialLogin'
import RegisterForm from '../components/organisms/RegisterForm'
import AuthTemplate from '../components/templates/AuthTemplate'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/errors'

export default function RegisterPage({ onSocialLogin }) {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState()

  async function handleRegister(data) {
    setSubmitting(true)
    setError(undefined)
    try {
      await register(data)
      navigate('/feed', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <>
      <title>Cadastro · Code Connect</title>
      <meta name="description" content="Crie a sua conta no Code Connect e comece a compartilhar projetos e ideias." />
      <AuthTemplate
        bannerSrc="/banner-cadastro.webp"
        bannerWidth={1344}
        bannerHeight={896}
        bannerAlt="Pessoa de óculos programando em frente a telas com interfaces verdes"
        bannerPosition="object-[58%_50%] md:object-[76%_50%] lg:object-[60%_50%]"
        bannerLogo
        title="Cadastro"
        subtitle="Olá! Preencha seus dados."
        footer={
          <AuthSwitchPrompt question="Já tem conta?" linkText="Faça seu login!" to="/login" icon="login" layout="inline" />
        }
      >
        <RegisterForm onSubmit={handleRegister} submitting={submitting} error={error} />
        <SocialLogin onSelect={onSocialLogin} />
      </AuthTemplate>
    </>
  )
}
