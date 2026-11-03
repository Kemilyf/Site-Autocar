import { z } from "zod";
export const appointmentSchema=z.object({
  name:z.string().trim().min(2).max(120),phone:z.string().trim().min(7).max(30),
  email:z.string().trim().email().max(180).optional().or(z.literal("")),
  registration:z.string().trim().max(20).optional().or(z.literal("")),
  make:z.string().trim().max(80).optional().or(z.literal("")),
  model:z.string().trim().max(80).optional().or(z.literal("")),
  year:z.coerce.number().int().min(1950).max(new Date().getFullYear()+1).optional().nullable(),
  serviceId:z.string().uuid(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  notes:z.string().trim().max(2000).optional().or(z.literal("")),
  privacyAccepted:z.literal(true)
});
export const estimateSchema=z.object({
  name:z.string().trim().min(2).max(120),phone:z.string().trim().min(7).max(30),
  email:z.string().trim().email().max(180).optional().or(z.literal("")),
  registration:z.string().trim().max(20).optional().or(z.literal("")),
  make:z.string().trim().max(80).optional().or(z.literal("")),
  model:z.string().trim().max(80).optional().or(z.literal("")),
  year:z.coerce.number().int().min(1950).max(new Date().getFullYear()+1).optional().nullable(),
  serviceId:z.string().uuid(),problem:z.string().trim().max(2000).optional().or(z.literal("")),
  privacyAccepted:z.literal(true)
});
export const serviceAdminSchema=z.object({
  priceMode:z.enum(["fixed","estimate","quote"]),
  basePrice:z.number().min(0).max(100000).nullable(),
  durationMinutes:z.number().int().min(15).max(720),
  active:z.boolean(),vatRate:z.number().min(0).max(100),priceIncludesVat:z.boolean()
});