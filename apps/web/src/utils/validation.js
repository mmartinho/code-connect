const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function requiredMessage(value, message) {
  return value.trim() ? undefined : message
}

export function emailMessage(value) {
  if (!value.trim()) return 'Informe o seu email.'
  return EMAIL_PATTERN.test(value.trim()) ? undefined : 'Informe um email válido, como nome@exemplo.com.'
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}

// Leva o foco ao primeiro campo com erro, na ordem em que aparecem no formulário
export function focusFirstInvalid(form, errors) {
  const field = [...form.elements].find((element) => errors[element.name])
  field?.focus()
}

export function minLengthMessage(value, min, message) {
  return value.length >= min ? undefined : message
}
