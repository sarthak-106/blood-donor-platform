/**
 * prisma/seed.ts
 * Seeds the SQLite database with Indian blood donor platform data.
 * Run: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Indian Blood Donor Platform database...');

  // ─── Users ───────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { id: 'user-recipient-1' },
    update: {},
    create: {
      id: 'user-recipient-1',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.in',
      phone: '+91 98765 01234',
      role: 'recipient',
      verification_status: 'Verified',
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-08-20T10:00:00Z',
    },
  });

  await prisma.user.upsert({
    where: { id: 'user-donor-1' },
    update: {},
    create: {
      id: 'user-donor-1',
      name: 'Rajesh Patel',
      email: 'rajesh.patel@example.in',
      phone: '+91 98765 43210',
      role: 'donor',
      verification_status: 'Verified',
      created_at: '2026-01-20T09:00:00Z',
      updated_at: '2026-08-20T10:00:00Z',
    },
  });

  await prisma.user.upsert({
    where: { id: 'user-hospital-1' },
    update: {},
    create: {
      id: 'user-hospital-1',
      name: 'Dr. Ananya Sen',
      email: 'dr.ananya.sen@aiims.edu.in',
      phone: '+91 11 2658 8500',
      role: 'hospital',
      verification_status: 'Verified',
      created_at: '2026-01-10T08:00:00Z',
      updated_at: '2026-08-15T10:00:00Z',
    },
  });

  await prisma.user.upsert({
    where: { id: 'user-admin-1' },
    update: {},
    create: {
      id: 'user-admin-1',
      name: 'Vikram Malhotra',
      email: 'vikram.malhotra@nationalbloodregistry.org.in',
      phone: '+91 11 2338 8700',
      role: 'admin',
      verification_status: 'Verified',
      created_at: '2026-01-05T07:00:00Z',
      updated_at: '2026-08-10T10:00:00Z',
    },
  });

  console.log('✅ Users seeded');

  // ─── Donors ───────────────────────────────────────────────────
  const donors = [
    {
      id: 'donor-1',
      user_id: 'user-donor-1',
      name: 'Rajesh Patel',
      email: 'rajesh.patel@example.in',
      phone: '+91 98765 43210',
      blood_group: 'O-',
      city: 'Mumbai',
      area: 'Parel (Near KEM / Tata Memorial)',
      pin_code: '400012',
      latitude: 19.0033,
      longitude: 72.8432,
      total_donations: 14,
      verification_status: 'Verified',
      rating: 4.95,
      badge_title: 'Gold Life Guardian',
      bio: 'Universal O- blood donor active in Mumbai & Navi Mumbai. Ready to assist trauma cases at KEM, Hinduja, or Tata Memorial.',
      updated_at: '2026-08-20T10:00:00Z',
    },
    {
      id: 'donor-2',
      user_id: 'user-donor-2',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@example.in',
      phone: '+91 98490 87654',
      blood_group: 'B+',
      city: 'Hyderabad',
      area: 'Banjara Hills (Road No. 12)',
      pin_code: '500034',
      latitude: 17.4123,
      longitude: 78.4482,
      total_donations: 9,
      verification_status: 'Verified',
      rating: 4.9,
      badge_title: 'Silver Life Saver',
      bio: 'Regular platelet and whole blood donor. Available for quick dispatch to KIMS, Care Hospital, and Apollo Jubilee Hills.',
      updated_at: '2026-08-18T14:30:00Z',
    },
    {
      id: 'donor-3',
      user_id: 'user-donor-3',
      name: 'Amit Verma',
      email: 'amit.verma@example.in',
      phone: '+91 98111 76543',
      blood_group: 'A+',
      city: 'New Delhi',
      area: 'Saket (South Delhi)',
      pin_code: '110017',
      latitude: 28.5244,
      longitude: 77.2167,
      total_donations: 19,
      verification_status: 'Verified',
      rating: 4.88,
      badge_title: 'Platinum Century Donor',
      bio: 'Regular donor for 8+ years. Accessible to Max Saket, AIIMS, and Safdarjung Hospital.',
      updated_at: '2026-08-12T09:15:00Z',
    },
    {
      id: 'donor-4',
      user_id: 'user-donor-4',
      name: 'Ananya Iyer',
      email: 'ananya.iyer@example.in',
      phone: '+91 94440 98765',
      blood_group: 'AB-',
      city: 'Chennai',
      area: 'Adyar / Besant Nagar',
      pin_code: '600020',
      latitude: 13.0012,
      longitude: 80.2565,
      total_donations: 7,
      verification_status: 'Verified',
      rating: 5.0,
      badge_title: 'Rare Blood Hero',
      availability: 'Emergency-Only',
      bio: 'Rare AB- blood donor. Dedicated to emergency pediatric and cardiovascular surgeries across Chennai hospitals.',
      updated_at: '2026-08-25T16:00:00Z',
    },
    {
      id: 'donor-5',
      user_id: 'user-donor-5',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.in',
      phone: '+91 98200 11223',
      blood_group: 'O+',
      city: 'Mumbai',
      area: 'Bandra West (Hill Road)',
      pin_code: '400050',
      latitude: 19.0596,
      longitude: 72.8295,
      total_donations: 11,
      verification_status: 'Verified',
      rating: 4.82,
      badge_title: 'Gold Life Guardian',
      bio: 'O+ blood donor available for urgent requests across Lilavati, Bhabha, and Nanavati hospitals.',
      updated_at: '2026-08-22T11:45:00Z',
    },
  ];

  for (const donor of donors) {
    // Upsert user if not the main demo user
    if (donor.user_id !== 'user-donor-1') {
      await prisma.user.upsert({
        where: { id: donor.user_id },
        update: {},
        create: {
          id: donor.user_id,
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          role: 'donor',
          verification_status: 'Verified',
          created_at: '2026-02-01T10:00:00Z',
          updated_at: donor.updated_at,
        },
      });
    }
    await prisma.donor.upsert({
      where: { id: donor.id },
      update: {},
      create: {
        id: donor.id,
        user_id: donor.user_id,
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
        blood_group: donor.blood_group,
        city: donor.city,
        area: donor.area,
        pin_code: donor.pin_code,
        latitude: donor.latitude,
        longitude: donor.longitude,
        availability: (donor as any).availability || 'Available',
        total_donations: donor.total_donations,
        verification_status: donor.verification_status,
        rating: donor.rating,
        badge_title: donor.badge_title,
        bio: donor.bio,
        emergency_ready: true,
        response_rate_percent: 95,
        avg_response_time: '15 mins',
        updated_at: donor.updated_at,
      },
    });
  }

  console.log('✅ Donors seeded');

  // ─── Blood Banks ───────────────────────────────────────────────
  const bloodBanks = [
    {
      id: 'bb-1',
      name: 'Indian Red Cross Society — Delhi State Blood Transfusion Council',
      city: 'New Delhi',
      address: '1 Red Cross Road, New Delhi — 110 001',
      phone: '+91 11 2371 6441',
      latitude: 28.6290,
      longitude: 77.2200,
      is_24x7: true,
      stock_A_pos: 45,
      stock_A_neg: 8,
      stock_B_pos: 52,
      stock_B_neg: 5,
      stock_AB_pos: 18,
      stock_AB_neg: 2,
      stock_O_pos: 61,
      stock_O_neg: 12,
      services: 'Whole Blood,Packed RBC,Platelets,FFP,Cryoprecipitate,Apheresis',
      updated_at: '2026-08-28T10:00:00Z',
    },
    {
      id: 'bb-2',
      name: 'Tata Memorial Hospital Blood Bank',
      city: 'Mumbai',
      address: 'Dr. Ernest Borges Marg, Parel, Mumbai — 400 012',
      phone: '+91 22 2417 7000',
      latitude: 19.0044,
      longitude: 72.8420,
      is_24x7: true,
      stock_A_pos: 38,
      stock_A_neg: 6,
      stock_B_pos: 41,
      stock_B_neg: 3,
      stock_AB_pos: 14,
      stock_AB_neg: 1,
      stock_O_pos: 55,
      stock_O_neg: 9,
      services: 'Whole Blood,Packed RBC,Platelets,FFP,Stem Cell,Oncology Blood Bank',
      updated_at: '2026-08-27T10:00:00Z',
    },
    {
      id: 'bb-3',
      name: 'Rotary Blood Bank',
      city: 'New Delhi',
      address: '34, Tughlakabad Institutional Area, New Delhi — 110 062',
      phone: '+91 11 2996 1000',
      latitude: 28.5060,
      longitude: 77.2590,
      is_24x7: true,
      stock_A_pos: 30,
      stock_A_neg: 4,
      stock_B_pos: 28,
      stock_B_neg: 2,
      stock_AB_pos: 9,
      stock_AB_neg: 1,
      stock_O_pos: 48,
      stock_O_neg: 7,
      services: 'Whole Blood,Packed RBC,Platelets,FFP,Voluntary Blood Donation Camps',
      updated_at: '2026-08-26T10:00:00Z',
    },
    {
      id: 'bb-4',
      name: 'Victoria Hospital Blood Bank (BMCRI)',
      city: 'Bengaluru',
      address: 'Fort Road, Krishnarajendra Market, Bengaluru — 560 002',
      phone: '+91 80 2670 1150',
      latitude: 12.9736,
      longitude: 77.5771,
      is_24x7: true,
      stock_A_pos: 25,
      stock_A_neg: 3,
      stock_B_pos: 31,
      stock_B_neg: 2,
      stock_AB_pos: 11,
      stock_AB_neg: 1,
      stock_O_pos: 44,
      stock_O_neg: 6,
      services: 'Whole Blood,Packed RBC,Platelets,FFP',
      updated_at: '2026-08-25T10:00:00Z',
    },
    {
      id: 'bb-5',
      name: 'Lions Blood Bank Chennai',
      city: 'Chennai',
      address: '50 EVK Sampath Salai, Vepery, Chennai — 600 007',
      phone: '+91 44 2532 1166',
      latitude: 13.0840,
      longitude: 80.2715,
      is_24x7: true,
      stock_A_pos: 22,
      stock_A_neg: 3,
      stock_B_pos: 26,
      stock_B_neg: 2,
      stock_AB_pos: 8,
      stock_AB_neg: 0,
      stock_O_pos: 37,
      stock_O_neg: 5,
      services: 'Whole Blood,Packed RBC,Platelets,Apheresis',
      updated_at: '2026-08-24T10:00:00Z',
    },
    {
      id: 'bb-6',
      name: 'Prathama Blood Centre',
      city: 'Ahmedabad',
      address: 'Dudhsagar Darwaza, Dudhsagar, Ahmedabad — 380 004',
      phone: '+91 79 2550 0981',
      latitude: 23.0364,
      longitude: 72.5942,
      is_24x7: true,
      stock_A_pos: 35,
      stock_A_neg: 5,
      stock_B_pos: 29,
      stock_B_neg: 3,
      stock_AB_pos: 10,
      stock_AB_neg: 1,
      stock_O_pos: 50,
      stock_O_neg: 8,
      services: 'Whole Blood,Packed RBC,Platelets,FFP,Thalassemia Patients Program',
      updated_at: '2026-08-23T10:00:00Z',
    },
  ];

  for (const bank of bloodBanks) {
    await prisma.bloodBank.upsert({
      where: { id: bank.id },
      update: {},
      create: bank,
    });
  }

  console.log('✅ Blood banks seeded');

  // ─── Notifications ─────────────────────────────────────────────
  const notifications = [
    {
      id: 'notif-1',
      user_id: 'user-donor-1',
      title: '🩸 Emergency: B+ Blood Needed at AIIMS',
      message: 'Critical request from AIIMS Trauma Centre, New Delhi. Immediate B+ blood needed.',
      type: 'emergency',
      read: false,
      created_at: '2026-08-28T08:00:00Z',
    },
    {
      id: 'notif-2',
      user_id: 'user-donor-1',
      title: '🏆 Gold Life Guardian Badge Earned!',
      message: 'Congratulations! You have saved 14 lives and earned the Gold Life Guardian badge.',
      type: 'badge',
      read: true,
      created_at: '2026-07-15T10:00:00Z',
    },
  ];

  for (const notif of notifications) {
    await prisma.notification.upsert({
      where: { id: notif.id },
      update: {},
      create: notif,
    });
  }

  // ─── Blood Request Sample ──────────────────────────────────────
  await prisma.bloodRequest.upsert({
    where: { id: 'req-seed-1' },
    update: {},
    create: {
      id: 'req-seed-1',
      requester_id: 'user-recipient-1',
      requester_name: 'Priya Sharma',
      requester_phone: '+91 98765 01234',
      patient_name: 'Aarav Mehta',
      blood_group: 'B+',
      hospital: 'AIIMS New Delhi (Trauma Centre)',
      city: 'New Delhi',
      quantity_units: 2,
      urgency: 'Critical',
      status: 'Open',
      is_emergency_sos: true,
      contact_number: '+91 98765 01234',
      notes: 'Emergency pediatric trauma case at AIIMS.',
      created_at: '2026-08-28T08:00:00Z',
      updated_at: '2026-08-28T08:00:00Z',
    },
  });

  console.log('✅ Notifications and blood requests seeded');
  console.log('🎉 Indian blood donor platform database ready!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
