import { useId } from 'react'
import Input from '../atoms/Input'
import Label from '../atoms/Label'
import Textarea from '../atoms/Textarea'

export default function FormField({ label, id, error, required, multiline = false, ...inputProps }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const Control = multiline ? Textarea : Input

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      <Control
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} role="alert" className="text-[15px] text-error">
          {error}
        </p>
      )}
    </div>
  )
}
