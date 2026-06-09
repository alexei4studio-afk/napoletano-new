export const CAMPAIGN_COLOR_PRESETS = [
  { bg: 'linear-gradient(90deg, #c0392b, #9b2e22)', text: '#ffffff' },
  { bg: 'linear-gradient(90deg, #1a1a1a, #0d0d0d)', text: '#ffffff' },
  { bg: 'linear-gradient(90deg, #5a6b3a, #3d4a27)', text: '#ffffff' },
  { bg: 'linear-gradient(90deg, #b8962e, #8a6f1f)', text: '#ffffff' },
  { bg: 'linear-gradient(90deg, #1e3a5f, #0f2440)', text: '#ffffff' },
] as const

export const DEFAULT_CAMPAIGN_SETTINGS = {
  placement: 'top_main' as const,
  bgColor: CAMPAIGN_COLOR_PRESETS[0].bg,
  textColor: '#ffffff',
  fontSize: '14px',
  showCountdown: true,
}
