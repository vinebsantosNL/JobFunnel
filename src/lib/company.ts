/**
 * Shared helpers for company avatar display.
 * Used by ApplicationCard and ApplicationModal.
 */

const COMPANY_COLORS = [
  '#1DB954', '#003580', '#E50914', '#FF6B00', '#0A0A0A',
  '#00B8D9', '#FF5722', '#4A90D9', '#607D8B', '#4CAF50',
]

export function getCompanyColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length]
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
