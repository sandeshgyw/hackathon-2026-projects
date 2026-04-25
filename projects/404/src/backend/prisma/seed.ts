import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type SeedUser = {
  email: string;
  password: string;
  role: Role;
  fullName: string;
};

async function upsertUser({ email, password, role, fullName }: SeedUser) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      password: hashedPassword,
      role,
    },
    create: {
      fullName,
      email,
      password: hashedPassword,
      role,
    },
  });
}

async function main() {
  const admin = await upsertUser({
    email: 'admin@gmail.com',
    password: 'admin123',
    role: Role.ADMIN,
    fullName: 'Admin User',
  });

  const patient = await upsertUser({
    email: 'patient@gmail.com',
    password: 'patient123',
    role: Role.PATIENT,
    fullName: 'Patient User',
  });

  const doctor = await upsertUser({
    email: 'doctor@gmail.com',
    password: 'doctor@123',
    role: Role.DOCTOR,
    fullName: 'Doctor User',
  });

  const specialization = await prisma.specialization.upsert({
    where: { name: 'General Medicine' },
    update: {},
    create: {
      name: 'General Medicine',
      description: 'General healthcare specialization',
    },
  });

  await prisma.patient.upsert({
    where: { userId: patient.id },
    update: {},
    create: { userId: patient.id },
  });

  await prisma.doctor.upsert({
    where: { userId: doctor.id },
    update: { specializationId: specialization.id },
    create: {
      userId: doctor.id,
      specializationId: specialization.id,
    },
  });

  console.log('Seeded users:', {
    admin: admin.email,
    patient: patient.email,
    doctor: doctor.email,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
