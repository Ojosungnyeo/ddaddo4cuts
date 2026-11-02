interface MascotProps {
  size: 'home' | 'loading' | 'result'
}

export function Mascot({ size }: MascotProps) {
  return (
    <span className={`mascot mascot--${size}`} aria-hidden="true">
      <img src="/assets/figma-mascot.png" alt="" />
    </span>
  )
}
