const CODE_CHARACTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateExamCode() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('La génération sécurisée de codes nécessite un navigateur compatible.')
  }
  const randomValues = new Uint32Array(6)
  globalThis.crypto.getRandomValues(randomValues)
  return Array.from(randomValues, (value) => CODE_CHARACTERS[value % CODE_CHARACTERS.length]).join('')
}
