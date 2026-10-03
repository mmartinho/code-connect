export default function SocialButton({ name, logoSrc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Entrar com ${name}`}
      className="cursor-pointer rounded transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <img src={logoSrc} alt="" className="h-14" />
    </button>
  )
}
