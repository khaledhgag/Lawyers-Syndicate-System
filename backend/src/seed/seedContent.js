import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Service from '../models/Service.js';
import Settings from '../models/Settings.js';

// الخدمات المستخلصة من "ما الذي تقدمه النقابة؟"
const services = [
  {
    title: 'الخدمات النقابية والإدارية',
    description: 'تقديم كافة الخدمات النقابية والإدارية للسادة المحامين وتيسير إنجاز أعمالهم.',
    details:
      'تعمل النقابة على تبسيط الإجراءات وتقديم الخدمات النقابية والإدارية للسادة المحامين بما يوفّر عليهم الوقت والجهد، ويعينهم على أداء رسالتهم في تحقيق العدالة.',
    order: 1,
  },
  {
    title: 'دعم الحقوق المهنية',
    description: 'دعم الحقوق المهنية للمحامين والعمل المستمر على تذليل المعوقات التي تواجههم.',
    details:
      'تتبنى النقابة قضايا الزملاء وتدافع عن حقوقهم المهنية أمام الجهات المختلفة، وتسعى لتذليل العقبات التي تعترض ممارستهم لمهنة المحاماة داخل المجتمع القانوني.',
    order: 2,
  },
  {
    title: 'تعزيز التواصل النقابي',
    description: 'خلق قنوات تواصل مستمرة بين أعضاء الجمعية العمومية ومجلس النقابة.',
    details:
      'نحرص على الاستماع الجيد لاحتياجات الزملاء عبر قنوات تواصل فعّالة ومباشرة مع مجلس النقابة، بما يعزز روح الانتماء والعمل المشترك.',
    order: 3,
  },
  {
    title: 'رعاية الشباب وتأهيل الكوادر',
    description: 'الاهتمام بشباب المحامين وتأهيل الكوادر القانونية الجديدة.',
    details:
      'برامج تدريب وتأهيل مهني لشباب المحامين ترفع من كفاءتهم وتصقل مهاراتهم القانونية، وتؤهلهم لسوق العمل ومباشرة أعمال المحاماة بثقة.',
    order: 4,
  },
  {
    title: 'دعم الأنشطة والمبادرات',
    description: 'دعم المبادرات والأنشطة المهنية والاجتماعية للسادة المحامين.',
    details:
      'تشجّع النقابة المبادرات وتنظّم الأنشطة المهنية والاجتماعية والرحلات التي تقوّي الروابط بين الزملاء وتعزّز الحياة النقابية.',
    order: 5,
  },
  {
    title: 'التحول الرقمي وخدمات المحامين',
    description: 'تطوير الوسائل التقنية والخدمات الرقمية لخدمة المحامين.',
    details:
      'نعمل على تطوير منظومة الخدمات الرقمية — من قاعدة أحكام النقض والعروض الحصرية والتعاقدات إلى الاستعلامات والشكاوى — لتيسير الوصول للخدمات إلكترونياً.',
    order: 6,
  },
];

const aboutText =
  'تُعد نقابة محامين جنوب القليوبية إحدى المؤسسات النقابية التي تعمل على خدمة السادة المحامين وتمثيلهم ودعم رسالتهم، ' +
  'باعتبار المحاماة شريكًا أساسيًا في تحقيق العدالة وسيادة القانون. وتسعى النقابة إلى تطوير منظومة العمل النقابي من خلال ' +
  'تقديم خدمات مهنية وإدارية تسهّل على المحامين أداء أعمالهم، ومتابعة احتياجات الزملاء والتفاعل مع التحديات التي تواجههم ' +
  'داخل المجتمع القانوني. معًا من أجل محامٍ أقوى… ونقابة أكثر تطورًا.';

const run = async () => {
  await connectDB();

  // Upsert services by title (no duplicates, keeps others you added)
  const ops = services.map((s) => ({
    updateOne: { filter: { title: s.title }, update: { $set: { ...s, isActive: true } }, upsert: true },
  }));
  const res = await Service.bulkWrite(ops);
  console.log(`🛠️  Services — inserted: ${res.upsertedCount}, updated: ${res.modifiedCount}`);

  // Update About text/title
  const settings = await Settings.getSingleton();
  settings.aboutTitle = 'عن النقابة';
  settings.aboutText = aboutText;
  await settings.save();
  console.log('⚙️  About section updated');

  console.log('✅ Content seeding complete');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((e) => {
  console.error('Seed content error:', e);
  process.exit(1);
});
