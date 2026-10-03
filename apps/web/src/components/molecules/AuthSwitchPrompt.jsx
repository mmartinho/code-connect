import Icon from '../atoms/Icon'
import TextLink from '../atoms/TextLink'

export default function AuthSwitchPrompt({ question, linkText, to, icon }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-offwhite">{question}</p>
      <TextLink to={to} variant="accent">
        {linkText}
        {icon && <Icon name={icon} />}
      </TextLink>
    </div>
  )
}
