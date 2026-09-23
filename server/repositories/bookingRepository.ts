import { prisma } from '../db.js';

export async function createAppointment(input: { name: string; phone: string; service: string; date?: string; notes?: string }) {
  const customer = await prisma.customer.upsert({
    where: { phone: input.phone },
    update: { name: input.name, address: undefined },
    create: { name: input.name, phone: input.phone },
  });
  const service = await prisma.service.findFirst({ where: { OR: [{ slug: input.service }, { title: input.service }] } });
  if (!service) throw new Error('SERVICE_NOT_FOUND');
  return prisma.appointment.create({
    data: { customerId: customer.id, serviceId: service.id, requestedAt: input.date ? new Date(input.date) : new Date(), notes: input.notes },
  });
}
