import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'twa-terralis',
    name: 'Terralis Abstract Wool Rug',
    slug: 'terralis-abstract-wool-rug',
    subtitle: 'Flowing topographical contours rendered in hand-tufted natural wool.',
    collection: 'Modern Forms',
    collectionSlug: 'modern-forms',
    technique: 'Hand-Tufted',
    techniqueDescription: 'Dense hand-tufted pile constructed by master artisans using a hand-operated needle tool on a vertical stretched cotton canvas.',
    material: 'Blended Wool',
    materialComposition: '80% New Zealand Long-Staple Wool, 20% Indian Highland Wool on 100% Cotton Canvas backing.',
    colors: ['Warm Ivory', 'Parchment', 'Oatmeal', 'Subtle Moss'],
    pileHeight: '12 mm plush medium pile with hand-sheared surface',
    origin: 'Bhadohi, Uttar Pradesh, India',
    description: 'Inspired by the quiet rhythm of natural landforms, the Terralis rug brings gentle movement to contemporary interiors. Each line is tufted by hand with deliberate variation in wool tension, creating an organic surface that catches ambient light softly without reflective sheen.',
    designStory: 'Developed within our Bhadohi studio, Terralis was created to ground architectural spaces. The subtle earth-toned lines mimic contours carved by water and wind, providing visual warmth without competing with modern furniture profiles.',
    craftNotes: 'The yarn is spun from a blend of long-staple New Zealand fleece for softness and resilient Indian highland fleece for pile memory. After tufting, the rug undergoes double latexing with a protective cotton backing, followed by thorough washing in fresh groundwater and hand-shearing using traditional iron shears.',
    careSummary: 'Vacuum weekly with suction only (avoid rotary beater bars). Spot clean immediately with a damp white cloth and wool-safe neutral soap. Rotate every 6 months.',
    featured: true,
    bestSeller: true,
    isNew: false,
    isReadyToShip: true,
    images: [
      {
        id: 'terralis-1',
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
        alt: 'Terralis Abstract Wool Rug in an understated minimalist living room',
        viewType: 'room',
        label: 'In-Situ Living Room'
      },
      {
        id: 'terralis-2',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        alt: 'Terralis Abstract Wool Rug full aerial perspective',
        viewType: 'full',
        label: 'Full Rug View'
      },
      {
        id: 'terralis-3',
        url: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1600&q=85',
        alt: 'Macro texture of Terralis blended wool fibers and hand-sheared pile',
        viewType: 'texture',
        label: 'Close Pile & Texture'
      },
      {
        id: 'terralis-4',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85',
        alt: 'Hand-finished edge binding and reverse canvas backing of Terralis rug',
        viewType: 'backing',
        label: 'Edge Binding & Reverse'
      },
      {
        id: 'terralis-5',
        url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85',
        alt: 'Folded corner detail showing pile density and structural foundation',
        viewType: 'corner',
        label: 'Folded Corner Detail'
      }
    ],
    variants: [
      {
        id: 'twa-ter-58',
        size: "5' × 8' (152 × 244 cm)",
        dimensionsFt: "5' × 8'",
        sku: 'TWA-TER-58',
        priceUSD: 680,
        inventory: 3,
        isReadyToShip: true,
        weightKg: 16
      },
      {
        id: 'twa-ter-69',
        size: "6' × 9' (183 × 274 cm)",
        dimensionsFt: "6' × 9'",
        sku: 'TWA-TER-69',
        priceUSD: 890,
        inventory: 1, // "LAST ONE AVAILABLE"
        isReadyToShip: true,
        weightKg: 22
      },
      {
        id: 'twa-ter-810',
        size: "8' × 10' (244 × 305 cm)",
        dimensionsFt: "8' × 10'",
        sku: 'TWA-TER-810',
        priceUSD: 1350,
        inventory: 4,
        isReadyToShip: true,
        weightKg: 32
      },
      {
        id: 'twa-ter-912',
        size: "9' × 12' (274 × 366 cm)",
        dimensionsFt: "9' × 12'",
        sku: 'TWA-TER-912',
        priceUSD: 1820,
        inventory: 0, // SOLD OUT -> Made to order
        isReadyToShip: false,
        productionTimeWeeks: '4–5 weeks',
        weightKg: 42
      },
      {
        id: 'twa-ter-1014',
        size: "10' × 14' (305 × 427 cm)",
        dimensionsFt: "10' × 14'",
        sku: 'TWA-TER-1014',
        priceUSD: 2380,
        inventory: 0,
        isReadyToShip: false,
        productionTimeWeeks: '5–6 weeks',
        weightKg: 54
      }
    ]
  },
  {
    id: 'twa-arbor-flow',
    name: 'Arbor Flow Sculpted Wool Rug',
    slug: 'arbor-flow-sculpted-wool-rug',
    subtitle: 'Organic branching lines hand-carved into high-low textured wool.',
    collection: 'Texture & Sculpture',
    collectionSlug: 'texture-sculpture',
    technique: 'Hand-Tufted',
    techniqueDescription: 'Dimensional hand-tufting with dual pile heights and manual bevel-carving along the curving contours.',
    material: 'Blended Wool',
    materialComposition: '85% Virgin Wool, 15% Botanical Bamboo Silk highlights on unbleached cotton backing.',
    colors: ['Cream', 'Bone', 'Muted Taupe', 'Charcoal Grain'],
    pileHeight: '14 mm high pile with 8 mm carved relief recesses',
    origin: 'Bhadohi, Uttar Pradesh, India',
    description: 'Arbor Flow explores organic growth patterns found in ancient tree barks and river meanders. The interplay of raised unspun wool loops and hand-sheared flat cut pile produces a gentle tactile elevation underfoot.',
    designStory: 'Designed with the philosophy of quiet tactility. Rather than contrasting contrasting colors, Arbor Flow creates depth through physical dimension and natural light shadows.',
    craftNotes: 'Following the tufting process, senior artisans carve each organic channel by hand using duckbill scissors. This precision sculpting takes approximately 18 hours per rug and ensures no two lines are mechanically identical.',
    careSummary: 'Vacuum gently without brush agitator. New wool rugs naturally shed light fuzz during the first few weeks—this stabilizes with regular gentle vacuuming.',
    featured: true,
    bestSeller: true,
    isNew: false,
    isReadyToShip: true,
    images: [
      {
        id: 'arbor-1',
        url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85',
        alt: 'Arbor Flow Sculpted Wool Rug in a warm serene bedroom setting',
        viewType: 'room',
        label: 'Interior Bedroom Setting'
      },
      {
        id: 'arbor-2',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85',
        alt: 'Arbor Flow Sculpted Wool Rug full view showing carved relief',
        viewType: 'full',
        label: 'Full Rug View'
      },
      {
        id: 'arbor-3',
        url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85',
        alt: 'Macro texture of high-low pile and hand-carved relief lines',
        viewType: 'texture',
        label: 'Sculpted Pile Detail'
      },
      {
        id: 'arbor-4',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        alt: 'Close-up of fringe and hem finish',
        viewType: 'detail',
        label: 'Edge & Binding'
      }
    ],
    variants: [
      {
        id: 'twa-arb-58',
        size: "5' × 8' (152 × 244 cm)",
        dimensionsFt: "5' × 8'",
        sku: 'TWA-ARB-58',
        priceUSD: 720,
        inventory: 2,
        isReadyToShip: true,
        weightKg: 18
      },
      {
        id: 'twa-arb-69',
        size: "6' × 9' (183 × 274 cm)",
        dimensionsFt: "6' × 9'",
        sku: 'TWA-ARB-69',
        priceUSD: 940,
        inventory: 0,
        isReadyToShip: false,
        productionTimeWeeks: '4–5 weeks',
        weightKg: 24
      },
      {
        id: 'twa-arb-810',
        size: "8' × 10' (244 × 305 cm)",
        dimensionsFt: "8' × 10'",
        sku: 'TWA-ARB-810',
        priceUSD: 1420,
        inventory: 2,
        isReadyToShip: true,
        weightKg: 34
      },
      {
        id: 'twa-arb-912',
        size: "9' × 12' (274 × 366 cm)",
        dimensionsFt: "9' × 12'",
        sku: 'TWA-ARB-912',
        priceUSD: 1910,
        inventory: 1, // LAST ONE AVAILABLE
        isReadyToShip: true,
        weightKg: 45
      },
      {
        id: 'twa-arb-1014',
        size: "10' × 14' (305 × 427 cm)",
        dimensionsFt: "10' × 14'",
        sku: 'TWA-ARB-1014',
        priceUSD: 2490,
        inventory: 0,
        isReadyToShip: false,
        productionTimeWeeks: '5–6 weeks',
        weightKg: 58
      }
    ]
  },
  {
    id: 'twa-kanso-linear',
    name: 'Kanso Minimalist Linear Rug',
    slug: 'kanso-minimalist-linear-rug',
    subtitle: 'Understated linear geometry crafted in un-dyed pure highland fleece.',
    collection: 'Quiet Neutrals',
    collectionSlug: 'quiet-neutrals',
    technique: 'Hand-Knotted',
    techniqueDescription: 'Individually tied asymmetrical Persian knots on a vertical timber loom. 60 knots per square inch.',
    material: '100% Pure Wool',
    materialComposition: '100% Hand-spun unbleached Indian Highland Wool on natural cotton warp and weft.',
    colors: ['Raw Ivory', 'Natural Taupe', 'Charcoal Pinstripe'],
    pileHeight: '9 mm low-profile, dense traditional knot pile',
    knotDensity: '60 knots / sq inch (~93,000 knots / sq meter)',
    origin: 'Bhadohi, Uttar Pradesh, India',
    description: 'Kanso takes its name from the Japanese principle of simplicity. Constructed entirely by hand-knotting, this piece utilizes the subtle chromatic shifts in un-dyed raw wool to create an understated, calming foundation for modern furniture.',
    designStory: 'We spent months sourcing un-dyed wool lots from sheep graziers in northern India. Because the wool is not chemically stripped or bleached, the natural lanolin remains intact, granting natural stain repellency and an authentic earthy feel.',
    craftNotes: 'Two master weavers work simultaneously side by side on our timber upright loom in Bhadohi. It takes approximately 7 weeks to weave an 8x10 foot Kanso rug knot by knot.',
    careSummary: 'A hand-knotted rug is an heirloom built to last for generations. Periodic gentle vacuuming and professional wash every 3–5 years will maintain its integrity.',
    featured: true,
    bestSeller: false,
    isNew: true,
    isReadyToShip: true,
    images: [
      {
        id: 'kanso-1',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
        alt: 'Kanso Minimalist Linear Rug beneath an architectural oak dining table',
        viewType: 'room',
        label: 'Dining Setting'
      },
      {
        id: 'kanso-2',
        url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
        alt: 'Full overhead view of Kanso Hand-Knotted Rug',
        viewType: 'full',
        label: 'Full Rug View'
      },
      {
        id: 'kanso-3',
        url: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1600&q=85',
        alt: 'Close-up of hand-knotted structure and natural lanolin wool sheen',
        viewType: 'texture',
        label: 'Knot Density Detail'
      },
      {
        id: 'kanso-4',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85',
        alt: 'Hand-tied fringe fringe fringe edge finish',
        viewType: 'backing',
        label: 'Hand-Tied Fringe'
      }
    ],
    variants: [
      {
        id: 'twa-kan-58',
        size: "5' × 8' (152 × 244 cm)",
        dimensionsFt: "5' × 8'",
        sku: 'TWA-KAN-58',
        priceUSD: 1150,
        inventory: 1, // LAST ONE AVAILABLE
        isReadyToShip: true,
        weightKg: 14
      },
      {
        id: 'twa-kan-69',
        size: "6' × 9' (183 × 274 cm)",
        dimensionsFt: "6' × 9'",
        sku: 'TWA-KAN-69',
        priceUSD: 1540,
        inventory: 2,
        isReadyToShip: true,
        weightKg: 19
      },
      {
        id: 'twa-kan-810',
        size: "8' × 10' (244 × 305 cm)",
        dimensionsFt: "8' × 10'",
        sku: 'TWA-KAN-810',
        priceUSD: 2280,
        inventory: 1,
        isReadyToShip: true,
        weightKg: 28
      },
      {
        id: 'twa-kan-912',
        size: "9' × 12' (274 × 366 cm)",
        dimensionsFt: "9' × 12'",
        sku: 'TWA-KAN-912',
        priceUSD: 3080,
        inventory: 0,
        isReadyToShip: false,
        productionTimeWeeks: '7–8 weeks',
        weightKg: 38
      }
    ]
  },
  {
    id: 'twa-varanasi-serenade',
    name: 'Varanasi Serenade Hand-Knotted Rug',
    slug: 'varanasi-serenade-hand-knotted-rug',
    subtitle: 'Century-old architectural motifs reimagined through soft earthen pigments.',
    collection: 'Hand-Knotted Collection',
    collectionSlug: 'hand-knotted-collection',
    technique: 'Hand-Knotted',
    techniqueDescription: 'Intricate 100-knot Tibetan-weave construction combining hand-carded wool with delicate mulberry silk highlights.',
    material: 'Wool & Botanical Silk',
    materialComposition: '75% Hand-spun Wool, 25% Pure Silk on warp foundation.',
    colors: ['Muted Terracotta', 'Antique Taupe', 'Ochre Dust', 'Soft Charcoal'],
    pileHeight: '7 mm low-sheared antique finish',
    knotDensity: '100 knots / sq inch (~155,000 knots / sq meter)',
    origin: 'Bhadohi, Uttar Pradesh, India',
    description: 'A tribute to the ancient architectural heritage along the Ganges near Bhadohi. The intricate traditional borders are softened and deconstructed, leaving ghost-like motifs that blend effortlessly with minimalist and mid-century furniture.',
    designStory: 'Heritage Reimagined at its most refined. We toned down contrast and used pot-dyed muted mineral pigments so the rug reads as an atmospheric canvas rather than a loud decorative pattern.',
    craftNotes: 'Woven over 12 weeks on our finest upright looms. After weaving, it undergoes an extensive organic river wash and sun curing on the atelier rooftop, followed by artisanal hand-shearing to reveal the subtle silk sheen.',
    careSummary: 'Vacuum gently in the direction of the pile. Professional rug clean only.',
    featured: true,
    bestSeller: false,
    isNew: false,
    isReadyToShip: true,
    images: [
      {
        id: 'varanasi-1',
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
        alt: 'Varanasi Serenade Hand-Knotted Rug in a sunlit architectural living space',
        viewType: 'room',
        label: 'Living Room Setting'
      },
      {
        id: 'varanasi-2',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        alt: 'Full overhead shot of Varanasi Serenade Rug',
        viewType: 'full',
        label: 'Full Rug View'
      },
      {
        id: 'varanasi-3',
        url: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1600&q=85',
        alt: 'High knot density and silk yarn sheen up close',
        viewType: 'texture',
        label: 'Silk & Wool Sheen'
      }
    ],
    variants: [
      {
        id: 'twa-var-69',
        size: "6' × 9' (183 × 274 cm)",
        dimensionsFt: "6' × 9'",
        sku: 'TWA-VAR-69',
        priceUSD: 2450,
        inventory: 1,
        isReadyToShip: true,
        weightKg: 20
      },
      {
        id: 'twa-var-810',
        size: "8' × 10' (244 × 305 cm)",
        dimensionsFt: "8' × 10'",
        sku: 'TWA-VAR-810',
        priceUSD: 3620,
        inventory: 1, // LAST ONE AVAILABLE
        isReadyToShip: true,
        weightKg: 30
      },
      {
        id: 'twa-var-912',
        size: "9' × 12' (274 × 366 cm)",
        dimensionsFt: "9' × 12'",
        sku: 'TWA-VAR-912',
        priceUSD: 4890,
        inventory: 0,
        isReadyToShip: false,
        productionTimeWeeks: '9–10 weeks',
        weightKg: 40
      }
    ]
  },
  {
    id: 'twa-botanica-umber',
    name: 'Botanica Umber Hand-Tufted Rug',
    slug: 'botanica-umber-hand-tufted-rug',
    subtitle: 'Silhouettes of regional flora abstracted into calming earth tones.',
    collection: 'Botanical Studies',
    collectionSlug: 'botanical-studies',
    technique: 'Hand-Tufted',
    techniqueDescription: 'Custom-dyed botanical shapes hand-tufted in variegated pile densities for subtle textural variety.',
    material: 'New Zealand Wool & Viscose',
    materialComposition: '70% New Zealand Wool, 30% Botanical Viscose.',
    colors: ['Earthy Umber', 'Warm Sand', 'Dried Olive', 'Parchment'],
    pileHeight: '11 mm cut pile with looped contours',
    origin: 'Bhadohi, Uttar Pradesh, India',
    description: 'Botanica Umber abstracts the native flora of the Gangetic plains into quiet rhythmic forms. The interplay of matte wool with the gentle luster of viscose yarns catches daylight differently throughout the hours.',
    designStory: 'An exploration of subtle organic forms. Instead of literal floral patterns, Botanica captures the impression of leaf shadows cast on sun-warmed plaster walls.',
    craftNotes: 'Colors are matched in small laboratory dye vats in Bhadohi using European non-toxic chrome dyes to ensure colorfastness while preserving yarn elasticity.',
    careSummary: 'Vacuum regularly with gentle suction. Keep away from excessive continuous direct UV exposure to maintain rich mineral hues.',
    featured: false,
    bestSeller: false,
    isNew: true,
    isReadyToShip: true,
    images: [
      {
        id: 'botanica-1',
        url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85',
        alt: 'Botanica Umber Rug in a serene bedroom setting with linen drapery',
        viewType: 'room',
        label: 'Bedroom Interior'
      },
      {
        id: 'botanica-2',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        alt: 'Full rug view of Botanica Umber',
        viewType: 'full',
        label: 'Full Rug View'
      },
      {
        id: 'botanica-3',
        url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85',
        alt: 'Close pile showing matte wool and viscose yarn highlights',
        viewType: 'texture',
        label: 'Yarn Blend Detail'
      }
    ],
    variants: [
      {
        id: 'twa-bot-58',
        size: "5' × 8' (152 × 244 cm)",
        dimensionsFt: "5' × 8'",
        sku: 'TWA-BOT-58',
        priceUSD: 740,
        inventory: 3,
        isReadyToShip: true,
        weightKg: 17
      },
      {
        id: 'twa-bot-69',
        size: "6' × 9' (183 × 274 cm)",
        dimensionsFt: "6' × 9'",
        sku: 'TWA-BOT-69',
        priceUSD: 980,
        inventory: 2,
        isReadyToShip: true,
        weightKg: 23
      },
      {
        id: 'twa-bot-810',
        size: "8' × 10' (244 × 305 cm)",
        dimensionsFt: "8' × 10'",
        sku: 'TWA-BOT-810',
        priceUSD: 1480,
        inventory: 0,
        isReadyToShip: false,
        productionTimeWeeks: '4–5 weeks',
        weightKg: 33
      },
      {
        id: 'twa-bot-912',
        size: "9' × 12' (274 × 366 cm)",
        dimensionsFt: "9' × 12'",
        sku: 'TWA-BOT-912',
        priceUSD: 1980,
        inventory: 0,
        isReadyToShip: false,
        productionTimeWeeks: '5–6 weeks',
        weightKg: 44
      }
    ]
  },
  {
    id: 'twa-bhadohi-flatweave-runner',
    name: 'Bhadohi Earth Reversible Flatweave',
    slug: 'bhadohi-earth-reversible-flatweave',
    subtitle: 'Traditional dhurrie flatweave crafted from resilient hand-spun raw fleece.',
    collection: 'Heritage Reimagined',
    collectionSlug: 'heritage-reimagined',
    technique: 'Flatweave',
    techniqueDescription: 'Tightly interlocked flatweave woven on horizontal pit looms. Fully reversible design.',
    material: '100% Pure Wool',
    materialComposition: '100% Raw Indian Wool with organic cotton warp tension threads.',
    colors: ['Warm Biscuit', 'Earth Charcoal', 'Raw Sand'],
    pileHeight: '5 mm zero-pile durable flatweave',
    origin: 'Bhadohi, Uttar Pradesh, India',
    description: 'A contemporary evolution of the traditional Indian dhurrie. Constructed with zero pile, Bhadohi Earth offers exceptional durability, making it ideal for high-traffic corridors, hallways, dining rooms, and casual living areas.',
    designStory: 'We wanted to celebrate the unpretentious honesty of the flat loom. By using thick hand-spun wool slub yarn, the weave exhibits natural texture variations that reveal the hand of the weaver.',
    craftNotes: 'Woven on indigenous pit looms in the rural hamlets surrounding Bhadohi. The tension is maintained entirely through the foot pedals and body movement of the artisan.',
    careSummary: 'Shake outdoors regularly. Vacuum gently without brush roll. Spot clean with warm water and wool cleaner. Fully reversible for twice the wear.',
    featured: false,
    bestSeller: true,
    isNew: false,
    isReadyToShip: true,
    images: [
      {
        id: 'bhadohi-flat-1',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        alt: 'Bhadohi Earth Flatweave Runner in a bright modern entry hallway',
        viewType: 'room',
        label: 'Hallway Runner'
      },
      {
        id: 'bhadohi-flat-2',
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
        alt: 'Full view of Bhadohi Earth Flatweave',
        viewType: 'full',
        label: 'Full Rug View'
      },
      {
        id: 'bhadohi-flat-3',
        url: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1600&q=85',
        alt: 'Tight interlocked flatweave surface and slub yarn character',
        viewType: 'texture',
        label: 'Flatweave Texture'
      }
    ],
    variants: [
      {
        id: 'twa-bhd-run',
        size: "2.5' × 10' (76 × 305 cm) Runner",
        dimensionsFt: "2.5' × 10'",
        sku: 'TWA-BHD-RUN',
        priceUSD: 390,
        inventory: 4,
        isReadyToShip: true,
        weightKg: 8
      },
      {
        id: 'twa-bhd-58',
        size: "5' × 8' (152 × 244 cm)",
        dimensionsFt: "5' × 8'",
        sku: 'TWA-BHD-58',
        priceUSD: 520,
        inventory: 2,
        isReadyToShip: true,
        weightKg: 12
      },
      {
        id: 'twa-bhd-810',
        size: "8' × 10' (244 × 305 cm)",
        dimensionsFt: "8' × 10'",
        sku: 'TWA-BHD-810',
        priceUSD: 960,
        inventory: 1, // LAST ONE AVAILABLE
        isReadyToShip: true,
        weightKg: 21
      },
      {
        id: 'twa-bhd-912',
        size: "9' × 12' (274 × 366 cm)",
        dimensionsFt: "9' × 12'",
        sku: 'TWA-BHD-912',
        priceUSD: 1280,
        inventory: 0,
        isReadyToShip: false,
        productionTimeWeeks: '3–4 weeks',
        weightKg: 28
      }
    ]
  }
];
