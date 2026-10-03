import { useId } from 'react'
import Input from '../atoms/Input'
import Label from '../atoms/Label'

export default function FormField({ label, id, ...inputProps }) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input id={inputId} {...inputProps} />
    </div>
  )
}
