import { cn } from '@/lib/utils'

const WAVE_PATH =
  'M0,40 C100,70 200,10 300,40 C400,70 500,10 600,40 C700,70 800,10 900,40 C1000,70 1100,10 1200,40 L1200,120 L0,120 Z'

interface WaveLayerProps {
  animationClassName: string
  heightClassName: string
  fill: string
  opacity: number
}

function WaveLayer({ animationClassName, heightClassName, fill, opacity }: WaveLayerProps) {
  return (
    <svg
      className={cn('absolute bottom-0 left-0 w-[200%]', heightClassName, animationClassName)}
      viewBox="0 0 2400 120"
      preserveAspectRatio="none"
    >
      <path d={WAVE_PATH} fill={fill} opacity={opacity} />
      <path d={WAVE_PATH} fill={fill} opacity={opacity} transform="translate(1200,0)" />
    </svg>
  )
}

export function WaveBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <WaveLayer
        animationClassName="animate-wave-slow"
        heightClassName="h-20"
        fill="var(--muted)"
        opacity={0.1}
      />
      <WaveLayer
        animationClassName="animate-wave-medium"
        heightClassName="h-24"
        fill="var(--primary)"
        opacity={0.12}
      />
      <WaveLayer
        animationClassName="animate-wave-fast"
        heightClassName="h-28"
        fill="var(--primary)"
        opacity={0.15}
      />
    </div>
  )
}
