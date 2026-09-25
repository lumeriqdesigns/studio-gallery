export type ThemeId =
  | 'atelier'
  | 'noir'
  | 'emerald'
  | 'champagne'
  | 'blush'
  | 'midnight'

export type ThemeMeta = {
  id: ThemeId
  name: string
  description: string
  preview: { bg: string; accent: string; text: string }
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'atelier',
    name: 'Atelier',
    description: 'Ink black & champagne gold — signature Lumeriq',
    preview: { bg: '#0c0f0e', accent: '#c4a574', text: '#f7f4ef' },
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Pure black & silver — high fashion editorial',
    preview: { bg: '#0a0a0a', accent: '#c0c0c0', text: '#f5f5f5' },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    description: 'Deep forest & antique gold — heritage luxury',
    preview: { bg: '#0d1512', accent: '#c9a227', text: '#f0ebe3' },
  },
  {
    id: 'champagne',
    name: 'Champagne',
    description: 'Warm ivory & rose gold — soft bridal elegance',
    preview: { bg: '#1a1512', accent: '#d4a574', text: '#faf6f1' },
  },
  {
    id: 'blush',
    name: 'Blush',
    description: 'Charcoal & dusty rose — modern fashion house',
    preview: { bg: '#141210', accent: '#c4a4a0', text: '#faf7f5' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Navy velvet & bright gold — evening couture',
    preview: { bg: '#0a0e18', accent: '#d4af37', text: '#f0f2f7' },
  },
]

export const DEFAULT_THEME: ThemeId = 'atelier'

export function isThemeId(v: string): v is ThemeId {
  return THEMES.some((t) => t.id === v)
}
