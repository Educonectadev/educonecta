declare module "react-wheel-time-picker" {
  interface TimePickerProps {
    value: string
    onChange: (val: string) => void
    onSave?: (val: string) => void
    onCancel?: () => void
    label?: string
    inputClassName?: string
    popupClassName?: string
    isDarkMode?: boolean
    cellHeight?: number
    placeholder?: string
    pickerDefaultValue?: string
    disabled?: boolean
    isOpen?: boolean
    required?: boolean
    cancelButtonText?: string
    saveButtonText?: string
    controllers?: boolean
    seperator?: boolean
    id?: string
    name?: string
    use12Hours?: boolean
    onAmPmChange?: (val: string) => void
    onOpen?: () => void
    onClose?: () => void
    onFocus?: () => void
  }

  export const TimePicker: React.FC<TimePickerProps>
}
