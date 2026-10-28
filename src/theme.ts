export type ColorTheme = 'sandwood' | 'gimmer' | 'alabaster'
export type AppearanceMode = 'light' | 'dark'

export type ThemeOption = {
  id: ColorTheme
  name: string
  description: string
  preview: string[]
}

export const themeOptions: ThemeOption[] = [
  {
    id: 'sandwood',
    name: 'Sandwood',
    description: 'A calm natural green palette.',
    preview: ['#f5f6f0', '#345c32', '#9cac54'],
  },
  {
    id: 'gimmer',
    name: 'Gimmer',
    description: 'A cool blue palette from your Figma design.',
    preview: ['#ededed', '#133250', '#80b5d7'],
  },
  {
    id: 'alabaster',
    name: 'Alabaster',
    description: 'A warm neutral palette from your Figma design.',
    preview: ['#e7d0aa', '#65501c', '#7b6c3c'],
  },
]

