import AuthSwitchPrompt from '../components/molecules/AuthSwitchPrompt'
import SocialLogin from '../components/molecules/SocialLogin'
import RegisterForm from '../components/organisms/RegisterForm'
import AuthTemplate from '../components/templates/AuthTemplate'

export default function RegisterPage({ onRegister, onSocialLogin }) {
  return (
    <AuthTemplate
      bannerSrc="/banner-cadastro.png"
      bannerAlt="Pessoa de óculos programando em frente a telas com interfaces verdes"
      bannerPosition="object-[58%_50%] md:object-[76%_50%] lg:object-[60%_50%]"
      bannerLogo
      title="Cadastro"
      subtitle="Olá! Preencha seus dados."
      footer={
        <AuthSwitchPrompt question="Já tem conta?" linkText="Faça seu login!" to="/login" icon="login" layout="inline" />
      }
    >
      <RegisterForm onSubmit={onRegister} />
      <SocialLogin onSelect={onSocialLogin} />
    </AuthTemplate>
  )
}
