// Australian Business Number (ABN) validation.
//
// The ATO defines an 11-digit ABN with a modulus-89 checksum. Validating it
// client-side gives first-time contractors instant, trustworthy feedback;
// a wrong ABN on a tax invoice is one of the most common compliance mistakes.
//
// Algorithm (per the ATO / Australian Business Register specification):
//   1. Subtract 1 from the first (leftmost) digit.
//   2. Multiply each of the 11 digits by its positional weight.
//   3. Sum the products. The ABN is valid if the sum is divisible by 89.

const WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

/** Strip spaces/punctuation and return the raw digit string. */
export function normalizeABN(value) {
  return String(value || '').replace(/\D/g, '')
}

/**
 * Returns true only for a structurally valid 11-digit ABN.
 * An empty value returns false; use `isABNPresent` to distinguish "blank"
 * from "present but invalid" when surfacing warnings vs errors.
 */
export function isValidABN(value) {
  const digits = normalizeABN(value)
  if (digits.length !== 11) return false
  if (!/^\d{11}$/.test(digits)) return false

  const numbers = digits.split('').map(Number)
  numbers[0] -= 1
  const sum = numbers.reduce((acc, n, i) => acc + n * WEIGHTS[i], 0)
  return sum % 89 === 0
}

export function isABNPresent(value) {
  return normalizeABN(value).length > 0
}
