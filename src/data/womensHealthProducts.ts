interface WomensHealthProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  benefits: string[];
  ingredients: string[];
  dosage: string;
  warnings: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  skus: ProductSku[];
}

interface ProductSku {
  id: string;
  title: string;
  price: number;
  quantity: number;
  unit: string;
  pricePerUnit: string;
}

export const womensHealthProducts: WomensHealthProduct[] = [
  {
    id: '3',
    name: 'Blackmores Cranberry Forte 50,000',
    description: 'A concentrated cranberry extract to support urinary tract health.',
    price: 1424750, // ₫1,424,750 (converted from $56.99)
    originalPrice: 1599750, // ₫1,599,750 (converted from $63.99)
    image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: "Women's health",
    benefits: [
      'Supports urinary tract health',
      'Concentrated cranberry extract',
      'Antioxidant support',
      'May help reduce occurrence of medically diagnosed cystitis'
    ],
    ingredients: [
      'Vaccinium macrocarpon (cranberry) juice dry 400 mg equivalent to fresh fruit 20 g (20,000 mg)',
      'Vaccinium macrocarpon (cranberry) ext. dry conc. 60 mg equivalent to fresh fruit 30 g (30,000 mg)'
    ],
    dosage: 'Adults: Maintenance of urinary tract health - Take 1 capsule once a day. Reduce occurrence of medically diagnosed cystitis and antioxidant support – Take 2 capsules once a day. Do not exceed 2 capsules in 24 hours. Take with food.',
    warnings: [
      'Always read the label and follow the directions for use.',
      'If symptoms persist talk to your health professional.',
      'Supplements may only be of assistance if dietary intake is inadequate.',
      'If pain or irritation persists for more than 48 hours, consult your doctor.',
      'If you are pregnant, breastfeeding, on warfarin therapy, or have pre-existing kidney conditions, talk to your health professional before use.',
      'If you have any pre-existing conditions, or are on any medications always talk to your health professional before use.',
      'Do not exceed 2 capsules in 24 hours. Take with food.'
    ],
    rating: 4.6,
    reviews: 892,
    inStock: true,
    skus: [
      {
        id: 'cranberry-90',
        title: '90 capsules',
        price: 1424750,
        quantity: 90,
        unit: 'capsule',
        pricePerUnit: '₫15,830 per capsule'
      },
      {
        id: 'cranberry-30',
        title: '30 capsules',
        price: 675000,
        quantity: 30,
        unit: 'capsule',
        pricePerUnit: '₫22,500 per capsule'
      }
    ]
  },
  {
    id: '7',
    name: 'Blackmores Bio Iron Advanced',
    description: 'A lower constipation iron formulation which is gentle on the digestive system.',
    price: 462250, // ₫462,250 (converted from $18.49)
    image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: "Women's health",
    benefits: [
      'Superior iron absorption',
      'Gentle on the digestive system',
      'Lower constipation formula',
      'Supports healthy iron levels'
    ],
    ingredients: [
      'Iron (II) glycinate (iron 20 mg) 73 mg',
      'Ascorbic acid (vitamin C) 170 mg',
      'Betacarotene 1.35 mg',
      'Folic acid 300 microgram',
      'Cyanocobalamin (vitamin B12) 50 microgram',
      'Pyridoxine hydrochloride (vitamin B6, pyridoxine 5 mg) 6.08 mg',
      'Riboflavin (vitamin B2) 1.3 mg'
    ],
    dosage: 'Adults - Take 1 tablet once a day, or as professionally prescribed. Take with food.',
    warnings: [
      'Always read the label and follow the directions for use',
      'If symptoms persist talk to your health professional',
      'Supplements may only be of assistance if dietary intake is inadequate',
      'Not for the treatment of iron deficiency conditions',
      'If you are pregnant or breastfeeding, talk to your health professional before use',
      'If you have any pre-existing conditions, or are on any medications always talk to your health professional before use'
    ],
    rating: 4.4,
    reviews: 567,
    inStock: true,
    skus: [
      {
        id: 'bio-iron-30',
        title: '30 tablets',
        price: 462250,
        quantity: 30,
        unit: 'tablet',
        pricePerUnit: '₫15,408 per tablet'
      }
    ]
  }
];