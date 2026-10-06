import { useId } from 'react'
import Input from '../atoms/Input'
import Label from '../atoms/Label'

export default function FormField({ label, id, error, required, ...inputProps }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      <Input
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
