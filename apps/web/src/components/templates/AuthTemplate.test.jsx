import { render, screen } from '@testing-library/react'
import AuthTemplate from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders the banner, title, subtitle, content and footer', () => {
    render(
      <AuthTemplate
        bannerSrc="/banner-login.png"
        bannerAlt="Banner"
        title="Login"
        subtitle="Boas-vindas! Faça seu login."
        footer={<p>rodapé</p>}
      >
        <form aria-label="formulário" />
      </AuthTemplate>,
    )

    expect(screen.getByRole('img', { name: 'Banner' })).toHaveAttribute('src', '/banner-login.png')
    expect(screen.getByRole('heading', { level: 1, name: 'Login' })).toBeInTheDocument()
    expect(screen.getByText('Boas-vindas! Faça seu login.')).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'formulário' })).toBeInTheDocument()
    expect(screen.getByText('rodapé')).toBeInTheDocument()
  })
})
