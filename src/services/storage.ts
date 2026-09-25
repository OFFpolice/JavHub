const AGE_WARNING_KEY = 'apijav_age_confirmed';

export function hasAcceptedAgeWarning(): boolean {
  try {
    return localStorage.getItem(AGE_WARNING_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAcceptedAgeWarning(): void {
  try {
    localStorage.setItem(AGE_WARNING_KEY, 'true');
  } catch {}
}
