import { render, screen } from '@testing-library/react'
import AuthTemplate from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders the banner, title, subtitle, content and footer', () => {
    render(
      <AuthTemplate
        bannerSrc="/banner-login.webp"
        bannerAlt="Banner"
        title="Login"
        subtitle="Boas-vindas! Faça seu login."
        footer={<p>rodapé</p>}
      >
        <form aria-label="formulário" />
      </AuthTemplate>,
    )

    expect(screen.getByRole('img', { name: 'Banner' })).toHaveAttribute('src', '/banner-login.webp')
    expect(screen.getByRole('heading', { level: 1, name: 'Login' })).toBeInTheDocument()
    expect(screen.getByText('Boas-vindas! Faça seu login.')).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'formulário' })).toBeInTheDocument()
    expect(screen.getByText('rodapé')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Code Connect' })).not.toBeInTheDocument()
  })

  it('loads the banner with high priority and its intrinsic size', () => {
    render(
      <AuthTemplate bannerSrc="/banner-login.webp" bannerAlt="Banner" bannerWidth={407} bannerHeight={636} title="Login">
        <p>conteúdo</p>
      </AuthTemplate>,
    )

    const banner = screen.getByRole('img', { name: 'Banner' })

    expect(banner).toHaveAttribute('fetchpriority', 'high')
    expect(banner).toHaveAttribute('width', '407')
    expect(banner).toHaveAttribute('height', '636')
  })

  it('overlays the logo on the banner when bannerLogo is set', () => {
    render(
      <AuthTemplate bannerSrc="/banner-cadastro.webp" bannerAlt="Banner" bannerLogo title="Cadastro">
        <p>conteúdo</p>
      </AuthTemplate>,
    )

    expect(screen.getByRole('img', { name: 'Code Connect' })).toBeInTheDocument()
  })
})
