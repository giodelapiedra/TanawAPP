import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Barangays of Tanauan City, Batangas ─────────────────

const BARANGAYS = [
  { code: 'BGY-ABAT-001', name: 'Altura Bata' },
  { code: 'BGY-AMAT-002', name: 'Altura Matanda' },
  { code: 'BGY-AMBU-003', name: 'Ambulong' },
  { code: 'BGY-BAGB-004', name: 'Bagbag' },
  { code: 'BGY-BAGY-005', name: 'Bagumbayan' },
  { code: 'BGY-BALE-006', name: 'Balele' },
  { code: 'BGY-BEAS-007', name: 'Banjo East' },
  { code: 'BGY-BLAU-008', name: 'Banjo Laurel' },
  { code: 'BGY-BILO-009', name: 'Bilog-Bilog' },
  { code: 'BGY-BOOT-010', name: 'Boot' },
  { code: 'BGY-CALE-011', name: 'Cale' },
  { code: 'BGY-DARA-012', name: 'Darasa' },
  { code: 'BGY-GONZ-013', name: 'Gonzales' },
  { code: 'BGY-HIDA-014', name: 'Hidalgo' },
  { code: 'BGY-JANO-015', name: 'Janopol' },
  { code: 'BGY-JORI-016', name: 'Janopol Oriental' },
  { code: 'BGY-LAUR-017', name: 'Laurel' },
  { code: 'BGY-LUYO-018', name: 'Luyos' },
  { code: 'BGY-MABI-019', name: 'Mabini' },
  { code: 'BGY-MPUL-020', name: 'Malaking Pulo' },
  { code: 'BGY-MPAZ-021', name: 'Maria Paz' },
  { code: 'BGY-MAUG-022', name: 'Maugat' },
  { code: 'BGY-MONT-023', name: 'Montana' },
  { code: 'BGY-NATA-024', name: 'Natatas' },
  { code: 'BGY-PGAR-025', name: 'Padre Garcia' },
  { code: 'BGY-PAIB-026', name: 'Payapa Ibaba' },
  { code: 'BGY-PAIL-027', name: 'Payapa Ilaya' },
  { code: 'BGY-POB1-028', name: 'Poblacion Barangay 1' },
  { code: 'BGY-POB2-029', name: 'Poblacion Barangay 2' },
  { code: 'BGY-POB3-030', name: 'Poblacion Barangay 3' },
  { code: 'BGY-POB4-031', name: 'Poblacion Barangay 4' },
  { code: 'BGY-POB5-032', name: 'Poblacion Barangay 5' },
  { code: 'BGY-POB6-033', name: 'Poblacion Barangay 6' },
  { code: 'BGY-POB7-034', name: 'Poblacion Barangay 7' },
  { code: 'BGY-SALA-035', name: 'Sala' },
  { code: 'BGY-SAMB-036', name: 'Sambat' },
  { code: 'BGY-SJOS-037', name: 'San Jose' },
  { code: 'BGY-SNTL-038', name: 'Santol' },
  { code: 'BGY-SNTR-039', name: 'Santor' },
  { code: 'BGY-SULP-040', name: 'Sulpoc' },
  { code: 'BGY-SUPL-041', name: 'Suplang' },
  { code: 'BGY-TALA-042', name: 'Talaga' },
  { code: 'BGY-TALI-043', name: 'Talisay' },
  { code: 'BGY-TINU-044', name: 'Tinurik' },
  { code: 'BGY-TRAP-045', name: 'Trapiche' },
  { code: 'BGY-ULAN-046', name: 'Ulango' },
  { code: 'BGY-WAWA-047', name: 'Wawa' },
];

// ─── Employee Codes ──────────────────────────────────────
// 10 codes per department, 5 departments = 50 total

const DEPARTMENTS = ['CHO', 'CBAO', 'CDRRMO', 'CEO', 'CTO'];

function generateEmployeeCodes() {
  const year = new Date().getFullYear();
  const codes: { code: string; department: string }[] = [];
  for (const dept of DEPARTMENTS) {
    for (let i = 1; i <= 10; i++) {
      codes.push({
        code: `EMP-${dept}-${year}-${String(i).padStart(3, '0')}`,
        department: dept,
      });
    }
  }
  return codes;
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  console.log('Seeding TANAW database...\n');

  // 1. Barangays
  for (const bgy of BARANGAYS) {
    await prisma.barangay.upsert({
      where: { code: bgy.code },
      update: { name: bgy.name },
      create: { ...bgy, isActive: true },
    });
  }
  console.log(`  ${BARANGAYS.length} barangay codes seeded`);

  // 2. TANAW ID Counters
  for (const role of Object.values(UserRole)) {
    await prisma.tanawIdCounter.upsert({
      where: { role },
      update: {},
      create: { role, year: new Date().getFullYear(), lastCount: 0 },
    });
  }
  console.log('  TANAW ID counters initialized');

  // 3. Employee Codes
  const empCodes = generateEmployeeCodes();
  for (const ec of empCodes) {
    await prisma.employeeCode.upsert({
      where: { code: ec.code },
      update: {},
      create: { code: ec.code, department: ec.department, isUsed: false },
    });
  }
  console.log(`  ${empCodes.length} employee codes seeded`);

  // 4. Test admin user
  const passwordHash = await bcrypt.hash('password123', 12);
  const poblacion = await prisma.barangay.findUnique({ where: { code: 'BGY-POB1-028' } });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tanauan.gov.ph' },
    update: {},
    create: {
      tanawId: `TAN-GOV-${new Date().getFullYear()}-00001`,
      email: 'admin@tanauan.gov.ph',
      phone: '09170000001',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Tanauan',
      birthDate: new Date('1990-01-01'),
      gender: 'MALE',
      role: 'GOVERNMENT_EMPLOYEE',
      status: 'ACTIVE',
      employeeCode: `EMP-CEO-${new Date().getFullYear()}-001`,
      department: 'CEO',
      position: 'Administrator',
      barangayId: poblacion?.id,
      address: { create: {} },
    },
  });
  console.log(`  Admin seeded: ${admin.tanawId} (${admin.email})`);

  // Align GOV counter + mark employee code as used
  await prisma.tanawIdCounter.update({
    where: { role: 'GOVERNMENT_EMPLOYEE' },
    data: { lastCount: 1 },
  });
  await prisma.employeeCode.update({
    where: { code: `EMP-CEO-${new Date().getFullYear()}-001` },
    data: { isUsed: true, usedBy: 'admin@tanauan.gov.ph' },
  });

  console.log('\nDone! Test codes:');
  console.log(`  Barangay : BGY-SALA-035`);
  console.log(`  Employee : EMP-CHO-${new Date().getFullYear()}-001`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
