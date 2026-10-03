import BrandShape from '../atoms/BrandShape'
import Heading from '../atoms/Heading'

export default function AuthTemplate({ bannerSrc, bannerAlt, title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-4 py-12 font-sans">
      <BrandShape className="absolute -top-4 left-[7%] w-60 lg:w-[410px]" />
      <BrandShape className="absolute right-[7%] -bottom-8 w-60 lg:w-[410px]" />

      <main className="relative flex w-full max-w-[994px] gap-[68px] rounded-[32px] bg-surface p-8 md:px-[76px] md:py-14">
        <img
          src={bannerSrc}
          alt={bannerAlt}
          className="hidden h-[628px] w-[407px] shrink-0 object-cover md:block"
        />

        <section className="flex w-full flex-col gap-8 md:max-w-[318px]">
          <header className="flex flex-col gap-8">
            <Heading>{title}</Heading>
            {subtitle && <p className="text-xl text-offwhite">{subtitle}</p>}
          </header>
          {children}
          {footer}
        </section>
      </main>
    </div>
  )
}
