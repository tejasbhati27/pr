declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react'

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string
    strokeWidth?: number | string
    absoluteStrokeWidth?: boolean
  }

  type Icon = ComponentType<IconProps>

  export const AlertCircle: Icon
  export const ArrowRight: Icon
  export const Check: Icon
  export const ChevronLeft: Icon
  export const ChevronRight: Icon
  export const ChevronsUpDown: Icon
  export const Circle: Icon
  export const Clock: Icon
  export const File: Icon
  export const Laptop: Icon
  export const Loader2: Icon
  export const Moon: Icon
  export const MoreVertical: Icon
  export const Plus: Icon
  export const Search: Icon
  export const Settings: Icon
  export const Sun: Icon
  export const Trash: Icon
  export const Trash2: Icon
  export const User: Icon
  export const X: Icon
} 