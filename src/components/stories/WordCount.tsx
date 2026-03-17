'use client'

interface WordCountProps {
  value: string
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function WordCount({ value }: WordCountProps) {
  return (
    <span className="text-xs text-gray-400">{countWords(value)} words</span>
  )
}
