export function evaluatePasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const meetsPolicy = checks.length && checks.number && checks.special;

  return { checks, score, meetsPolicy };
}
