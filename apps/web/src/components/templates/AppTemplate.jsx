import Sidebar from '../organisms/Sidebar'

/** Layout das páginas da área logada ou pública do app: menu lateral + conteúdo. */
export default function AppTemplate({ children }) {
  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pt-6 pb-28 lg:flex-row lg:justify-between lg:gap-[27px] lg:px-0 lg:py-14">
        <Sidebar />
        <main className="min-w-0 flex-1 lg:max-w-[996px]">{children}</main>
      </div>
    </div>
  )
}
