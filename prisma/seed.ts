import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Начало заполнения базы данных...')

  // Создаём настройки сайта
  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      siteName: 'Imbrand',
      contactEmail: 'info@imbrand.ru',
      contactPhone: '+7 (999) 123-45-67',
      contactAddress: 'г. Москва, ул. Примерная, д. 1',
      instagramUrl: 'https://instagram.com/imbrand',
      telegramUrl: 'https://t.me/imbrand',
      metaTitle: 'Imbrand — Премиальная женская одежда',
      metaDescription: 'Интернет-магазин премиальной женской одежды. Стиль, качество, элегантность.',
      deliveryInfo: 'Бесплатная доставка при заказе от 10 000 ₽. Доставка по всей России.',
    },
  })

  console.log('✓ Настройки сайта созданы')

  // Создаём администратора
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@imbrand.ru' },
    update: {},
    create: {
      email: 'admin@imbrand.ru',
      name: 'Администратор',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('✓ Администратор создан (admin@imbrand.ru / admin123)')

  // Создаём категории
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'platya' },
      update: {},
      create: {
        name: 'Платья',
        slug: 'platya',
        description: 'Элегантные платья на любой случай',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'bluzy' },
      update: {},
      create: {
        name: 'Блузы',
        slug: 'bluzy',
        description: 'Стильные блузы и рубашки',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'yubki' },
      update: {},
      create: {
        name: 'Юбки',
        slug: 'yubki',
        description: 'Юбки различных фасонов',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'bryuki' },
      update: {},
      create: {
        name: 'Брюки',
        slug: 'bryuki',
        description: 'Брюки и джинсы',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'verhnyaya-odezhda' },
      update: {},
      create: {
        name: 'Верхняя одежда',
        slug: 'verhnyaya-odezhda',
        description: 'Пальто, пиджаки, куртки',
      },
    }),
  ])

  console.log('✓ Категории созданы')

  // Создаём примеры товаров
  const products = [
    {
      name: 'Платье миди с V-образным вырезом',
      slug: 'plate-midi-v-vyrez',
      description: 'Элегантное платье миди из плотного трикотажа. Идеально подходит для офиса и вечерних мероприятий. Мягкая ткань приятно прилегает к телу, подчёркивая силуэт.',
      price: 7990,
      oldPrice: 9990,
      categoryId: categories[0].id,
      isActive: true,
      isFeatured: true,
      variants: [
        { size: 'S', color: 'Черный', stock: 5 },
        { size: 'M', color: 'Черный', stock: 8 },
        { size: 'L', color: 'Черный', stock: 3 },
        { size: 'S', color: 'Бежевый', stock: 4 },
        { size: 'M', color: 'Бежевый', stock: 6 },
      ],
    },
    {
      name: 'Шёлковая блуза с бантом',
      slug: 'shelkovaya-bluza-bant',
      description: 'Изысканная блуза из натурального шёлка. Классический крой с бантом на вороте. Идеальный выбор для создания женственного образа.',
      price: 5490,
      categoryId: categories[1].id,
      isActive: true,
      isFeatured: true,
      variants: [
        { size: 'XS', color: 'Белый', stock: 3 },
        { size: 'S', color: 'Белый', stock: 7 },
        { size: 'M', color: 'Белый', stock: 5 },
        { size: 'S', color: 'Пудровый', stock: 4 },
        { size: 'M', color: 'Пудровый', stock: 6 },
      ],
    },
    {
      name: 'Юбка-карандаш классическая',
      slug: 'yubka-karandash',
      description: 'Классическая юбка-карандаш длиной до колена. Высокая посадка, молния сзади. Незаменимая вещь в гардеробе деловой женщины.',
      price: 3990,
      categoryId: categories[2].id,
      isActive: true,
      variants: [
        { size: 'S', color: 'Черный', stock: 10 },
        { size: 'M', color: 'Черный', stock: 12 },
        { size: 'L', color: 'Черный', stock: 8 },
        { size: 'XL', color: 'Черный', stock: 5 },
      ],
    },
    {
      name: 'Брюки палаццо',
      slug: 'bryuki-palacco',
      description: 'Стильные брюки палаццо с высокой посадкой. Широкие штанины создают эффект удлинённых ног. Комфортная посадка и элегантный вид.',
      price: 4990,
      categoryId: categories[3].id,
      isActive: true,
      isFeatured: true,
      variants: [
        { size: 'S', color: 'Серый', stock: 6 },
        { size: 'M', color: 'Серый', stock: 9 },
        { size: 'L', color: 'Серый', stock: 4 },
        { size: 'M', color: 'Черный', stock: 7 },
        { size: 'L', color: 'Черный', stock: 5 },
      ],
    },
    {
      name: 'Пальто оверсайз',
      slug: 'palto-oversajz',
      description: 'Трендовое пальто свободного кроя. Качественная шерстяная ткань, подкладка из вискозы. Актуальный силуэт и нейтральный цвет.',
      price: 15990,
      oldPrice: 19990,
      categoryId: categories[4].id,
      isActive: true,
      isFeatured: true,
      variants: [
        { size: 'S', color: 'Кэмел', stock: 3 },
        { size: 'M', color: 'Кэмел', stock: 5 },
        { size: 'L', color: 'Кэмел', stock: 2 },
        { size: 'M', color: 'Серый', stock: 4 },
      ],
    },
    {
      name: 'Платье макси с разрезом',
      slug: 'plate-maksi-razrez',
      description: 'Роскошное вечернее платье в пол с высоким разрезом. Облегающий силуэт, бретели-спагетти. Идеально для особых случаев.',
      price: 12990,
      categoryId: categories[0].id,
      isActive: true,
      variants: [
        { size: 'XS', color: 'Изумрудный', stock: 2 },
        { size: 'S', color: 'Изумрудный', stock: 4 },
        { size: 'M', color: 'Изумрудный', stock: 3 },
        { size: 'S', color: 'Бордовый', stock: 3 },
        { size: 'M', color: 'Бордовый', stock: 5 },
      ],
    },
  ]

  for (const productData of products) {
    const { variants, ...product } = productData

    const createdProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })

    // Удаляем старые варианты и создаём новые
    await prisma.productVariant.deleteMany({
      where: { productId: createdProduct.id },
    })

    await prisma.productVariant.createMany({
      data: variants.map((v) => ({
        ...v,
        productId: createdProduct.id,
      })),
    })
  }

  console.log('✓ Товары созданы')

  console.log('\n✅ База данных успешно заполнена!')
  console.log('\n📋 Данные для входа в админ-панель:')
  console.log('   Email: admin@imbrand.ru')
  console.log('   Пароль: admin123')
}

main()
  .catch((e) => {
    console.error('Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
