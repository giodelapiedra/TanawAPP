import { UserRole, Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../config/database';

const ROLE_PREFIX: Record<UserRole, string> = {
  RESIDENT: 'RES',
  BARANGAY_OFFICIAL: 'BGY',
  GOVERNMENT_EMPLOYEE: 'GOV',
  SUPER_ADMIN: 'ADM',
};

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// Use inside an existing $transaction — pass the tx client
export async function generateTanawIdTx(tx: TxClient, role: UserRole): Promise<string> {
  const prefix = ROLE_PREFIX[role];
  const currentYear = new Date().getFullYear();

  const existing = await tx.tanawIdCounter.findUnique({ where: { role } });

  let counter;
  if (!existing) {
    counter = await tx.tanawIdCounter.create({ data: { role, year: currentYear, lastCount: 1 } });
  } else if (existing.year !== currentYear) {
    counter = await tx.tanawIdCounter.update({ where: { role }, data: { year: currentYear, lastCount: 1 } });
  } else {
    counter = await tx.tanawIdCounter.update({ where: { role }, data: { lastCount: existing.lastCount + 1 } });
  }

  return `TAN-${prefix}-${currentYear}-${String(counter.lastCount).padStart(5, '0')}`;
}

// Standalone — wraps in its own transaction (for use outside existing tx)
export async function generateTanawId(role: UserRole): Promise<string> {
  return prisma.$transaction(async (tx) => generateTanawIdTx(tx, role));
}
