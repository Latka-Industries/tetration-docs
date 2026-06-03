import type { InjectionKey, Ref } from 'vue'

export type DropdownMenuContext = {
  open: Ref<boolean>
  toggle: () => void
  close: () => void
}

export const dropdownMenuKey: InjectionKey<DropdownMenuContext> = Symbol('dropdown-menu')
