"use client"

import { Button } from "@/components/ui/button"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogFooter,
 DialogClose,
} from "@/components/ui/dialog"

interface DeleteContractDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 contractName: string | undefined
 onConfirm: () => void
}

export function DeleteContractDialog({ open, onOpenChange, contractName, onConfirm }: DeleteContractDialogProps) {
 return (
  <Dialog open={open} onOpenChange={onOpenChange}>
   <DialogContent>
    <DialogHeader>
     <DialogTitle>Confirmar Exclusão</DialogTitle>
     <DialogDescription>
      Você tem certeza que deseja excluir o contrato &quot;{contractName}&quot;? Esta ação não pode ser desfeita.
     </DialogDescription>
    </DialogHeader>
    <DialogFooter>
     <DialogClose asChild>
      <Button variant="outline">Cancelar</Button>
     </DialogClose>
     <Button variant="destructive" onClick={onConfirm}>Excluir</Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 )
}