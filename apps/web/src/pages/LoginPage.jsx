import AuthSwitchPrompt from '../components/molecules/AuthSwitchPrompt'
import SocialLogin from '../components/molecules/SocialLogin'
import LoginForm from '../components/organisms/LoginForm'
import AuthTemplate from '../components/templates/AuthTemplate'

export default function LoginPage({ onLogin, onSocialLogin }) {
  return (
    <AuthTemplate
      bannerSrc="/banner-login.png"
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
  )
}
