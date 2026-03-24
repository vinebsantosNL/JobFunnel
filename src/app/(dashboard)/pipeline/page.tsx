import { Header } from '@/components/layout/header'
import { KanbanBoard } from '@/components/pipeline/kanban-board'

export default function PipelinePage() {
  return (
    <>
      <Header title="Pipeline" />
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full">
          <KanbanBoard />
        </div>
      </div>
    </>
  )
}
