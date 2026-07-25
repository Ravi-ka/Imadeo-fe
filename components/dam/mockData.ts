import { Asset, Folder, DAMStat } from './types';

export const initialFolders: Folder[] = [
  {
    id: 'folder-1',
    name: 'Brand Assets',
    itemCount: 142,
    totalSize: '4.2 GB',
    updatedAt: '2 hours ago',
    color: 'from-blue-500 to-indigo-600',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    path: '/Root/Brand Assets',
    description: 'Official logos, brand identity guidelines, icons, color palettes, and press kit assets.'
  },
  {
    id: 'folder-2',
    name: 'Product Photography',
    itemCount: 320,
    totalSize: '18.5 GB',
    updatedAt: 'Yesterday',
    color: 'from-purple-500 to-pink-600',
    coverImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    path: '/Root/Product Photography',
    description: 'High-res studio photography of product lineup for Q3 e-commerce release.'
  },
  {
    id: 'folder-3',
    name: 'Marketing Campaigns',
    itemCount: 88,
    totalSize: '6.1 GB',
    updatedAt: '3 days ago',
    color: 'from-cyan-500 to-blue-600',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    path: '/Root/Marketing Campaigns',
    description: 'Digital display ads, social banners, email header visuals, and promo flyers.'
  },
  {
    id: 'folder-4',
    name: 'Social Media',
    itemCount: 215,
    totalSize: '9.4 GB',
    updatedAt: 'Jul 20, 2026',
    color: 'from-amber-500 to-rose-500',
    coverImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
    path: '/Root/Social Media',
    description: 'Instagram stories, TikTok motion templates, LinkedIn carousels, and X headers.'
  },
  {
    id: 'folder-5',
    name: 'Videos & Motion',
    itemCount: 45,
    totalSize: '22.8 GB',
    updatedAt: 'Jul 18, 2026',
    color: 'from-emerald-500 to-teal-600',
    coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    path: '/Root/Videos & Motion',
    description: 'Raw video footage, edited product reels, promotional teasers, and 3D motion clips.'
  },
  {
    id: 'folder-6',
    name: 'Documents & Guidelines',
    itemCount: 64,
    totalSize: '1.2 GB',
    updatedAt: 'Jul 12, 2026',
    color: 'from-violet-500 to-indigo-500',
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    path: '/Root/Documents & Guidelines',
    description: 'PDF pitch decks, brand strategy docs, copywriting guides, and licensing contracts.'
  }
];

export const initialAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Imadeo_Hero_Banner_2026.png',
    type: 'image',
    extension: 'PNG',
    size: '4.8 MB',
    sizeBytes: 5033164,
    dimensions: '3840 x 2160',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    updatedAt: '2 hours ago',
    createdAt: '2026-07-25',
    owner: {
      name: 'Alex Morgan',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      email: 'alex.m@imadeo.io'
    },
    isFavorite: true,
    isShared: true,
    folderId: 'folder-1',
    tags: ['Hero', 'Banner', 'Brand', '2026', 'Dark Theme'],
    description: 'Official 4K desktop homepage banner graphic showcasing dynamic lighting gradients.',
    path: '/Root/Brand Assets/Imadeo_Hero_Banner_2026.png'
  },
  {
    id: 'asset-2',
    name: 'Product_Launch_Teaser_4K.mp4',
    type: 'video',
    extension: 'MP4',
    size: '185.4 MB',
    sizeBytes: 194405990,
    duration: '01:45',
    dimensions: '3840 x 2160',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    updatedAt: '4 hours ago',
    createdAt: '2026-07-25',
    owner: {
      name: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      email: 'sarah.c@imadeo.io'
    },
    isFavorite: true,
    isShared: false,
    folderId: 'folder-5',
    tags: ['Video', 'Teaser', 'Product', 'Motion', '4K'],
    description: 'Teaser motion video for the upcoming v2.0 software launch event.',
    path: '/Root/Videos & Motion/Product_Launch_Teaser_4K.mp4'
  },
  {
    id: 'asset-3',
    name: 'Brand_Identity_Guidelines_v3.pdf',
    type: 'document',
    extension: 'PDF',
    size: '14.2 MB',
    sizeBytes: 14889779,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    updatedAt: 'Yesterday',
    createdAt: '2026-07-24',
    owner: {
      name: 'Alex Morgan',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      email: 'alex.m@imadeo.io'
    },
    isFavorite: false,
    isShared: true,
    folderId: 'folder-6',
    tags: ['Guidelines', 'PDF', 'Brand', 'Typography', 'Logo Rules'],
    description: 'Comprehensive brand standards document covering logo usage, color ratios, and editorial voice.',
    path: '/Root/Documents & Guidelines/Brand_Identity_Guidelines_v3.pdf'
  },
  {
    id: 'asset-4',
    name: 'Minimalist_Watch_Collection.jpg',
    type: 'image',
    extension: 'JPG',
    size: '6.1 MB',
    sizeBytes: 6396313,
    dimensions: '4000 x 3000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    updatedAt: 'Yesterday',
    createdAt: '2026-07-24',
    owner: {
      name: 'David Kim',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      email: 'david.k@imadeo.io'
    },
    isFavorite: false,
    isShared: false,
    folderId: 'folder-2',
    tags: ['Product', 'Watch', 'Studio', 'Photography'],
    description: 'Clean studio background photo of white minimalist wrist watch.',
    path: '/Root/Product Photography/Minimalist_Watch_Collection.jpg'
  },
  {
    id: 'asset-5',
    name: 'Dashboard_System_UI_Kit.fig',
    type: 'design',
    extension: 'FIG',
    size: '32.6 MB',
    sizeBytes: 34183577,
    thumbnailUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    updatedAt: '2 days ago',
    createdAt: '2026-07-23',
    owner: {
      name: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      email: 'elena.r@imadeo.io'
    },
    isFavorite: true,
    isShared: true,
    folderId: 'folder-1',
    tags: ['Figma', 'UI Kit', 'Components', 'Design System'],
    description: 'Complete Figma master design system file containing component libraries and tokens.',
    path: '/Root/Brand Assets/Dashboard_System_UI_Kit.fig'
  },
  {
    id: 'asset-6',
    name: 'Summer_Promo_Campaign_Story.mp4',
    type: 'video',
    extension: 'MP4',
    size: '84.1 MB',
    sizeBytes: 88185856,
    duration: '00:30',
    dimensions: '1080 x 1920',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    updatedAt: '3 days ago',
    createdAt: '2026-07-22',
    owner: {
      name: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      email: 'sarah.c@imadeo.io'
    },
    isFavorite: false,
    isShared: false,
    folderId: 'folder-4',
    tags: ['Social', 'Instagram', 'Story', 'Summer', 'Video'],
    description: 'Vertical 9:16 video ad optimized for Instagram and TikTok stories.',
    path: '/Root/Social Media/Summer_Promo_Campaign_Story.mp4'
  },
  {
    id: 'asset-7',
    name: 'Q3_Growth_Strategy_Presentation.pdf',
    type: 'document',
    extension: 'PDF',
    size: '8.4 MB',
    sizeBytes: 8808038,
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    updatedAt: '3 days ago',
    createdAt: '2026-07-22',
    owner: {
      name: 'Alex Morgan',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      email: 'alex.m@imadeo.io'
    },
    isFavorite: false,
    isShared: true,
    folderId: 'folder-3',
    tags: ['Presentation', 'Strategy', 'Q3', 'Deck'],
    description: 'Executive pitch deck for Q3 digital asset expansion strategy.',
    path: '/Root/Marketing Campaigns/Q3_Growth_Strategy_Presentation.pdf'
  },
  {
    id: 'asset-8',
    name: '3D_Abstract_Gradient_Spheres.png',
    type: 'image',
    extension: 'PNG',
    size: '9.3 MB',
    sizeBytes: 9751756,
    dimensions: '4096 x 4096',
    thumbnailUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    updatedAt: 'Jul 20, 2026',
    createdAt: '2026-07-20',
    owner: {
      name: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      email: 'elena.r@imadeo.io'
    },
    isFavorite: true,
    isShared: false,
    folderId: 'folder-1',
    tags: ['3D', 'Render', 'Abstract', 'Gradients', 'Wallpaper'],
    description: 'High-definition 3D glassmorphic spheres render with vibrant glowing reflections.',
    path: '/Root/Brand Assets/3D_Abstract_Gradient_Spheres.png'
  },
  {
    id: 'asset-9',
    name: 'Audio_Sonic_Branding_Jingle.wav',
    type: 'audio',
    extension: 'WAV',
    size: '18.9 MB',
    sizeBytes: 19818086,
    duration: '00:15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    updatedAt: 'Jul 19, 2026',
    createdAt: '2026-07-19',
    owner: {
      name: 'David Kim',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      email: 'david.k@imadeo.io'
    },
    isFavorite: false,
    isShared: true,
    folderId: 'folder-1',
    tags: ['Audio', 'Jingle', 'Sonic Brand', 'HQ Sound'],
    description: '15-second audio logo sound identifier for commercial video openers.',
    path: '/Root/Brand Assets/Audio_Sonic_Branding_Jingle.wav'
  },
  {
    id: 'asset-10',
    name: 'Wireless_Headphones_Product_Shot.jpg',
    type: 'image',
    extension: 'JPG',
    size: '5.4 MB',
    sizeBytes: 5662310,
    dimensions: '3840 x 2560',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    updatedAt: 'Jul 18, 2026',
    createdAt: '2026-07-18',
    owner: {
      name: 'David Kim',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      email: 'david.k@imadeo.io'
    },
    isFavorite: true,
    isShared: false,
    folderId: 'folder-2',
    tags: ['Headphones', 'Product', 'Audio', 'Studio'],
    description: 'Black noise-canceling wireless headphones studio hero photography.',
    path: '/Root/Product Photography/Wireless_Headphones_Product_Shot.jpg'
  },
  {
    id: 'asset-11',
    name: 'Annual_Report_Copywriting_Final.docx',
    type: 'document',
    extension: 'DOCX',
    size: '2.1 MB',
    sizeBytes: 2202009,
    thumbnailUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    updatedAt: 'Jul 15, 2026',
    createdAt: '2026-07-15',
    owner: {
      name: 'Alex Morgan',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      email: 'alex.m@imadeo.io'
    },
    isFavorite: false,
    isShared: false,
    folderId: 'folder-6',
    tags: ['Document', 'Word', 'Copywriting', 'Annual Report'],
    description: 'Approved copy manuscript for the 2026 Annual Performance Report.',
    path: '/Root/Documents & Guidelines/Annual_Report_Copywriting_Final.docx'
  },
  {
    id: 'asset-12',
    name: 'Cyberpunk_City_Concept_Illustration.ai',
    type: 'design',
    extension: 'AI',
    size: '48.3 MB',
    sizeBytes: 50646220,
    dimensions: '5000 x 3000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    updatedAt: 'Jul 10, 2026',
    createdAt: '2026-07-10',
    owner: {
      name: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      email: 'elena.r@imadeo.io'
    },
    isFavorite: false,
    isShared: true,
    folderId: 'folder-3',
    tags: ['Illustrator', 'Vector', 'Concept', 'Futuristic'],
    description: 'Vector Illustrator keyframe illustration for futuristic gaming campaign.',
    path: '/Root/Marketing Campaigns/Cyberpunk_City_Concept_Illustration.ai'
  }
];

export const initialStats: DAMStat[] = [
  {
    label: 'Total Assets',
    value: '1,482',
    change: '+12% this month',
    trend: 'up',
    icon: 'Layers',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    label: 'Storage Used',
    value: '64.2 GB',
    change: '64% of 100 GB',
    trend: 'neutral',
    icon: 'HardDrive',
    color: 'from-purple-500 to-pink-500'
  },
  {
    label: 'Shared Assets',
    value: '324',
    change: '+18 new shares',
    trend: 'up',
    icon: 'Share2',
    color: 'from-amber-500 to-orange-500'
  },
  {
    label: 'Recent Uploads',
    value: '38',
    change: 'This week',
    trend: 'up',
    icon: 'UploadCloud',
    color: 'from-emerald-500 to-teal-500'
  }
];
