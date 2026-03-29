'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateCVVersionModal } from './CreateCVVersionModal'

export function NewCVVersionButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" />
        New CV version
      </Button>
      <CreateCVVersionModal open={open} onOpenChange={setOpen} />
    </>
  )
}
