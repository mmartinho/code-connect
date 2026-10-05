export default function Logo({ className = '' }) {
  return (
    <span role="img" aria-label="Code Connect" className={`relative block h-10 w-[127px] shrink-0 ${className}`}>
      <img src="/logo/symbol-bottom.svg" alt="" className="absolute top-[35.48%] left-0" />
      <img src="/logo/symbol-top.svg" alt="" className="absolute top-[15.11%] left-[9.43%]" />
      <img src="/logo/wordmark.svg" alt="" className="absolute top-0 left-[26.88%]" />
    </span>
  )
}
