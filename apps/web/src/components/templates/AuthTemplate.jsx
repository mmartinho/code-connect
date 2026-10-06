import BrandShape from '../atoms/BrandShape'
import Heading from '../atoms/Heading'
import Logo from '../atoms/Logo'

export default function AuthTemplate({
  bannerSrc,
  bannerAlt,
  bannerWidth,
  bannerHeight,
  bannerPosition = 'object-bottom lg:object-center',
  bannerLogo = false,
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-hidden bg-page px-4 py-14 font-sans md:py-20 lg:items-center">
      <BrandShape className="absolute top-0 left-0 w-[76px] md:w-[285px] lg:-top-2 lg:left-[7%] lg:w-[407px]" />
      <BrandShape className="absolute right-0 bottom-0 w-[77px] md:bottom-14 md:w-[288px] lg:right-[7%] lg:bottom-0 lg:w-[407px]" />

      <main className="relative flex w-full max-w-[648px] flex-col gap-8 rounded-2xl border border-page bg-surface px-4 py-8 md:rounded-[32px] md:px-[60px] md:py-14 lg:max-w-[996px] lg:flex-row lg:items-start lg:justify-between lg:gap-0 lg:px-[78px]">
        <div className="relative h-[360px] w-full shrink-0 overflow-hidden md:mx-auto md:h-[415px] md:max-w-[480px] lg:mx-0 lg:h-auto lg:w-[407px] lg:max-w-none lg:self-stretch">
          <img
            src={bannerSrc}
            alt={bannerAlt}
            width={bannerWidth}
            height={bannerHeight}
            fetchPriority="high"
            decoding="async"
            className={`absolute inset-0 size-full object-cover ${bannerPosition}`}
          />
          {bannerLogo && (
            <div className="absolute inset-x-0 bottom-6 flex justify-center md:bottom-8 lg:bottom-9">
              <Logo />
            </div>
          )}
        </div>

        <section className="flex w-full flex-col gap-6 md:px-6 lg:w-[410px] lg:shrink-0 lg:px-8">
          <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-6">
              <Heading>{title}</Heading>
              {subtitle && <p className="text-[22px] text-offwhite">{subtitle}</p>}
            </header>
            {children}
          </div>
          {footer}
        </section>
      </main>
    </div>
  )
}
