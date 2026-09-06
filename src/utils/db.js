export const INITIAL_CATEGORIES = [
  { id: 'cat_trekking', name: 'Trekking & Hills', slug: 'trekking', icon: 'Mountain' },
  { id: 'cat_abandoned', name: 'Abandoned & Ruins', slug: 'abandoned', icon: 'EyeOff' },
  { id: 'cat_historic', name: 'Historic Sights', slug: 'historic', icon: 'History' }
];

export const INITIAL_LOCATIONS = [
  {
    id: 'loc_savandurga',
    name: 'Savandurga Monolith Trek',
    description: 'One of the largest monolith hills in Asia, rising 1226 meters above sea level. It comprises two hills: Karigudda (black hill) and Biligudda (white hill). The climb is steep and offers breathtaking views of the Arkavathi river basin.',
    categoryId: 'cat_trekking',
    difficulty: 'hard',
    lat: 12.9157,
    lng: 77.2936,
    rating: 4.8,
    verificationStatus: 'verified',
    upvotes: 89,
    images: [
      'https://images.unsplash.com/photo-1609137144814-7e3e4a9ba140?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.4,
      monsoon: 0.1, // Dangerous slip warning!
      winter: 1.0
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'DANGEROUS: The steep granite surface becomes extremely slick and slippery. Trekking is strongly discouraged during downpours.',
      sunny: 'CAUTION: Intense heat can heat up the rock surface. Carry at least 3 liters of water.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_skandagiri',
    name: 'Skandagiri Night Trek',
    description: 'Also known as Kalavara Durga, this ancient hill fortress is famous for its night trekking and the majestic sunrise view above a bed of clouds. It features ruins of a fort built by Tipu Sultan.',
    categoryId: 'cat_trekking',
    difficulty: 'medium',
    lat: 13.4178,
    lng: 77.6822,
    rating: 4.9,
    verificationStatus: 'verified',
    upvotes: 145,
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.6,
      monsoon: 0.4,
      winter: 1.0
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'WARNING: Trail gets muddy and slippery. Reduced visibility at night due to dense fog.',
      misty: 'ADVISORY: Beautiful cloud bed, but navigate carefully as trail markings are harder to spot.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_makalidurga',
    name: 'Makalidurga Railway Trek',
    description: 'A unique trek that starts with a walk along a railway track before ascending a rocky hill to the ruins of a fort. The trail winds through granite boulders and wild shrubs, overlooking a lake shaped like South America.',
    categoryId: 'cat_trekking',
    difficulty: 'medium',
    lat: 13.4289,
    lng: 77.5028,
    rating: 4.6,
    verificationStatus: 'verified',
    upvotes: 76,
    images: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.5,
      monsoon: 0.7, // Beautiful lush greenery!
      winter: 0.9
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'CAUTION: Active railway crossings can be dangerous in low visibility. Granite steps at the top are slippery.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_turahalli',
    name: 'Turahalli Forest Bouldering',
    description: 'The last surviving forest reserve in Bangalore, Turahalli is a popular hub for cyclists, trail runners, and rock climbers. The hillock is dotted with massive granite boulders, offering scenic vistas of South Bangalore.',
    categoryId: 'cat_trekking',
    difficulty: 'easy',
    lat: 12.8732,
    lng: 77.5342,
    rating: 4.4,
    verificationStatus: 'verified',
    upvotes: 92,
    images: [
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.7,
      monsoon: 0.8,
      winter: 1.0
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'CAUTION: Avoid bouldering on wet rocks. Beware of mosquitoes.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_devarayanadurga',
    name: 'Devarayanadurga Hill Fort',
    description: 'A hill station situated near Tumkur, surrounded by forests and hilltops. It features two ancient temples: Bhoga Narasimha at the base and Yoga Narasimha at the summit. The ruins of a historic fort surround the peak.',
    categoryId: 'cat_trekking',
    difficulty: 'easy',
    lat: 13.3745,
    lng: 77.2145,
    rating: 4.5,
    verificationStatus: 'verified',
    upvotes: 63,
    images: [
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.6,
      monsoon: 0.7,
      winter: 0.9
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'WARNING: Heavy monkey activity near the summit temple; watch your belongings.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_madhugiri',
    name: 'Madhugiri Monolith Fortress',
    description: 'The second largest monolith in Asia. The climb to the fort at the peak is challenging due to the steep inclination (almost 60-70 degrees in some patches) and is aided by iron railings. Features ruins of a series of arches and granaries.',
    categoryId: 'cat_trekking',
    difficulty: 'hard',
    lat: 13.6631,
    lng: 77.2089,
    rating: 4.7,
    verificationStatus: 'verified',
    upvotes: 110,
    images: [
      'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.3, // Extremely hot granite
      monsoon: 0.0, // Strictly closed/highly dangerous during rains
      winter: 1.0
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'CRITICAL WARNING: Granite dome becomes vertical water slide. Trekking is banned by local authorities during heavy rain.',
      sunny: 'CAUTION: Severe dehydration risk. The bare rock radiates intense heat. Climb early morning.'
    },
    createdBy: 'system'
  },
  /* Day 2 Additions: New Trekking Sites */
  {
    id: 'loc_uttari_betta',
    name: 'Uttari Betta Sunrise Trek',
    description: 'Also known as Hutridurga, this trek takes you through a fort wall, seven stone gateways, and lush green vegetation to the top of a hill offering a panoramic view of the plains below. Ideal for viewing sunrises above the early morning mist.',
    categoryId: 'cat_trekking',
    difficulty: 'medium',
    lat: 12.9645,
    lng: 77.1089,
    rating: 4.7,
    verificationStatus: 'verified',
    upvotes: 94,
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.6,
      monsoon: 0.5,
      winter: 1.0
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'CAUTION: Dirt sections turn into clay mud. Rock steps inside gateways are slippery when wet.',
      misty: 'ADVISORY: Extremely foggy sunrise; stay on marked paths to avoid cliff edges.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_kabbaladurga',
    name: 'Kabbaladurga Night Trek',
    description: 'A massive monolithic rock rising above the surrounding flatlands, containing ruins of a fort. A challenging steep climb with no railings in many parts, making it a highly popular night trek for weekend adventurers.',
    categoryId: 'cat_trekking',
    difficulty: 'hard',
    lat: 12.5023,
    lng: 77.2989,
    rating: 4.5,
    verificationStatus: 'verified',
    upvotes: 68,
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.4,
      monsoon: 0.1,
      winter: 0.9
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'DANGEROUS: The steep smooth rock becomes a dangerous slide when wet. Night climb is cancelled during rains.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_channarayanadurga',
    name: 'Channarayanadurga Fort Climb',
    description: 'A hidden fort located near Madhugiri. This is a non-touristy, wild trek that goes through three stages of fort walls built by local Maratha rulers. The trail is semi-marked and requires scaling bare granite slabs.',
    categoryId: 'cat_trekking',
    difficulty: 'hard',
    lat: 13.5684,
    lng: 77.2145,
    rating: 4.3,
    verificationStatus: 'verified',
    upvotes: 41,
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.5,
      monsoon: 0.2,
      winter: 0.9
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'WARNING: Extreme risk of slipping on bare granite slopes. No tree cover from heavy winds and rain.'
    },
    createdBy: 'system'
  },
  /* End of New Trekking Sites */
  {
    id: 'loc_hoodi_factory',
    name: 'Abandoned Clay Factory Ruins',
    description: 'Tucked away near the industrial zone of Hoodi/Mahadevapura, these crumbling red-brick chimneys and collapsed ceilings belong to a tile and clay factory from the late 70s. Nature has fully reclaimed the machinery yards, creating an eerie, post-apocalyptic atmosphere.',
    categoryId: 'cat_abandoned',
    difficulty: 'medium',
    lat: 12.9912,
    lng: 77.7121,
    rating: 4.2,
    verificationStatus: 'verified',
    upvotes: 54,
    images: [
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.8,
      monsoon: 0.3, // Risk of structural collapse/slipping on moss
      winter: 0.9
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'DANGEROUS: Slippery moss covers the broken brick paths. Old masonry roofs may leak or collapse under heavy water weight.',
      overcast: 'ADVISORY: Perfect lighting for urban exploration photography, but watch your step.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_yeshwanthpur_depot',
    name: 'Abandoned Railway Depot Shed',
    description: 'A rusty yard off the main tracks containing decommissioned train coaches, rusted steam boilers, and skeletal iron sheds. It is a quiet oasis of industrial decay covered in creepers and wild morning glory flowers.',
    categoryId: 'cat_abandoned',
    difficulty: 'easy',
    lat: 13.0234,
    lng: 77.5489,
    rating: 4.0,
    verificationStatus: 'verified',
    upvotes: 48,
    images: [
      'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.9,
      monsoon: 0.5,
      winter: 0.9
    },
    bestSeason: 'Summer',
    weatherWarnings: {
      rainy: 'CAUTION: Flooding in low-lying rail ditches. Snakes and insects take shelter inside the open train coaches.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_bagalur_quarry',
    name: 'Bagalur Blue Quarry Lake',
    description: 'An abandoned stone quarry that has filled with rainwater over decades, forming a deep blue lake enclosed by sheer granite cliffs. While visually stunning, the water contains hidden currents, toxic minerals, and deep drop-offs.',
    categoryId: 'cat_abandoned',
    difficulty: 'hard',
    lat: 13.1256,
    lng: 77.6712,
    rating: 4.3,
    verificationStatus: 'verified',
    upvotes: 95,
    images: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.6,
      monsoon: 0.2, // Flooding/muddy shores
      winter: 0.8
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'WARNING: Soil erosion around cliff edges. Swimming is strictly prohibited due to toxic run-offs and 80-foot depths.',
      sunny: 'CAUTION: No shade available. Stay back from crumbling rock edges.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_kaggalipura_kilns',
    name: 'Kaggalipura Brick Kiln Ruins',
    description: 'A group of abandoned cylindrical brick kilns with high soot-blackened chimneys, dating back to the mid-20th century. Walk through overgrown weeds to explore the vaulted arched ovens where bricks were once baked.',
    categoryId: 'cat_abandoned',
    difficulty: 'easy',
    lat: 12.8021,
    lng: 77.5198,
    rating: 3.9,
    verificationStatus: 'verified',
    upvotes: 31,
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.8,
      monsoon: 0.4,
      winter: 0.9
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'CAUTION: Floors are muddy and clay-like. Watch for structural integrity of the old kiln doors.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_rajanukunte_mansion',
    name: 'Rajanukunte Haunted Villa Ruins',
    description: 'The skeleton of an unfinished, grand architectural villa from the late 90s. Spreading banyan tree roots have cracked the concrete pillars, and graffiti covers the walls. Highly popular among local urban explorers and ghost hunters.',
    categoryId: 'cat_abandoned',
    difficulty: 'medium',
    lat: 13.1894,
    lng: 77.5891,
    rating: 4.1,
    verificationStatus: 'verified',
    upvotes: 82,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.9,
      monsoon: 0.4,
      winter: 0.9
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'WARNING: Pooling water breeds mosquitoes. Watch out for open electrical conduits and rusty rebar on the floor.',
      misty: 'ADVISORY: Extremely spooky atmosphere, perfect for photography, but bring a flashlight.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_devanahalli_fort',
    name: 'Devanahalli Mud Fort Ruins',
    description: 'Originally built in 1501 by Mallabairegowda, this fort was later rebuilt in stone by Hyder Ali and Tipu Sultan. The fort walls extend over a mile with semi-circular bastions and a walkable pathway on top, offering views of the surrounding countryside.',
    categoryId: 'cat_historic',
    difficulty: 'easy',
    lat: 13.2483,
    lng: 77.7128,
    rating: 4.5,
    verificationStatus: 'verified',
    upvotes: 114,
    images: [
      'https://images.unsplash.com/photo-1599849594747-479322141980?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.7,
      monsoon: 0.8,
      winter: 1.0
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      sunny: 'ADVISORY: Little tree cover along the walls. Apply sun protection.',
      rainy: 'CAUTION: The flagstone walking paths along the ramparts can get slippery.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_begur_fort',
    name: 'Begur Chola Mud Fort',
    description: 'An ancient, small circular mud fort in the heart of Begur. It is believed to be over 1100 years old, housing a small temple and surrounded by a fast-encroaching urban landscape. A hidden gem of historical Bangalore.',
    categoryId: 'cat_historic',
    difficulty: 'easy',
    lat: 12.8761,
    lng: 77.6258,
    rating: 4.1,
    verificationStatus: 'verified',
    upvotes: 38,
    images: [
      'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.8,
      monsoon: 0.6,
      winter: 0.9
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'CAUTION: Mud paths turn to sticky clay. Access might be restricted.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_bhoga_nandeeshwara',
    name: 'Bhoga Nandeeshwara Temple Complex',
    description: 'A spectacular 9th-century Hindu temple complex located at the base of Nandi Hills. It is one of the oldest temples in Karnataka, exhibiting architectural styles from the Nolamba, Ganga, Chola, Hoysala, and Vijayanagara dynasties. Features a beautiful stepwell (Kalyani).',
    categoryId: 'cat_historic',
    difficulty: 'easy',
    lat: 13.3857,
    lng: 77.7011,
    rating: 4.9,
    verificationStatus: 'verified',
    upvotes: 210,
    images: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.8,
      monsoon: 0.9, // The stepwell fills up beautifully during monsoon!
      winter: 1.0
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'ADVISORY: The stepwell (Kalyani) is full and looks stunning, but steps are slippery. Do not step too close to the water edge.'
    },
    createdBy: 'system'
  },
  {
    id: 'loc_gavi_gangadhareshwara',
    name: 'Gavi Gangadhareshwara Cave Temple',
    description: 'A masterclass in ancient rock-cut architecture, this cave temple is dedicated to Lord Shiva and was built in the 9th century out of a natural monolithic cave. It features massive stone monolithic discs (Suryapana and Chandrapana) in the courtyard.',
    categoryId: 'cat_historic',
    difficulty: 'easy',
    lat: 12.9512,
    lng: 77.5639,
    rating: 4.7,
    verificationStatus: 'verified',
    upvotes: 67,
    images: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 1.0, // Caves are naturally cool inside!
      monsoon: 0.8,
      winter: 0.9
    },
    bestSeason: 'Summer',
    weatherWarnings: {
      rainy: 'CAUTION: The courtyard gathers water. Expect heavy crowds on festival days.'
    },
    createdBy: 'system'
  },
  // Submissions for Community Discovery (Pending verification)
  {
    id: 'loc_pending_clay_mine',
    name: 'Kanakapura Abandoned Clay Mines',
    description: 'Discovered this huge cavernous clay extraction pit off Kanakapura road. The excavation has created giant terraced steps which look like a mini grand canyon. Rainwater has formed a turquoise pond at the bottom.',
    categoryId: 'cat_abandoned',
    difficulty: 'hard',
    lat: 12.6512,
    lng: 77.4421,
    rating: 4.4,
    verificationStatus: 'pending',
    upvotes: 12,
    images: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.7,
      monsoon: 0.1, // Terraced walls are highly unstable in rain!
      winter: 0.9
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'CRITICAL: High risk of landslides along the excavation terraces. Do not stand near edges.'
    },
    createdBy: 'usr_002' // mock pathfinder user
  },
  {
    id: 'loc_pending_british_cemetery',
    name: 'Solur Hidden British Cemetery Ruins',
    description: 'Found this small, overgrown cemetery dating back to 1845. It is situated behind a mango grove near Solur. Several stone obelisks and tombstones with gothic inscriptions are visible, partially consumed by banyan roots.',
    categoryId: 'cat_historic',
    difficulty: 'easy',
    lat: 13.0189,
    lng: 77.2145,
    rating: 4.0,
    verificationStatus: 'pending',
    upvotes: 5,
    images: [
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80'
    ],
    seasonalSuitability: {
      summer: 0.8,
      monsoon: 0.5,
      winter: 0.9
    },
    bestSeason: 'Winter',
    weatherWarnings: {
      rainy: 'CAUTION: Extremely high snake presence in overgrown brushwood during monsoons. Wear boots.'
    },
    createdBy: 'usr_001'
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 'rev_1',
    locationId: 'loc_savandurga',
    userId: 'usr_001',
    rating: 5,
    comment: 'Absolute monster of a climb! The winter morning breeze made it perfect. The granite can get really steep near the fort ruins, make sure to wear high-grip shoes!',
    createdAt: '2026-08-20T10:15:00Z'
  },
  {
    id: 'rev_2',
    locationId: 'loc_savandurga',
    userId: 'usr_002',
    rating: 4,
    comment: 'Beautiful view, but please do not climb during rainy days. I was there last year and it got super slippery. Winter is the best.',
    createdAt: '2026-08-22T14:30:00Z'
  },
  {
    id: 'rev_3',
    locationId: 'loc_hoodi_factory',
    userId: 'usr_002',
    rating: 5,
    comment: 'This place is a dream for industrial decay photography. Found old factory ledger books in one of the back rooms. Quiet and spooky.',
    createdAt: '2026-08-19T11:20:00Z'
  },
  {
    id: 'rev_4',
    locationId: 'loc_bhoga_nandeeshwara',
    userId: 'usr_001',
    rating: 5,
    comment: 'The architectural precision here is outstanding. The Kalyani (stepwell) is a perfect place to sit and reflect. Extremely clean temple.',
    createdAt: '2026-08-23T09:00:00Z'
  }
];

export const INITIAL_USERS = [
  {
    id: 'usr_001',
    username: 'rohan_trekker',
    fullName: 'Rohan Sharma',
    email: 'rohan@viewpoint.com',
    role: 'Pathfinder', // Pathfinder can add places and verify them
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=rohan',
    bio: 'Avid weekend warrior. Love mapping lost ruins and granite monoliths around Bangalore.',
    joinedDate: 'Jan 2026',
    theme: 'dark'
  },
  {
    id: 'usr_002',
    username: 'neha_explores',
    fullName: 'Neha Reddy',
    email: 'neha@viewpoint.com',
    role: 'Explorer',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=neha',
    bio: 'Urban explorer, photographer, and history buff.',
    joinedDate: 'March 2026',
    theme: 'dark'
  }
];
