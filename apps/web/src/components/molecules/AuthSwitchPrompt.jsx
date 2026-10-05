import Icon from '../atoms/Icon'
import TextLink from '../atoms/TextLink'

const layouts = {
  stacked: { wrapper: 'flex flex-col items-center gap-2 text-center', question: 'text-[15px]' },
  inline: { wrapper: 'flex flex-col items-start md:flex-row md:items-center md:gap-2', question: 'text-lg' },
}

export default function AuthSwitchPrompt({ question, linkText, to, icon, layout = 'stacked' }) {
  const styles = layouts[layout]

  return (
    <div className={styles.wrapper}>
      <p className={`text-offwhite ${styles.question}`}>{question}</p>
      <TextLink to={to} variant="accent">
        {linkText}
        {icon && <Icon name={icon} />}
      </TextLink>
    </div>
  )
}
