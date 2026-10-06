import Divider from '../atoms/Divider'
import SocialButton from '../atoms/SocialButton'

const providers = [
  { id: 'github', name: 'Github', logoSrc: '/github.png', width: 40, height: 55 },
  { id: 'gmail', name: 'Gmail', logoSrc: '/gmail.png', width: 33, height: 51 },
]

export default function SocialLogin({ onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      <Divider>ou entre com outras contas</Divider>
      <div className="flex justify-center gap-6">
        {providers.map((provider) => (
          <SocialButton
            key={provider.id}
            name={provider.name}
            logoSrc={provider.logoSrc}
            width={provider.width}
            height={provider.height}
            onClick={() => onSelect?.(provider.id)}
          />
        ))}
      </div>
    </div>
  )
}
