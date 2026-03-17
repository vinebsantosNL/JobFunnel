export const COMPETENCY_CATEGORIES: Record<string, string[]> = {
  Leadership: ['Team Management', 'Decision Making', 'Mentoring', 'Conflict Resolution'],
  Technical: ['Problem Solving', 'System Design', 'Technical Excellence', 'Innovation'],
  Collaboration: ['Cross-functional Work', 'Stakeholder Management', 'Communication'],
  Execution: ['Project Delivery', 'Prioritization', 'Working Under Pressure', 'Adaptability'],
  Growth: ['Learning Agility', 'Feedback Reception', 'Self-improvement'],
}

export const ALL_COMPETENCIES: string[] = Object.values(COMPETENCY_CATEGORIES).flat()
