import { CollectionSlug } from '../types';

export interface CollectionInfo {
  slug: CollectionSlug;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  curatedTechniques: string[];
}

export const COLLECTIONS: CollectionInfo[] = [
  {
    slug: 'modern-forms',
    name: 'Modern Forms',
    tagline: 'Abstract and contemporary designs.',
    description: 'Rugs characterized by fluid lines, architectural minimalism, and restrained asymmetry. Designed to balance clean modernist spaces without overwhelming them.',
    heroImage: '/images/collections/modern-forms.jpg',
    curatedTechniques: ['Hand-Tufted', 'Hand-Knotted']
  },
  {
    slug: 'quiet-neutrals',
    name: 'Quiet Neutrals',
    tagline: 'Soft, restrained rugs for sophisticated interiors.',
    description: 'An exploration of un-dyed wools, warm ivory, soft bone, oatmeal, and parchment. Tactile depth achieved entirely through fiber variations and gentle pile shearing.',
    heroImage: '/images/collections/quiet-neutrals.jpg',
    curatedTechniques: ['Hand-Knotted', 'Hand-Tufted', 'Flatweave']
  },
  {
    slug: 'botanical-studies',
    name: 'Botanical Studies',
    tagline: 'Nature-inspired patterns.',
    description: 'Abstracted botanical silhouettes inspired by the Gangetic flora. Gentle earthy pigments blended with natural wool and soft botanical viscose.',
    heroImage: '/images/collections/botanical-studies.jpg',
    curatedTechniques: ['Hand-Tufted']
  },
  {
    slug: 'heritage-reimagined',
    name: 'Heritage Reimagined',
    tagline: 'Traditional influences interpreted for contemporary spaces.',
    description: 'Centuries of Indian weaving heritage filtered through modern restraint. Deconstructed borders, softened motifs, and antique artisan-washed finishes.',
    heroImage: '/images/collections/heritage-reimagined.jpg',
    curatedTechniques: ['Hand-Knotted', 'Flatweave']
  },
  {
    slug: 'texture-sculpture',
    name: 'Texture & Sculpture',
    tagline: 'High-low, carved and dimensional surfaces.',
    description: 'Rugs that engage the sense of touch through physical elevation. Hand-carved relief channels, loop-and-cut pile contrasts, and dimensional landscape textures.',
    heroImage: '/images/collections/texture-sculpture.jpg',
    curatedTechniques: ['Hand-Tufted']
  },
  {
    slug: 'hand-knotted-collection',
    name: 'Hand-Knotted Collection',
    tagline: 'Intricate, traditional handmade construction.',
    description: 'The pinnacle of carpet weaving. Every knot individually tied by hand on vertical timber looms in Bhadohi. Exceptional longevity, supple handle, and heirloom durability.',
    heroImage: '/images/collections/hand-knotted-collection.jpg',
    curatedTechniques: ['Hand-Knotted']
  }
];
