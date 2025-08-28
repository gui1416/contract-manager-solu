import { z } from "zod";

export const contractSchema = z.object({
 title: z.string().min(1, { message: "O título é obrigatório." }),
 description: z.string().nullable().optional(),
 contract_type: z.string(),
 client_name: z.string().min(1, { message: "O nome do cliente é obrigatório." }),
 client_email: z.string().email({ message: "Email inválido." }).nullable().optional().or(z.literal('')),
 contract_value: z.coerce.number().nullable().optional(),
 start_date: z.date().nullable().optional(),
 end_date: z.date().nullable().optional(),
 status: z.string(),
 tags: z.string().optional().transform(val => {
  if (!val) return [];
  return val.split(',').map(tag => tag.trim()).filter(Boolean);
 }),
 file: z.any().optional(),
});

export type ContractFormData = z.infer<typeof contractSchema>;