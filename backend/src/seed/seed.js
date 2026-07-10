import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

import Admin from '../models/Admin.js';
import Settings from '../models/Settings.js';
import BoardMember from '../models/BoardMember.js';
import Service from '../models/Service.js';
import Offer from '../models/Offer.js';
import Lecture from '../models/Lecture.js';
import Contract from '../models/Contract.js';
import GovernmentLink from '../models/GovernmentLink.js';
import Activity from '../models/Activity.js';
import Judgment from '../models/Judgment.js';
import Court from '../models/Court.js';

const run = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // --- Admin ---
  const email = process.env.ADMIN_EMAIL || 'admin@bar-southqalyubia.eg';
  const existing = await Admin.findOne({ email });
  if (!existing) {
    await Admin.create({
      name: process.env.ADMIN_NAME || 'مدير النظام',
      email,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'superadmin',
    });
    console.log(`👤 Admin created: ${email}`);
  } else {
    console.log('👤 Admin already exists, skipping');
  }

  // --- Settings ---
  const settings = await Settings.getSingleton();
  Object.assign(settings, {
    unionName: 'نقابة محامين جنوب القليوبية',
    aboutText:
      'نقابة محامين جنوب القليوبية تعمل على خدمة السادة المحامين بالنقابة الفرعية وتقديم كافة الخدمات والتسهيلات التي تعينهم على أداء رسالتهم في تحقيق العدالة، وتوفير العروض والتعاقدات والندوات وقاعدة بيانات لأحكام النقض.',
    address: 'مدينة بنها - محافظة القليوبية',
    phone: '013-0000000',
    email: 'info@bar-southqalyubia.eg',
    workingHours: 'السبت - الخميس: 9 صباحاً إلى 3 مساءً',
    googleMapsLink: 'https://maps.google.com/?q=Benha',
  });
  await settings.save();
  console.log('⚙️  Settings seeded');

  // --- Board members ---
  if ((await BoardMember.countDocuments()) === 0) {
    await BoardMember.insertMany([
      { fullName: 'الأستاذ / محمد عبد الله', position: 'نقيب المحامين', bio: 'نقيب محامين جنوب القليوبية', order: 1 },
      { fullName: 'الأستاذ / أحمد سمير', position: 'وكيل النقابة', bio: 'وكيل النقابة الفرعية', order: 2 },
      { fullName: 'الأستاذة / منى خالد', position: 'أمين الصندوق', bio: 'أمين صندوق النقابة', order: 3 },
    ]);
    console.log('👥 Board members seeded');
  }

  // --- Services ---
  if ((await Service.countDocuments()) === 0) {
    await Service.insertMany([
      { title: 'العلاج الطبي', description: 'خدمات الرعاية الصحية للمحامين وأسرهم', details: 'تعاقدات مع مستشفيات ومراكز طبية.', order: 1 },
      { title: 'الدعم القانوني', description: 'استشارات ودعم للزملاء المحامين', details: 'مكتبة قانونية وأحكام نقض.', order: 2 },
      { title: 'التدريب والتأهيل', description: 'ندوات ومحاضرات وورش عمل', details: 'برامج تدريبية مستمرة.', order: 3 },
    ]);
    console.log('🛠️  Services seeded');
  }

  // --- Offers ---
  if ((await Offer.countDocuments()) === 0) {
    await Offer.insertMany([
      { name: 'خصم على الكشف الطبي', description: 'خصم خاص للسادة المحامين', discount: '30%', expirationDate: new Date(Date.now() + 90 * 864e5) },
      { name: 'عرض المكتبة القانونية', description: 'خصم على شراء الكتب القانونية', discount: '20%', expirationDate: new Date(Date.now() + 60 * 864e5) },
    ]);
    console.log('🏷️  Offers seeded');
  }

  // --- Lectures ---
  if ((await Lecture.countDocuments()) === 0) {
    await Lecture.insertMany([
      { title: 'ندوة قانون المرافعات', description: 'شرح أحدث تعديلات قانون المرافعات', date: new Date() },
      { title: 'محاضرة الإجراءات الجنائية', description: 'تطبيقات عملية على الإجراءات الجنائية', date: new Date(Date.now() - 7 * 864e5) },
    ]);
    console.log('🎓 Lectures seeded');
  }

  // --- Contracts ---
  if ((await Contract.countDocuments()) === 0) {
    await Contract.insertMany([
      { organizationName: 'مستشفى القليوبية التخصصي', description: 'تعاقد طبي شامل', benefits: 'خصومات على الكشف والعمليات', contactInfo: '013-1111111', order: 1 },
      { organizationName: 'مكتبة القانون', description: 'تعاقد لتوفير الكتب القانونية', benefits: 'خصم 20% على جميع الإصدارات', contactInfo: '013-2222222', order: 2 },
    ]);
    console.log('🤝 Contracts seeded');
  }

  // --- Government links ---
  if ((await GovernmentLink.countDocuments()) === 0) {
    await GovernmentLink.insertMany([
      { name: 'بوابة مصر الرقمية', description: 'الخدمات الحكومية الرقمية', url: 'https://digital.gov.eg', order: 1 },
      { name: 'النيابة العامة', description: 'موقع النيابة العامة المصرية', url: 'https://www.ppo.gov.eg', order: 2 },
      { name: 'محكمة النقض', description: 'موقع محكمة النقض المصرية', url: 'https://www.cc.gov.eg', order: 3 },
      { name: 'مجلس الدولة', description: 'موقع مجلس الدولة المصري', url: 'https://www.coscoe.gov.eg', order: 4 },
      { name: 'الضرائب المصرية', description: 'مصلحة الضرائب المصرية', url: 'https://www.eta.gov.eg', order: 5 },
      { name: 'الشهر العقاري', description: 'مصلحة الشهر العقاري والتوثيق', url: 'https://www.moj.gov.eg', order: 6 },
      { name: 'الجوازات', description: 'مصلحة الجوازات والهجرة والجنسية', url: 'https://www.emigration.gov.eg', order: 7 },
    ]);
    console.log('🏛️  Government links seeded');
  }

  // --- Activities ---
  if ((await Activity.countDocuments()) === 0) {
    await Activity.insertMany([
      { title: 'رحلة العمرة السنوية', description: 'رحلة منظمة للسادة المحامين', date: new Date(), type: 'رحلات', gallery: [] },
      { title: 'حفل تكريم المتميزين', description: 'تكريم المحامين المتميزين', date: new Date(), type: 'اجتماعية', gallery: [] },
    ]);
    console.log('🎉 Activities seeded');
  }

  // --- Sample judgments (small sample; real dataset can be bulk-imported) ---
  if ((await Judgment.countDocuments()) === 0) {
    const sample = [];
    for (let i = 1; i <= 30; i++) {
      sample.push({
        title: `حكم نقض رقم ${i}`,
        appealNumber: `${1000 + i}`,
        year: 2015 + (i % 10),
        pdf: '/uploads/pdfs/judgments/sample.pdf',
        summary: 'مبدأ قانوني هام في هذا الحكم.',
      });
    }
    await Judgment.insertMany(sample);
    console.log('⚖️  Sample judgments seeded (30)');
  }

  // --- Courts ---
  if ((await Court.countDocuments()) === 0) {
    await Court.insertMany([
      {
        name: 'محكمة بنها الابتدائية',
        degree: 'ابتدائية',
        governorate: 'القليوبية',
        address: 'بنها - محافظة القليوبية',
        mapEmbed: 'https://www.google.com/maps?q=Benha+Court&output=embed',
        mapLink: 'https://maps.google.com/?q=Benha+Court',
        order: 1,
      },
      {
        name: 'محكمة استئناف طنطا - مأمورية بنها',
        degree: 'استئناف',
        governorate: 'القليوبية',
        address: 'بنها - محافظة القليوبية',
        mapEmbed: 'https://www.google.com/maps?q=Benha&output=embed',
        mapLink: 'https://maps.google.com/?q=Benha',
        order: 2,
      },
      {
        name: 'محكمة شبرا الخيمة الجزئية',
        degree: 'جزئية',
        governorate: 'القليوبية',
        address: 'شبرا الخيمة - محافظة القليوبية',
        mapEmbed: 'https://www.google.com/maps?q=Shubra+El+Kheima&output=embed',
        mapLink: 'https://maps.google.com/?q=Shubra+El+Kheima',
        order: 3,
      },
      {
        name: 'محكمة النقض',
        degree: 'النقض',
        governorate: 'القاهرة',
        address: 'دار القضاء العالي - وسط البلد - القاهرة',
        mapEmbed: 'https://www.google.com/maps?q=High+Court+Cairo&output=embed',
        mapLink: 'https://maps.google.com/?q=High+Court+Cairo',
        order: 4,
      },
    ]);
    console.log('🏛️  Courts seeded');
  }

  console.log('✅ Seeding complete');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
