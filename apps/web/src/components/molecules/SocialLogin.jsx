import Divider from '../atoms/Divider'
import SocialButton from '../atoms/SocialButton'

const providers = [
  { id: 'github', name: 'Github', logoSrc: '/github.png' },
  { id: 'gmail', name: 'Gmail', logoSrc: '/gmail.png' },
]

export default function SocialLogin({ onSelect }) {
  return (
    <div className="flex flex-col gap-3">
      <Divider>ou entre com outras contas</Divider>
      <div className="flex justify-center gap-6">
        {providers.map((provider) => (
          <SocialButton
            key={provider.id}
            name={provider.name}
            logoSrc={provider.logoSrc}
            onClick={() => onSelect?.(provider.id)}
          />
        ))}
      </div>
    </div>
  )
}
