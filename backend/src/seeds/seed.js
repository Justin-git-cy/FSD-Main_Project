/**
 * Database Seeder - populates MongoDB with initial ViewPoint data.
 *
 * Usage:  cd backend && npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { User, Category, Location, Review } = require('../models');

// ─── Seed Data ───────────────────────────────────────────────

const SEED_CATEGORIES = [
  { name: 'Trekking & Hills', slug: 'trekking', icon: 'Mountain' },
  { name: 'Abandoned & Ruins', slug: 'abandoned', icon: 'EyeOff' },
  { name: 'Historic Sights', slug: 'historic', icon: 'History' },
];

const SEED_USERS = [
  {
    username: 'rohan_trekker',
    fullName: 'Rohan Sharma',
    email: 'rohan@viewpoint.com',
    role: 'Pathfinder',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=rohan',
    bio: 'Avid weekend warrior. Love mapping lost ruins and granite monoliths around Bangalore.',
    theme: 'dark',
  },
  {
    username: 'neha_explores',
    fullName: 'Neha Reddy',
    email: 'neha@viewpoint.com',
    role: 'Explorer',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=neha',
    bio: 'Urban explorer, photographer, and history buff.',
    theme: 'dark',
  },
];

// Maps original categoryId slugs to category slugs for lookup
const SEED_LOCATIONS = [
  {
    name: 'Savandurga Monolith Trek',
    description: 'One of the largest monolith hills in Asia, rising 1226 meters above sea level. It comprises two hills: Karigudda (black hill) and Biligudda (white hill). The climb is steep and offers breathtaking views of the Arkavathi river basin.',
    categorySlug: 'trekking',
    difficulty: 'hard',
    lat: 12.9157, lng: 77.2936,
    rating: 4.8, verificationStatus: 'verified', upvotes: 89,
    images: [
      'https://images.unsplash.com/photo-1609137144814-7e3e4a9ba140?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    ],
    seasonalSuitability: { summer: 0.4, monsoon: 0.1, winter: 1.0 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'DANGEROUS: The steep granite surface becomes extremely slick and slippery.', sunny: 'CAUTION: Intense heat can heat up the rock surface. Carry at least 3 liters of water.' },
    createdByUsername: 'system',
  },
  {
    name: 'Skandagiri Night Trek',
    description: 'Also known as Kalavara Durga, this ancient hill fortress is famous for its night trekking and the majestic sunrise view above a bed of clouds.',
    categorySlug: 'trekking',
    difficulty: 'medium',
    lat: 13.4178, lng: 77.6822,
    rating: 4.9, verificationStatus: 'verified', upvotes: 145,
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    ],
    seasonalSuitability: { summer: 0.6, monsoon: 0.4, winter: 1.0 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'WARNING: Trail gets muddy and slippery.', misty: 'ADVISORY: Beautiful cloud bed, but navigate carefully.' },
    createdByUsername: 'system',
  },
  {
    name: 'Makalidurga Railway Trek',
    description: 'A unique trek that starts with a walk along a railway track before ascending a rocky hill to the ruins of a fort.',
    categorySlug: 'trekking',
    difficulty: 'medium',
    lat: 13.4289, lng: 77.5028,
    rating: 4.6, verificationStatus: 'verified', upvotes: 76,
    images: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.5, monsoon: 0.7, winter: 0.9 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'CAUTION: Active railway crossings can be dangerous in low visibility.' },
    createdByUsername: 'system',
  },
  {
    name: 'Turahalli Forest Bouldering',
    description: 'The last surviving forest reserve in Bangalore, popular hub for cyclists, trail runners, and rock climbers.',
    categorySlug: 'trekking',
    difficulty: 'easy',
    lat: 12.8732, lng: 77.5342,
    rating: 4.4, verificationStatus: 'verified', upvotes: 92,
    images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.7, monsoon: 0.8, winter: 1.0 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'CAUTION: Avoid bouldering on wet rocks. Beware of mosquitoes.' },
    createdByUsername: 'system',
  },
  {
    name: 'Devarayanadurga Hill Fort',
    description: 'A hill station situated near Tumkur, surrounded by forests and hilltops with two ancient temples.',
    categorySlug: 'trekking',
    difficulty: 'easy',
    lat: 13.3745, lng: 77.2145,
    rating: 4.5, verificationStatus: 'verified', upvotes: 63,
    images: ['https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.6, monsoon: 0.7, winter: 0.9 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'WARNING: Heavy monkey activity near the summit temple.' },
    createdByUsername: 'system',
  },
  {
    name: 'Madhugiri Monolith Fortress',
    description: 'The second largest monolith in Asia. Climb to the fort at the peak is challenging with steep 60-70 degree inclination.',
    categorySlug: 'trekking',
    difficulty: 'hard',
    lat: 13.6631, lng: 77.2089,
    rating: 4.7, verificationStatus: 'verified', upvotes: 110,
    images: ['https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.3, monsoon: 0.0, winter: 1.0 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'CRITICAL WARNING: Granite dome becomes vertical water slide.', sunny: 'CAUTION: Severe dehydration risk.' },
    createdByUsername: 'system',
  },
  {
    name: 'Uttari Betta Sunrise Trek',
    description: 'Also known as Hutridurga, this trek takes you through a fort wall and seven stone gateways.',
    categorySlug: 'trekking',
    difficulty: 'medium',
    lat: 12.9645, lng: 77.1089,
    rating: 4.7, verificationStatus: 'verified', upvotes: 94,
    images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.6, monsoon: 0.5, winter: 1.0 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'CAUTION: Dirt sections turn into clay mud.' },
    createdByUsername: 'system',
  },
  {
    name: 'Kabbaladurga Night Trek',
    description: 'A massive monolithic rock rising above the surrounding flatlands, containing ruins of a fort.',
    categorySlug: 'trekking',
    difficulty: 'hard',
    lat: 12.5023, lng: 77.2989,
    rating: 4.5, verificationStatus: 'verified', upvotes: 68,
    images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.4, monsoon: 0.1, winter: 0.9 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'DANGEROUS: The steep smooth rock becomes a dangerous slide when wet.' },
    createdByUsername: 'system',
  },
  {
    name: 'Channarayanadurga Fort Climb',
    description: 'A hidden fort located near Madhugiri. Non-touristy, wild trek through three stages of fort walls.',
    categorySlug: 'trekking',
    difficulty: 'hard',
    lat: 13.5684, lng: 77.2145,
    rating: 4.3, verificationStatus: 'verified', upvotes: 41,
    images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.5, monsoon: 0.2, winter: 0.9 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'WARNING: Extreme risk of slipping on bare granite slopes.' },
    createdByUsername: 'system',
  },
  // Abandoned
  {
    name: 'Abandoned Clay Factory Ruins',
    description: 'Crumbling red-brick chimneys and collapsed ceilings from a tile and clay factory from the late 70s.',
    categorySlug: 'abandoned',
    difficulty: 'medium',
    lat: 12.9912, lng: 77.7121,
    rating: 4.2, verificationStatus: 'verified', upvotes: 54,
    images: [
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    seasonalSuitability: { summer: 0.8, monsoon: 0.3, winter: 0.9 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'DANGEROUS: Slippery moss covers the broken brick paths.' },
    createdByUsername: 'system',
  },
  {
    name: 'Abandoned Railway Depot Shed',
    description: 'Rusty yard off the main tracks containing decommissioned train coaches, rusted steam boilers.',
    categorySlug: 'abandoned',
    difficulty: 'easy',
    lat: 13.0234, lng: 77.5489,
    rating: 4.0, verificationStatus: 'verified', upvotes: 48,
    images: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.9, monsoon: 0.5, winter: 0.9 },
    bestSeason: 'Summer',
    weatherWarnings: { rainy: 'CAUTION: Flooding in low-lying rail ditches.' },
    createdByUsername: 'system',
  },
  {
    name: 'Bagalur Blue Quarry Lake',
    description: 'Abandoned stone quarry filled with rainwater forming a deep blue lake enclosed by granite cliffs.',
    categorySlug: 'abandoned',
    difficulty: 'hard',
    lat: 13.1256, lng: 77.6712,
    rating: 4.3, verificationStatus: 'verified', upvotes: 95,
    images: ['https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.6, monsoon: 0.2, winter: 0.8 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'WARNING: Soil erosion around cliff edges.', sunny: 'CAUTION: No shade available.' },
    createdByUsername: 'system',
  },
  {
    name: 'Kaggalipura Brick Kiln Ruins',
    description: 'Group of abandoned cylindrical brick kilns with high soot-blackened chimneys.',
    categorySlug: 'abandoned',
    difficulty: 'easy',
    lat: 12.8021, lng: 77.5198,
    rating: 3.9, verificationStatus: 'verified', upvotes: 31,
    images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.8, monsoon: 0.4, winter: 0.9 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'CAUTION: Floors are muddy and clay-like.' },
    createdByUsername: 'system',
  },
  {
    name: 'Rajanukunte Haunted Villa Ruins',
    description: 'Skeleton of an unfinished grand villa from the late 90s. Banyan roots cracked the concrete pillars.',
    categorySlug: 'abandoned',
    difficulty: 'medium',
    lat: 13.1894, lng: 77.5891,
    rating: 4.1, verificationStatus: 'verified', upvotes: 82,
    images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.9, monsoon: 0.4, winter: 0.9 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'WARNING: Pooling water breeds mosquitoes.' },
    createdByUsername: 'system',
  },
  // Historic
  {
    name: 'Devanahalli Mud Fort Ruins',
    description: 'Originally built in 1501, later rebuilt by Hyder Ali and Tipu Sultan. Fort walls extend over a mile.',
    categorySlug: 'historic',
    difficulty: 'easy',
    lat: 13.2483, lng: 77.7128,
    rating: 4.5, verificationStatus: 'verified', upvotes: 114,
    images: ['https://images.unsplash.com/photo-1599849594747-479322141980?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.7, monsoon: 0.8, winter: 1.0 },
    bestSeason: 'Winter',
    weatherWarnings: { sunny: 'ADVISORY: Little tree cover along the walls.', rainy: 'CAUTION: Flagstone walking paths get slippery.' },
    createdByUsername: 'system',
  },
  {
    name: 'Begur Chola Mud Fort',
    description: 'Ancient, small circular mud fort believed to be over 1100 years old.',
    categorySlug: 'historic',
    difficulty: 'easy',
    lat: 12.8761, lng: 77.6258,
    rating: 4.1, verificationStatus: 'verified', upvotes: 38,
    images: ['https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.8, monsoon: 0.6, winter: 0.9 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'CAUTION: Mud paths turn to sticky clay.' },
    createdByUsername: 'system',
  },
  {
    name: 'Bhoga Nandeeshwara Temple Complex',
    description: 'Spectacular 9th-century Hindu temple complex at the base of Nandi Hills with beautiful stepwell.',
    categorySlug: 'historic',
    difficulty: 'easy',
    lat: 13.3857, lng: 77.7011,
    rating: 4.9, verificationStatus: 'verified', upvotes: 210,
    images: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    ],
    seasonalSuitability: { summer: 0.8, monsoon: 0.9, winter: 1.0 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'ADVISORY: The stepwell is full but steps are slippery.' },
    createdByUsername: 'system',
  },
  {
    name: 'Gavi Gangadhareshwara Cave Temple',
    description: 'Masterclass in ancient rock-cut architecture, a 9th century cave temple dedicated to Lord Shiva.',
    categorySlug: 'historic',
    difficulty: 'easy',
    lat: 12.9512, lng: 77.5639,
    rating: 4.7, verificationStatus: 'verified', upvotes: 67,
    images: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 1.0, monsoon: 0.8, winter: 0.9 },
    bestSeason: 'Summer',
    weatherWarnings: { rainy: 'CAUTION: The courtyard gathers water.' },
    createdByUsername: 'system',
  },
  // Pending (community submissions)
  {
    name: 'Kanakapura Abandoned Clay Mines',
    description: 'Huge cavernous clay extraction pit off Kanakapura road. Mini grand canyon with turquoise pond.',
    categorySlug: 'abandoned',
    difficulty: 'hard',
    lat: 12.6512, lng: 77.4421,
    rating: 4.4, verificationStatus: 'pending', upvotes: 12,
    images: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.7, monsoon: 0.1, winter: 0.9 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'CRITICAL: High risk of landslides along the excavation terraces.' },
    createdByUsername: 'neha_explores',
  },
  {
    name: 'Solur Hidden British Cemetery Ruins',
    description: 'Small, overgrown cemetery dating back to 1845 with stone obelisks and gothic inscriptions.',
    categorySlug: 'historic',
    difficulty: 'easy',
    lat: 13.0189, lng: 77.2145,
    rating: 4.0, verificationStatus: 'pending', upvotes: 5,
    images: ['https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80'],
    seasonalSuitability: { summer: 0.8, monsoon: 0.5, winter: 0.9 },
    bestSeason: 'Winter',
    weatherWarnings: { rainy: 'CAUTION: Extremely high snake presence during monsoons.' },
    createdByUsername: 'rohan_trekker',
  },
];

const SEED_REVIEWS = [
  {
    locationName: 'Savandurga Monolith Trek',
    username: 'rohan_trekker',
    rating: 5,
    comment: 'Absolute monster of a climb! The winter morning breeze made it perfect. Make sure to wear high-grip shoes!',
  },
  {
    locationName: 'Savandurga Monolith Trek',
    username: 'neha_explores',
    rating: 4,
    comment: 'Beautiful view, but please do not climb during rainy days. Winter is the best.',
  },
  {
    locationName: 'Abandoned Clay Factory Ruins',
    username: 'neha_explores',
    rating: 5,
    comment: 'This place is a dream for industrial decay photography. Found old factory ledger books in one of the back rooms.',
  },
  {
    locationName: 'Bhoga Nandeeshwara Temple Complex',
    username: 'rohan_trekker',
    rating: 5,
    comment: 'The architectural precision here is outstanding. The Kalyani stepwell is a perfect place to sit and reflect.',
  },
];

// ─── Seed Runner ─────────────────────────────────────────────

const seed = async () => {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Location.deleteMany({}),
      Review.deleteMany({}),
    ]);

    // 1. Seed Users
    console.log('👤 Seeding users...');
    const createdUsers = await User.insertMany(SEED_USERS);
    const userMap = {};
    createdUsers.forEach((u) => (userMap[u.username] = u._id));
    console.log(`   ✅ ${createdUsers.length} users created`);

    // 2. Seed Categories
    console.log('📂 Seeding categories...');
    const createdCategories = await Category.insertMany(SEED_CATEGORIES);
    const catMap = {};
    createdCategories.forEach((c) => (catMap[c.slug] = c._id));
    console.log(`   ✅ ${createdCategories.length} categories created`);

    // 3. Seed Locations
    console.log('📍 Seeding locations...');
    const locationDocs = SEED_LOCATIONS.map((loc) => ({
      name: loc.name,
      description: loc.description,
      category: catMap[loc.categorySlug],
      difficulty: loc.difficulty,
      lat: loc.lat,
      lng: loc.lng,
      rating: loc.rating,
      verificationStatus: loc.verificationStatus,
      upvotes: loc.upvotes,
      images: loc.images,
      seasonalSuitability: loc.seasonalSuitability,
      bestSeason: loc.bestSeason,
      weatherWarnings: loc.weatherWarnings,
      createdBy:
        loc.createdByUsername === 'system'
          ? userMap['rohan_trekker'] // system locations attributed to Rohan
          : userMap[loc.createdByUsername],
    }));
    const createdLocations = await Location.insertMany(locationDocs);
    const locMap = {};
    createdLocations.forEach((l) => (locMap[l.name] = l._id));
    console.log(`   ✅ ${createdLocations.length} locations created`);

    // 4. Seed Reviews
    console.log('⭐ Seeding reviews...');
    const reviewDocs = SEED_REVIEWS.map((rev) => ({
      location: locMap[rev.locationName],
      user: userMap[rev.username],
      rating: rev.rating,
      comment: rev.comment,
    }));
    const createdReviews = await Review.insertMany(reviewDocs);
    console.log(`   ✅ ${createdReviews.length} reviews created`);

    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seed();

