"use client"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ExportDataDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
}

export function ExportDataDialog({ open, onOpenChange }: ExportDataDialogProps) {
 const [format, setFormat] = useState("excel")
 const [isExporting, setIsExporting] = useState(false)
 const supabase = createClient()

 const handleExport = async () => {
  setIsExporting(true)

  const promise = async () => {
   const { data: contracts, error } = await supabase.from("contracts").select("*")
   if (error) throw error

   if (!contracts || contracts.length === 0) {
    throw new Error("Nenhum contrato para exportar.")
   }

   if (format === "json") {
    const jsonString = JSON.stringify(contracts, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    saveAs(blob, "contratos.json")
   } else if (format === "excel") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Contratos');

    // Definindo o cabeçalho da planilha
    worksheet.columns = [
     { header: 'Nº CONTRATO', key: 'id', width: 30 },
     { header: 'OBJETO', key: 'title', width: 30 },
     { header: 'CONTRATANTE', key: 'client_name', width: 30 },
     { header: 'DATA INÍCIO/ ASSINATURA', key: 'start_date', width: 20 },
     { header: 'VIGÊNCIA ATUAL - TÉRMINO', key: 'end_date', width: 20 },
     { header: 'VALOR GLOBAL ATUAL DO CONTRATO', key: 'contract_value', width: 25 },
     { header: 'STATUS', key: 'status', width: 15 },
     { header: 'TAGS', key: 'tags', width: 30 },
    ];

    // Adicionando os dados
    contracts.forEach(contract => {
     worksheet.addRow({
      ...contract,
      tags: Array.isArray(contract.tags) ? contract.tags.join(', ') : ''
     });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(blob, "CONTRATOS_FIRMADOS.xlsx");
   }
  }

  toast.promise(promise, {
   loading: 'Exportando dados...',
   success: 'Dados exportados com sucesso!',
   error: (err) => `Erro ao exportar: ${err.message}`,
   finally: () => setIsExporting(false)
  });

 }

 return (
  <Dialog open={open} onOpenChange={onOpenChange}>
   <DialogContent>
    <DialogHeader>
     <DialogTitle>Exportar Dados</DialogTitle>
     <DialogDescription>
      Selecione o formato para exportar os dados dos contratos.
     </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
     <div className="space-y-2">
      <Label htmlFor="format">Formato de Exportação</Label>
      <Select value={format} onValueChange={setFormat}>
       <SelectTrigger id="format">
        <SelectValue />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="excel">Excel (XLSX)</SelectItem>
        <SelectItem value="json">JSON</SelectItem>
       </SelectContent>
      </Select>
     </div>
    </div>
    <DialogFooter>
     <DialogClose asChild>
      <Button variant="outline">Cancelar</Button>
     </DialogClose>
     <Button onClick={handleExport} disabled={isExporting}>
      {isExporting ? "Exportando..." : "Exportar"}
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 )
}