export function isDestop(): boolean {
  return window.innerWidth > 991;
}

export function isMobile(): boolean {
  return window.innerWidth <= 991;
}
