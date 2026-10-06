import AuthSwitchPrompt from '../components/molecules/AuthSwitchPrompt'
import SocialLogin from '../components/molecules/SocialLogin'
import LoginForm from '../components/organisms/LoginForm'
import AuthTemplate from '../components/templates/AuthTemplate'

export default function LoginPage({ onLogin, onSocialLogin }) {
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
        <LoginForm onSubmit={onLogin} />
        <SocialLogin onSelect={onSocialLogin} />
      </AuthTemplate>
    </>
  )
}
