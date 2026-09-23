import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  CheckCircle,
  Clock,
  Truck,
  ShieldCheck,
  Layers,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Eye,
  Mail,
  ExternalLink,
  Lock,
  Unlock,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Shield,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Send,
  Save,
  Info,
  Sparkles,
  DollarSign,
  FileText,
  Database,
  Key,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Product,
  ProductVariant,
  ProductImage,
  ImageViewType,
  Order,
  OrderStatus,
  CustomQuoteRequest,
  Technique,
  Material,
  CollectionSlug,
} from '../../types';
import { orderService } from '../../services/orderService';
import { quoteService } from '../../services/quoteService';
import { paymentService } from '../../services/paymentService';
import { emailService, ATELIER_PRIMARY_EMAIL } from '../../services/emailService';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { isStoreOwnerEmail } from '../../context/AuthContext';

// Helper to optimize and convert local file to high-res data URL
const processLocalImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const PERSPECTIVE_OPTIONS: Array<{ value: ImageViewType; label: string; defaultBadge: string }> = [
  { value: 'full', label: 'Full Overhead Flat', defaultBadge: 'Full Overview' },
  { value: 'living-room', label: 'Living Room Styled', defaultBadge: 'Living Room' },
  { value: 'bedroom', label: 'Bedroom Setting', defaultBadge: 'Bedroom' },
  { value: 'reading-nook', label: 'Reading Nook', defaultBadge: 'Reading Nook' },
  { value: 'dining', label: 'Dining Room Styled', defaultBadge: 'Dining Room' },
  { value: 'entryway', label: 'Entryway / Foyer', defaultBadge: 'Entryway' },
  { value: 'texture', label: 'Texture & Surface', defaultBadge: 'Texture & Pile' },
  { value: 'detail', label: 'Close-Up Detail', defaultBadge: 'Close-Up Detail' },
  { value: 'backing', label: 'Loom Backing', defaultBadge: 'Loom Backing' },
  { value: 'corner', label: 'Corner Bevel', defaultBadge: 'Corner Bevel' },
  { value: 'artisan-loom', label: 'Artisan Loom & Craft', defaultBadge: 'Artisan Loom' },
];

export const getPerspectiveBadge = (viewType: string): string => {
  const found = PERSPECTIVE_OPTIONS.find((opt) => opt.value === viewType);
  return found ? found.defaultBadge : 'Living Room';
};

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'prasrirugs@gmail.com';

export const AdminDashboardPage: React.FC = () => {
  // Authentication Gate
  // When Supabase is configured, we must never trust localStorage alone.
  // Initial state is strictly false for security until cryptographic session is verified.
  const [isValidatingSession, setIsValidatingSession] = useState<boolean>(() => isSupabaseConfigured());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // If Supabase is NOT configured (offline demo sandbox mode)
    if (!isSupabaseConfigured()) {
      const isAuth = localStorage.getItem('twa_admin_auth') === 'true';
      const adminUser = localStorage.getItem('twa_admin_user');
      return isAuth && adminUser ? isStoreOwnerEmail(adminUser) : isAuth;
    }
    return false;
  });
  const [adminEmail, setAdminEmail] = useState(() => ADMIN_EMAIL.split(',')[0].trim());
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [currentAdminUser, setCurrentAdminUser] = useState<string | null>(() => {
    return localStorage.getItem('twa_admin_user') || null;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'orders' | 'quotes' | 'system'>('products');

  // Contexts
  const { products, addProduct, updateProduct, deleteProduct, updateStock, getInventory, stockSubscriptions } = useInventory();
  const { formatPrice } = useCurrency();

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Quotes State
  const [quotes, setQuotes] = useState<CustomQuoteRequest[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // Toast notifications state
  interface AdminToast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  // Design-Card Grouped Stock Matrix State
  const [expandedDesignIds, setExpandedDesignIds] = useState<Set<string>>(new Set());
  const [stockSearch, setStockSearch] = useState('');
  const [updatingStockSku, setUpdatingStockSku] = useState<string | null>(null);

  // Orders Fulfillment & Courier State
  const [orderStageUpdating, setOrderStageUpdating] = useState<string | null>(null);
  const [courierInputs, setCourierInputs] = useState<Record<string, { carrier: string; trackingNumber: string }>>({});
  const [emailDispatchingOrder, setEmailDispatchingOrder] = useState<string | null>(null);

  // System Diagnostics State
  const [testingRazorpay, setTestingRazorpay] = useState(false);
  const [razorpayDiagResult, setRazorpayDiagResult] = useState<any>(null);
  const [testingEmail, setTestingEmail] = useState(false);

  // Email Preview Modal
  const [emailPreviewContent, setEmailPreviewContent] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  // Product Editor Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodSlug, setProdSlug] = useState('');
  const [prodCollection, setProdCollection] = useState('Modern Forms');
  const [prodCollectionSlug, setProdCollectionSlug] = useState<CollectionSlug>('modern-forms');
  const [prodTechnique, setProdTechnique] = useState<Technique>('Hand-Tufted');
  const [prodTechniqueDesc, setProdTechniqueDesc] = useState('Hand-sheared cut and loop pile relief woven on vertical looms in Bhadohi.');
  const [prodMaterial, setProdMaterial] = useState<Material>('Blended Wool');
  const [prodMaterialComp, setProdMaterialComp] = useState('85% New Zealand Blended Wool, 15% Botanical Silk');
  const [prodColors, setProdColors] = useState('Warm Ivory, Parchment, Taupe');
  const [prodPileHeight, setProdPileHeight] = useState('12–14mm variable relief');
  const [prodKnotDensity, setProdKnotDensity] = useState('60 Raj / 100 knots per sq. in.');
  const [prodOrigin, setProdOrigin] = useState('Bhadohi, Uttar Pradesh, India');
  const [prodDescription, setProdDescription] = useState('');
  const [prodDesignStory, setProdDesignStory] = useState('');
  const [prodCraftNotes, setProdCraftNotes] = useState('');
  const [prodCareSummary, setProdCareSummary] = useState('Rotate quarterly. Vacuum without rotating beater bar. Spot clean with wool-safe mild detergent.');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodBestSeller, setProdBestSeller] = useState(false);
  const [prodIsNew, setProdIsNew] = useState(true);
  const [prodIsReadyToShip, setProdIsReadyToShip] = useState(true);

  // Image management in form
  const [imagesList, setImagesList] = useState<ProductImage[]>([
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1400&q=85',
      alt: 'Full frontal view of hand-woven rug',
      viewType: 'full',
      label: 'Full Overview',
    },
  ]);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variant Matrix in form
  const [variantsList, setVariantsList] = useState<ProductVariant[]>([
    {
      id: 'v-1',
      size: "5' × 8'",
      dimensionsFt: "5' × 8' (152 × 244 cm)",
      sku: 'TWA-NEW-0508',
      priceUSD: 1650,
      inventory: 2,
      isReadyToShip: true,
      weightKg: 16,
      productionTimeWeeks: '4–6 weeks',
    },
    {
      id: 'v-2',
      size: "8' × 10'",
      dimensionsFt: "8' × 10' (244 × 305 cm)",
      sku: 'TWA-NEW-0810',
      priceUSD: 3150,
      inventory: 1,
      isReadyToShip: true,
      weightKg: 28,
      productionTimeWeeks: '4–6 weeks',
    },
  ]);

  // Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [inventoryFilter, setInventoryFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  // Custom Rug Calculator State (for bespoke quotes tab)
  const [calcWidth, setCalcWidth] = useState<number>(8);
  const [calcLength, setCalcLength] = useState<number>(10);
  const [calcTechnique, setCalcTechnique] = useState<string>('Hand-Knotted');

  // Load orders and quotes
  const loadOrdersAndQuotes = async () => {
    setLoadingOrders(true);
    setLoadingQuotes(true);
    try {
      const fetchedOrders = await orderService.getAllOrders();
      setOrders(fetchedOrders);
      
      // Populate courier inputs with existing order values
      const initialCourier: Record<string, { carrier: string; trackingNumber: string }> = {};
      fetchedOrders.forEach((o) => {
        initialCourier[o.orderNumber] = {
          carrier: o.carrier || 'Insured Express International',
          trackingNumber: o.trackingNumber || '',
        };
      });
      setCourierInputs(initialCourier);

      const fetchedQuotes = await quoteService.getAllQuotes();
      setQuotes(fetchedQuotes);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoadingOrders(false);
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setIsValidatingSession(false);
      return;
    }

    const client = supabase;
    let isMounted = true;

    // Cryptographic Session Verification
    const verifySession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (!isMounted) return;

        if (session?.user?.email && (isStoreOwnerEmail(session.user.email) || (session.user as any).app_metadata?.role === 'admin')) {
          setIsAuthenticated(true);
          setCurrentAdminUser(session.user.email);
          localStorage.setItem('twa_admin_auth', 'true');
          localStorage.setItem('twa_admin_user', session.user.email);
        } else {
          // No valid session or user email is NOT the store owner:
          // Immediately revoke and clear storage to stop any DevTools localStorage spoofing
          setIsAuthenticated(false);
          setCurrentAdminUser(null);
          localStorage.removeItem('twa_admin_auth');
          localStorage.removeItem('twa_admin_user');
        }
      } catch (err) {
        if (isMounted) {
          setIsAuthenticated(false);
          setCurrentAdminUser(null);
          localStorage.removeItem('twa_admin_auth');
          localStorage.removeItem('twa_admin_user');
        }
      } finally {
        if (isMounted) {
          setIsValidatingSession(false);
        }
      }
    };

    verifySession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user?.email && (isStoreOwnerEmail(session.user.email) || (session.user as any).app_metadata?.role === 'admin')) {
        setIsAuthenticated(true);
        setCurrentAdminUser(session.user.email);
        localStorage.setItem('twa_admin_auth', 'true');
        localStorage.setItem('twa_admin_user', session.user.email);
      } else {
        setIsAuthenticated(false);
        setCurrentAdminUser(null);
        localStorage.removeItem('twa_admin_auth');
        localStorage.removeItem('twa_admin_user');
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrdersAndQuotes();
    }
  }, [isAuthenticated]);

  // Authentication submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!isSupabaseConfigured() || !supabase) {
      // In local dev sandbox only, allow explicit dev key if set in environment
      if (import.meta.env.DEV) {
        const devKey = import.meta.env.VITE_ADMIN_DEV_KEY;
        if (devKey && passwordInput === devKey) {
          localStorage.setItem('twa_admin_auth', 'true');
          localStorage.setItem('twa_admin_user', adminEmail.trim() || ADMIN_EMAIL);
          setCurrentAdminUser(adminEmail.trim() || ADMIN_EMAIL);
          setIsAuthenticated(true);
          return;
        }
      }
      setAuthError('Supabase is not configured. Connect your Supabase project in .env to enable production authentication.');
      return;
    }

    setIsSigningIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: passwordInput,
      });

      if (error) {
        setAuthError(error.message);
      } else if (data.user) {
        const email = data.user.email?.toLowerCase();
        const isAdminRole = (data.user as any).app_metadata?.role === 'admin';
        if ((email && isStoreOwnerEmail(email)) || isAdminRole) {
          localStorage.setItem('twa_admin_auth', 'true');
          localStorage.setItem('twa_admin_user', data.user.email || ADMIN_EMAIL);
          setCurrentAdminUser(data.user.email || ADMIN_EMAIL);
          setIsAuthenticated(true);
        } else {
          setAuthError(`Access restricted. User ${data.user.email} is not authorized as an atelier administrator.`);
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication error.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSendMagicLink = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setAuthError('Supabase is not configured. Connect your Supabase project in .env to enable magic links.');
      return;
    }
    setAuthError('');
    setAuthSuccess('');
    setIsSendingOtp(true);
    try {
      const targetEmail = adminEmail.trim() || ADMIN_EMAIL;
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          emailRedirectTo: window.location.origin + '/admin',
        },
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthSuccess(`Secure one-time login link dispatched to ${targetEmail}. Open your email inbox to log in.`);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to dispatch magic link.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('twa_admin_auth');
    localStorage.removeItem('twa_admin_user');
    setIsAuthenticated(false);
    setCurrentAdminUser(null);
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalUSD || 0), 0);
    const activeOrders = orders.filter((o) => o.status !== 'DELIVERED').length;
    const madeToOrderCount = orders.filter((o) => o.isMadeToOrder && o.status !== 'DELIVERED').length;
    
    let lowStockCount = 0;
    let outOfStockCount = 0;
    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        const currentStock = getInventory(v.sku);
        if (currentStock === 0) outOfStockCount++;
        else if (currentStock < 2) lowStockCount++;
      });
    });

    const pendingQuotes = quotes.filter((q) => q.status === 'Received' || q.status === 'Reviewing').length;

    return {
      totalRevenue,
      activeOrders,
      madeToOrderCount,
      totalProducts: products.length,
      lowStockCount,
      outOfStockCount,
      pendingQuotes,
    };
  }, [orders, products, quotes, getInventory]);

  // Auto-generate slug and SKU when name changes
  const handleNameChange = (name: string) => {
    setProdName(name);
    if (!editingProductId) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setProdSlug(generatedSlug);

      const prefix = name.substring(0, 3).toUpperCase() || 'RUG';
      setVariantsList((prev) =>
        prev.map((v) => {
          const sizePart = v.size.replace(/[^0-9]/g, '');
          return {
            ...v,
            sku: `TWA-${prefix}-${sizePart.padStart(4, '0')}`,
          };
        })
      );
    }
  };

  // Handle Local File Upload from User's Device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingUpload(true);
    try {
      const newImages: ProductImage[] = [];
      const defaultPerspectiveSequence: ImageViewType[] = [
        'full',
        'living-room',
        'bedroom',
        'reading-nook',
        'dining',
        'entryway',
        'texture',
        'detail',
        'backing',
        'corner',
      ];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await processLocalImageFile(file);
        const sequenceIndex = imagesList.length + i;
        const assignedViewType: ImageViewType =
          defaultPerspectiveSequence[sequenceIndex % defaultPerspectiveSequence.length] || 'living-room';
        const cleanBadge = getPerspectiveBadge(assignedViewType);

        newImages.push({
          id: `img-upload-${Date.now()}-${i}`,
          url: dataUrl,
          alt: `${prodName || 'Handcrafted rug'} - ${cleanBadge}`,
          viewType: assignedViewType,
          label: cleanBadge,
        });
      }

      setImagesList((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error('Error reading local image:', err);
      alert('Failed to process one or more images. Please ensure they are standard image formats (JPEG, PNG, WebP).');
    } finally {
      setIsProcessingUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Reset Product Form for "+ Add New Rug"
  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setProdName('');
    setProdSubtitle('');
    setProdSlug('');
    setProdCollection('Modern Forms');
    setProdCollectionSlug('modern-forms');
    setProdTechnique('Hand-Tufted');
    setProdTechniqueDesc('Hand-sheared cut and loop pile relief woven on vertical looms in Bhadohi.');
    setProdMaterial('Blended Wool');
    setProdMaterialComp('85% New Zealand Blended Wool, 15% Botanical Silk');
    setProdColors('Warm Ivory, Parchment, Muted Taupe');
    setProdPileHeight('12–14mm variable relief');
    setProdKnotDensity('60 Raj / 100 knots per sq. in.');
    setProdOrigin('Bhadohi, Uttar Pradesh, India');
    setProdDescription('An exquisite contemporary composition handcrafted knot-by-knot in Bhadohi. Features organic textural depths and tonal restraint.');
    setProdDesignStory('Rooted in centuries of eastern Uttar Pradesh weaving heritage, translated into modern architectural living spaces.');
    setProdCraftNotes('Warped with long-staple cotton foundation. Purified soft-water wash with natural open-air sun curing.');
    setProdCareSummary('Rotate quarterly. Vacuum without rotating beater bar. Spot clean with wool-safe mild detergent.');
    setProdFeatured(true);
    setProdBestSeller(false);
    setProdIsNew(true);
    setImagesList([]);

    setVariantsList([
      {
        id: `var-${Date.now()}-1`,
        size: "5' × 8'",
        dimensionsFt: "5' × 8' (152 × 244 cm)",
        sku: 'TWA-NEW-0508',
        priceUSD: 1850,
        inventory: 2,
        isReadyToShip: true,
        weightKg: 18,
        productionTimeWeeks: '4–6 weeks',
      },
      {
        id: `var-${Date.now()}-2`,
        size: "8' × 10'",
        dimensionsFt: "8' × 10' (244 × 305 cm)",
        sku: 'TWA-NEW-0810',
        priceUSD: 3400,
        inventory: 1,
        isReadyToShip: true,
        weightKg: 30,
        productionTimeWeeks: '4–6 weeks',
      },
      {
        id: `var-${Date.now()}-3`,
        size: "9' × 12'",
        dimensionsFt: "9' × 12' (274 × 366 cm)",
        sku: 'TWA-NEW-0912',
        priceUSD: 4600,
        inventory: 0,
        isReadyToShip: false,
        weightKg: 40,
        productionTimeWeeks: '5–7 weeks',
      },
    ]);

    setIsProductModalOpen(true);
  };

  // Populate Product Form for "Edit Rug"
  const handleOpenEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setProdName(product.name);
    setProdSubtitle(product.subtitle);
    setProdSlug(product.slug);
    setProdCollection(product.collection);
    setProdCollectionSlug(product.collectionSlug);
    setProdTechnique(product.technique);
    setProdTechniqueDesc(product.techniqueDescription);
    setProdMaterial(product.material);
    setProdMaterialComp(product.materialComposition);
    setProdColors(product.colors.join(', '));
    setProdPileHeight(product.pileHeight);
    setProdKnotDensity(product.knotDensity || '');
    setProdOrigin(product.origin);
    setProdDescription(product.description);
    setProdDesignStory(product.designStory || '');
    setProdCraftNotes(product.craftNotes || '');
    setProdCareSummary(product.careSummary || '');
    setProdFeatured(product.featured || false);
    setProdBestSeller(product.bestSeller || false);
    setProdIsNew(product.isNew || false);
    setImagesList(
      (product.images || []).map((img) => {
        const isBadLabel =
          !img.label ||
          img.label.startsWith('[Local File:') ||
          img.label.toLowerCase().includes('gemini') ||
          img.label.toLowerCase().includes('screenshot') ||
          img.label.toLowerCase().includes('img_') ||
          img.label.toLowerCase().includes('dsc_') ||
          img.label.length > 30;
        return {
          ...img,
          label: isBadLabel ? getPerspectiveBadge(img.viewType) : img.label,
        };
      })
    );
    setVariantsList(product.variants);
    setIsProductModalOpen(true);
  };

  // Save product from modal
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prodName.trim() || !prodSlug.trim()) {
      alert('Please provide a rug title and valid slug.');
      return;
    }

    if (variantsList.length === 0) {
      alert('Please define at least one size variant with SKU and price.');
      return;
    }

    if (imagesList.length === 0 || !imagesList.some((img) => img.url.trim())) {
      alert('Please upload or provide at least one photograph of the rug.');
      return;
    }

    const formattedColors = prodColors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const productPayload: Omit<Product, 'id'> = {
      name: prodName.trim(),
      slug: prodSlug.trim(),
      subtitle: prodSubtitle.trim(),
      collection: prodCollection,
      collectionSlug: prodCollectionSlug,
      technique: prodTechnique,
      techniqueDescription: prodTechniqueDesc,
      material: prodMaterial,
      materialComposition: prodMaterialComp,
      colors: formattedColors,
      pileHeight: prodPileHeight,
      knotDensity: prodKnotDensity,
      origin: prodOrigin,
      description: prodDescription,
      designStory: prodDesignStory,
      craftNotes: prodCraftNotes,
      careSummary: prodCareSummary,
      featured: prodFeatured,
      bestSeller: prodBestSeller,
      isNew: prodIsNew,
      isReadyToShip: prodIsReadyToShip,
      images: imagesList,
      variants: variantsList,
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, productPayload);
      } else {
        await addProduct(productPayload);
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert(`Could not save product: ${err.message || 'Unknown error'}`);
    }
  };

  // Delete product action
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the atelier catalog? This action will sync across your database.`)) {
      await deleteProduct(id);
    }
  };

  // Add a size preset to variants list in the editor
  const handleAddVariantPreset = (sizeLabel: string, dimensions: string, defaultPrice: number, defaultWeight: number) => {
    const skuCode = prodSlug.replace(/[^a-z0-9]/g, '').substring(0, 4).toUpperCase() || 'RUG';
    const sizeNumber = sizeLabel.replace(/[^0-9]/g, '');
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      size: sizeLabel,
      dimensionsFt: dimensions,
      sku: `TWA-${skuCode}-${sizeNumber.padStart(4, '0')}`,
      priceUSD: defaultPrice,
      inventory: 1,
      isReadyToShip: true,
      weightKg: defaultWeight,
      productionTimeWeeks: '4–6 weeks',
    };
    setVariantsList((prev) => [...prev, newVariant]);
  };

  // Update specific variant field
  const handleUpdateVariantField = (index: number, field: keyof ProductVariant, value: any) => {
    setVariantsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Remove variant from list
  const handleRemoveVariant = (index: number) => {
    if (variantsList.length <= 1) {
      alert('A rug must have at least one size variant.');
      return;
    }
    setVariantsList((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Add new image row (URL mode)
  const handleAddImageRow = () => {
    setImagesList((prev) => [
      ...prev,
      {
        id: `img-${Date.now()}`,
        url: '',
        alt: `${prodName || 'Handcrafted rug'} detail`,
        viewType: 'living-room',
        label: 'Living Room',
      },
    ]);
  };

  const handleUpdateImageField = (index: number, field: string, value: string) => {
    setImagesList((prev) => {
      const updated = [...prev];
      if (field === 'viewType') {
        const newBadge = getPerspectiveBadge(value);
        updated[index] = {
          ...updated[index],
          viewType: value as ImageViewType,
          label: newBadge,
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleRemoveImageRow = (index: number) => {
    setImagesList((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Quick Stock Adjustment for Stepper and Direct Input
  const handleQuickStock = async (sku: string, newQty: number) => {
    const val = Math.max(0, Math.round(Number(newQty) || 0));
    setUpdatingStockSku(sku);
    try {
      await updateStock(sku, val);
      showToast(`Stock updated to ${val} units for SKU: ${sku}`, 'success');
    } catch (err: any) {
      showToast(`Failed to update stock: ${err.message}`, 'error');
    } finally {
      setUpdatingStockSku(null);
    }
  };

  // Expand / Collapse Design Cards in Stock Matrix
  const toggleExpandDesign = (productId: string) => {
    setExpandedDesignIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const expandAllDesigns = () => {
    setExpandedDesignIds(new Set(products.map((p) => p.id)));
  };

  const collapseAllDesigns = () => {
    setExpandedDesignIds(new Set());
  };

  // Courier Details Tracking Form Handler
  const handleCourierInputChange = (orderNumber: string, field: 'carrier' | 'trackingNumber', value: string) => {
    setCourierInputs((prev) => ({
      ...prev,
      [orderNumber]: {
        carrier: field === 'carrier' ? value : (prev[orderNumber]?.carrier || 'Insured Express International'),
        trackingNumber: field === 'trackingNumber' ? value : (prev[orderNumber]?.trackingNumber || ''),
      },
    }));
  };

  // Order status transition with courier details
  const handleUpdateOrderStatus = async (orderNumber: string, newStatus: OrderStatus) => {
    setOrderStageUpdating(orderNumber);
    try {
      const courier = courierInputs[orderNumber];
      const updated = await orderService.updateOrderStatus(
        orderNumber,
        newStatus,
        courier?.trackingNumber,
        courier?.carrier
      );
      setOrders((prev) => prev.map((o) => (o.orderNumber === orderNumber ? updated : o)));
      if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
        setSelectedOrder(updated);
      }
      showToast(`Order ${orderNumber} stage updated to "${newStatus}"`, 'success');
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      showToast(`Failed to update order stage: ${err.message}`, 'error');
    } finally {
      setOrderStageUpdating(null);
    }
  };

  // Save Courier & Tracking Details
  const handleSaveCourierDetails = async (order: Order) => {
    const courier = courierInputs[order.orderNumber];
    if (!courier) return;
    try {
      const updated = await orderService.updateOrderStatus(
        order.orderNumber,
        order.status,
        courier.trackingNumber,
        courier.carrier
      );
      setOrders((prev) => prev.map((o) => (o.orderNumber === order.orderNumber ? updated : o)));
      showToast(`Courier details saved for ${order.orderNumber}`, 'success');
    } catch (err: any) {
      showToast(`Failed to save courier: ${err.message}`, 'error');
    }
  };

  // Dispatch Email Notification to Customer
  const handleSendDispatchEmail = async (order: Order) => {
    try {
      setEmailDispatchingOrder(order.orderNumber);
      const res = await emailService.sendTransactionalEmail({
        to: order.customer.email,
        subject: `Your Rug Has Dispatched From Bhadohi · Order ${order.orderNumber}`,
        html: emailService.generateDispatchNotificationHtml(order),
        type: 'dispatch',
      });
      if (res.success) {
        showToast(`Air Waybill dispatch email sent to ${order.customer.email}`, 'success');
      } else {
        showToast(res.message || 'Dispatch notification registered', 'info');
      }
    } catch (err: any) {
      showToast(`Dispatch email failed: ${err.message}`, 'error');
    } finally {
      setEmailDispatchingOrder(null);
    }
  };

  // Delete / Purge Test Order
  const handleDeleteOrder = async (orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete test order ${orderNumber}?`)) {
      return;
    }
    try {
      await orderService.deleteOrder(orderNumber);
      setOrders((prev) => prev.filter((o) => o.orderNumber !== orderNumber));
      showToast(`Test order ${orderNumber} removed`, 'info');
    } catch (err: any) {
      showToast(`Failed to delete order: ${err.message}`, 'error');
    }
  };

  // Export Orders as CSV
  const handleExportOrdersCsv = () => {
    if (orders.length === 0) {
      showToast('No orders available to export', 'info');
      return;
    }
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Phone',
      'Destination Country',
      'Status',
      'Total USD',
      'Carrier',
      'Tracking Number',
      'Payment Provider',
      'Payment ID',
    ];
    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.date}"`,
      `"${o.customer.firstName} ${o.customer.lastName}"`,
      `"${o.customer.email}"`,
      `"${o.customer.phone || ''}"`,
      `"${o.shippingAddress.country}"`,
      `"${o.status}"`,
      o.totalUSD,
      `"${o.carrier}"`,
      `"${o.trackingNumber || ''}"`,
      `"${o.paymentProvider || 'Razorpay'}"`,
      `"${o.paymentId || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `twa_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders exported to CSV file', 'success');
  };

  // Generate Email Preview
  const handlePreviewEmail = (order: Order) => {
    const html = emailService.generateOrderConfirmationHtml(order);
    setEmailPreviewContent(html);
  };

  // Test Razorpay API Connectivity (/api/orders)
  const handleTestRazorpayApi = async () => {
    setTestingRazorpay(true);
    setRazorpayDiagResult(null);
    try {
      let token = '';
      if (isSupabaseConfigured() && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      }
      const res = await fetch('/api/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setRazorpayDiagResult(data);
      if (res.ok) {
        const count = data.count ?? (data.orders ? data.orders.length : 0);
        showToast(`Connected to Razorpay backend: ${count} orders found in memory`, 'success');
      } else {
        showToast(`Razorpay API returned status ${res.status}: ${data.error || 'Check server'}`, 'error');
      }
    } catch (err: any) {
      setRazorpayDiagResult({ error: err.message, note: 'Ensure Vite dev server or backend node server is running on port 3000/3001' });
      showToast(`Razorpay API connectivity check failed: ${err.message}`, 'error');
    } finally {
      setTestingRazorpay(false);
    }
  };

  // Send Test Alert to atelier primary email
  const handleSendTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await emailService.sendTransactionalEmail({
        to: ATELIER_PRIMARY_EMAIL,
        subject: `[PraSri Rugs Atelier] Diagnostic Pipeline Test - ${new Date().toLocaleTimeString()}`,
        html: `
          <div style="font-family: Georgia, serif; padding: 30px; background: #FAF8F5; color: #2D2B2A;">
            <h2 style="letter-spacing: 0.2em; text-transform: uppercase; color: #1A1918;">Prasri Rugs System Test</h2>
            <p>This is an automated diagnostic ping confirming that your transactional email relay is active.</p>
            <p><strong>Primary Atelier Destination:</strong> ${ATELIER_PRIMARY_EMAIL}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <hr style="border: none; border-top: 1px solid #EDE6DD; margin: 20px 0;" />
            <p style="font-size: 11px; color: #8A7B6E;">Bhadohi Loom Management System · PraSri Rugs</p>
          </div>
        `,
        type: 'order_confirmation',
      });
      if (res.success) {
        showToast(`Diagnostic email dispatched to ${ATELIER_PRIMARY_EMAIL}! Check your inbox.`, 'success');
      } else {
        showToast(`Email test: ${res.message}`, 'info');
      }
    } catch (err: any) {
      showToast(`Email test error: ${err.message}`, 'error');
    } finally {
      setTestingEmail(false);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!productSearch) return true;
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.technique.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
      );
    });
  }, [products, productSearch]);

  // Design-Card Grouped Live Stock Matrix
  const designStockList = useMemo(() => {
    return products
      .map((p) => {
        const variants = p.variants || [];
        const totalStock = variants.reduce((sum, v) => sum + getInventory(v.sku), 0);
        const outOfStockVariants = variants.filter((v) => getInventory(v.sku) === 0);
        const lowStockVariants = variants.filter((v) => {
          const qty = getInventory(v.sku);
          return qty > 0 && qty < 2;
        });
        const totalWaitlistCount = variants.reduce(
          (sum, v) => sum + (stockSubscriptions[v.sku]?.length || 0),
          0
        );

        return {
          product: p,
          variants,
          totalStock,
          outOfStockCount: outOfStockVariants.length,
          lowStockCount: lowStockVariants.length,
          totalWaitlistCount,
        };
      })
      .filter(({ product, outOfStockCount, lowStockCount }) => {
        if (inventoryFilter === 'LOW' && lowStockCount === 0) return false;
        if (inventoryFilter === 'OUT' && outOfStockCount === 0) return false;

        if (!stockSearch) return true;
        const q = stockSearch.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(q);
        const matchCollection = product.collection.toLowerCase().includes(q);
        const matchTechnique = product.technique.toLowerCase().includes(q);
        const matchSku = product.variants.some((v) => v.sku.toLowerCase().includes(q));
        return matchName || matchCollection || matchTechnique || matchSku;
      });
  }, [products, inventoryFilter, stockSearch, getInventory, stockSubscriptions]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
      if (!orderSearch) return true;
      const q = orderSearch.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.firstName.toLowerCase().includes(q) ||
        o.customer.lastName.toLowerCase().includes(q)
      );
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Bespoke Rug Instant Price Estimate
  const customEstimate = useMemo(() => {
    const sqFt = calcWidth * calcLength;
    const baseRates: Record<string, number> = {
      'Hand-Tufted': 38,
      'Hand-Knotted': 62,
      Flatweave: 28,
    };
    const rate = baseRates[calcTechnique] || 45;
    const totalUSD = Math.round(sqFt * rate);
    const weightKg = Math.round(sqFt * 0.38);
    return {
      sqFt,
      rate,
      totalUSD,
      weightKg,
      leadTime: calcTechnique === 'Hand-Knotted' ? '6–8 weeks' : '4–6 weeks',
    };
  }, [calcWidth, calcLength, calcTechnique]);

  // -------------------------------------------------------------
  // VALIDATING SESSION LOADER (Prevents UI flash or inspection race)
  // -------------------------------------------------------------
  if (isValidatingSession) {
    return (
      <div className="min-h-screen bg-atelier-ivory flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <Loader2 size={26} className="animate-spin text-atelier-taupe mx-auto" />
          <p className="text-[11px] text-atelier-charcoal font-light tracking-widest uppercase">
            Verifying Cryptographic Atelier Credentials...
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-atelier-ivory flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-atelier-cream border border-atelier-parchment p-8 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="font-serif text-2xl tracking-[0.24em] text-atelier-softblack font-normal block">
              PRASRI RUGS
            </span>
            <div className="text-[9px] tracking-[0.35em] text-atelier-taupe uppercase">
              BHADOHI · PRIVATE ATELIER PORTAL
            </div>
          </div>

          <div className="border-t border-atelier-parchment pt-6">
            <div className="flex items-center justify-center space-x-1.5 mb-2">
              <Shield size={14} className="text-atelier-darkbrown" />
              <span className="text-[10px] tracking-widest uppercase text-atelier-taupe font-medium">
                Cryptographically Secured Portal
              </span>
            </div>
            <h2 className="font-serif text-lg text-atelier-softblack font-normal text-center mb-1">
              Atelier Management Login
            </h2>
            <p className="text-xs text-atelier-charcoal/80 text-center font-light leading-relaxed">
              Restricted management console. Authorized administrator:{' '}
              <strong className="font-medium text-atelier-darkbrown">{ADMIN_EMAIL}</strong>
            </p>
            {isSupabaseConfigured() ? (
              <div className="mt-3 text-center">
                <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Supabase RLS & JWT Auth Active
                </span>
              </div>
            ) : (
              <div className="mt-3 text-center">
                <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertTriangle size={10} className="mr-1 text-amber-600" />
                  Offline Sandbox Mode (Supabase Unconfigured)
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] text-atelier-taupe tracking-widest uppercase mb-1.5 font-medium">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="prasrirugs@gmail.com"
                  className="w-full px-4 py-3 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-atelier-softblack transition-colors"
                  required
                />
                <Mail size={14} className="absolute right-3.5 top-3.5 text-atelier-taupe" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-atelier-taupe tracking-widest uppercase mb-1.5 font-medium">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Supabase account password..."
                  className="w-full px-4 py-3 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-atelier-softblack transition-colors"
                  autoFocus
                />
                <Lock size={14} className="absolute right-3.5 top-3.5 text-atelier-taupe" />
              </div>
            </div>

            {authError && (
              <div className="mt-2 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2.5 flex items-start space-x-1.5">
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 flex items-start space-x-1.5">
                <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{authSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn || isSendingOtp}
              className="w-full py-3.5 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isSigningIn ? 'Authenticating...' : 'Sign In with Password'}</span>
              <ArrowUpRight size={14} />
            </button>

            {isSupabaseConfigured() && (
              <div className="pt-2">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-atelier-parchment"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-atelier-taupe uppercase tracking-widest">
                    Or Passwordless
                  </span>
                  <div className="flex-grow border-t border-atelier-parchment"></div>
                </div>

                <button
                  type="button"
                  onClick={handleSendMagicLink}
                  disabled={isSendingOtp || isSigningIn}
                  className="w-full mt-2 py-3 bg-atelier-ivory border border-atelier-parchment text-atelier-softblack text-xs tracking-widest uppercase hover:bg-atelier-cream transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Mail size={13} className="text-atelier-taupe" />
                  <span>{isSendingOtp ? 'Dispatching Magic Link...' : 'Send Magic Link to Admin Inbox'}</span>
                </button>
              </div>
            )}
          </form>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-atelier-charcoal hover:underline">
              ← Return to public storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ATELIER CONSOLE
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-atelier-ivory text-atelier-softblack">
      {/* Top Atelier Bar */}
      <header className="bg-atelier-cream border-b border-atelier-parchment sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-lg tracking-[0.2em] text-atelier-softblack font-normal">
                PRASRI RUGS
              </span>
              <span className="block text-[8px] tracking-[0.35em] text-atelier-taupe uppercase">
                BHADOHI · MANAGEMENT CONSOLE
              </span>
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono">
              {isSupabaseConfigured() ? 'SUPABASE CLOUD LIVE' : 'OFFLINE MODE'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 text-[11px] bg-atelier-parchment/50 border border-atelier-parchment text-atelier-charcoal">
              <ShieldCheck size={12} className="text-emerald-700" />
              <span className="font-mono text-[10px]">{currentAdminUser || ADMIN_EMAIL}</span>
            </span>

            <Link
              to="/shop"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs text-atelier-charcoal hover:text-black border border-atelier-parchment bg-atelier-ivory flex items-center space-x-1.5 transition-colors"
            >
              <span>View Live Store</span>
              <ExternalLink size={12} />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs text-atelier-taupe hover:text-rose-700 transition-colors flex items-center space-x-1"
              title="Lock Console"
            >
              <Lock size={14} />
              <span className="text-[10px] uppercase tracking-wider font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 sm:space-x-8 border-t border-atelier-parchment/60">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 text-xs tracking-wider uppercase whitespace-nowrap border-b-2 font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'products'
                ? 'border-atelier-softblack text-atelier-softblack'
                : 'border-transparent text-atelier-taupe hover:text-atelier-charcoal'
            }`}
          >
            <Package size={14} />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 text-xs tracking-wider uppercase whitespace-nowrap border-b-2 font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'inventory'
                ? 'border-atelier-softblack text-atelier-softblack'
                : 'border-transparent text-atelier-taupe hover:text-atelier-charcoal'
            }`}
          >
            <Layers size={14} />
            <span>Live Stock Matrix</span>
            {metrics.outOfStockCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 text-xs tracking-wider uppercase whitespace-nowrap border-b-2 font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'orders'
                ? 'border-atelier-softblack text-atelier-softblack'
                : 'border-transparent text-atelier-taupe hover:text-atelier-charcoal'
            }`}
          >
            <Truck size={14} />
            <span>Orders & Fulfillment ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-3 text-xs tracking-wider uppercase whitespace-nowrap border-b-2 font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'quotes'
                ? 'border-atelier-softblack text-atelier-softblack'
                : 'border-transparent text-atelier-taupe hover:text-atelier-charcoal'
            }`}
          >
            <Sparkles size={14} />
            <span>Custom Rug Studio ({quotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`py-3 text-xs tracking-wider uppercase whitespace-nowrap border-b-2 font-medium transition-colors flex items-center space-x-2 ${
              activeTab === 'system'
                ? 'border-atelier-softblack text-atelier-softblack'
                : 'border-transparent text-atelier-taupe hover:text-atelier-charcoal'
            }`}
          >
            <Database size={14} />
            <span>System & Gateways</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Summary Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-atelier-cream border border-atelier-parchment p-5 space-y-1">
            <span className="text-[10px] text-atelier-taupe uppercase tracking-widest block font-medium">
              Gross Volume
            </span>
            <div className="font-serif text-2xl text-atelier-softblack">
              {formatPrice(metrics.totalRevenue)}
            </div>
            <div className="text-[11px] text-atelier-taupe">From {orders.length} total orders</div>
          </div>

          <div className="bg-atelier-cream border border-atelier-parchment p-5 space-y-1">
            <span className="text-[10px] text-atelier-taupe uppercase tracking-widest block font-medium">
              Active Client Orders
            </span>
            <div className="font-serif text-2xl text-atelier-softblack">
              {metrics.activeOrders}
            </div>
            <div className="text-[11px] text-emerald-800">
              {metrics.madeToOrderCount} on Bhadohi looms
            </div>
          </div>

          <div className="bg-atelier-cream border border-atelier-parchment p-5 space-y-1">
            <span className="text-[10px] text-atelier-taupe uppercase tracking-widest block font-medium">
              Catalog Master Works
            </span>
            <div className="font-serif text-2xl text-atelier-softblack">
              {metrics.totalProducts}
            </div>
            <div className="text-[11px] text-atelier-taupe">Rugs published across collections</div>
          </div>

          <div className="bg-atelier-cream border border-atelier-parchment p-5 space-y-1">
            <span className="text-[10px] text-atelier-taupe uppercase tracking-widest block font-medium">
              Stock Warnings
            </span>
            <div className="font-serif text-2xl text-atelier-softblack flex items-baseline space-x-2">
              <span>{metrics.outOfStockCount}</span>
              <span className="text-xs text-rose-600 font-sans font-normal">Out of Stock</span>
            </div>
            <div className="text-[11px] text-amber-700">
              {metrics.lowStockCount} SKUs low stock (&lt;2)
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- */}
        {/* TAB 1: PRODUCT CATALOG MANAGEMENT */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-atelier-cream border border-atelier-parchment p-4 sm:p-6">
              <div className="space-y-1">
                <h2 className="font-serif text-xl text-atelier-softblack font-normal">
                  Rugs & Pieces Catalog
                </h2>
                <p className="text-xs text-atelier-charcoal/80 font-light">
                  Add new handcrafted rug designs to your store, upload photos directly from your computer, edit descriptions, and configure size variant pricing.
                </p>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-3 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center space-x-2 flex-shrink-0"
              >
                <Plus size={16} />
                <span>Add New Rug</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search by rug name, collection, technique..."
                  className="w-full pl-9 pr-4 py-2.5 bg-atelier-cream border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-atelier-softblack"
                />
                <Search size={14} className="absolute left-3 top-3 text-atelier-taupe" />
              </div>
              <div className="text-xs text-atelier-taupe">
                Showing {filteredProducts.length} of {products.length} rugs
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-atelier-cream border border-atelier-parchment overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-atelier-parchment/60 text-atelier-charcoal uppercase tracking-wider text-[10px] border-b border-atelier-parchment">
                    <tr>
                      <th className="py-3.5 px-4 font-medium">Piece / Design</th>
                      <th className="py-3.5 px-4 font-medium">Collection</th>
                      <th className="py-3.5 px-4 font-medium">Technique & Material</th>
                      <th className="py-3.5 px-4 font-medium">Sizes & SKUs</th>
                      <th className="py-3.5 px-4 font-medium">Base Price</th>
                      <th className="py-3.5 px-4 font-medium">Status</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-atelier-parchment/50">
                    {filteredProducts.map((p) => {
                      const minPrice = Math.min(...p.variants.map((v) => v.priceUSD));
                      const maxPrice = Math.max(...p.variants.map((v) => v.priceUSD));
                      const totalStock = p.variants.reduce((sum, v) => sum + v.inventory, 0);

                      return (
                        <tr key={p.id} className="hover:bg-atelier-ivory/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={p.images[0]?.url || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=80'}
                                alt={p.name}
                                className="w-12 h-16 object-cover bg-atelier-ivory border border-atelier-parchment flex-shrink-0"
                              />
                              <div>
                                <div className="font-serif text-sm font-medium text-atelier-softblack">
                                  {p.name}
                                </div>
                                <div className="text-[11px] text-atelier-taupe truncate max-w-[200px]">
                                  {p.subtitle}
                                </div>
                                <div className="text-[10px] font-mono text-atelier-darkbrown">
                                  slug: /{p.slug}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-atelier-charcoal">
                            <span className="font-medium">{p.collection}</span>
                          </td>

                          <td className="py-3 px-4 text-atelier-charcoal">
                            <div>{p.technique}</div>
                            <div className="text-[11px] text-atelier-taupe truncate max-w-[180px]">
                              {p.material}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-atelier-charcoal">
                              {p.variants.length} sizes
                            </span>
                            <div className="text-[10px] text-atelier-taupe">
                              {totalStock} in stock total
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono font-medium text-atelier-softblack">
                            {formatPrice(minPrice)}
                            {minPrice !== maxPrice && ` – ${formatPrice(maxPrice)}`}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              {p.isReadyToShip ? (
                                <span className="inline-block px-1.5 py-0.5 text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 tracking-wider uppercase font-mono">
                                  Ready to Ship
                                </span>
                              ) : (
                                <span className="inline-block px-1.5 py-0.5 text-[9px] bg-amber-50 text-amber-800 border border-amber-200 tracking-wider uppercase font-mono">
                                  Made to Order
                                </span>
                              )}
                              {p.featured && (
                                <span className="inline-block px-1.5 py-0.5 text-[9px] bg-neutral-100 text-neutral-800 border border-neutral-300 tracking-wider uppercase font-mono">
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                to={`/product/${p.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-atelier-taupe hover:text-black border border-transparent hover:border-atelier-parchment"
                                title="Preview Storefront PDP"
                              >
                                <Eye size={14} />
                              </Link>

                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="p-1.5 text-atelier-charcoal hover:text-black border border-transparent hover:border-atelier-parchment"
                                title="Edit Rug Details"
                              >
                                <Edit2 size={14} />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 border border-transparent hover:border-rose-200"
                                title="Archive / Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 2: LIVE INVENTORY MATRIX */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="bg-atelier-cream border border-atelier-parchment p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="font-serif text-xl text-atelier-softblack font-normal">
                    Studio Inventory Matrix
                  </h2>
                  <p className="text-xs text-atelier-charcoal/80 font-light">
                    Catalog designs and individual size SKUs. Click any rug design card to manage its sizes, update live loom stock, or fulfill waitlists.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={expandAllDesigns}
                    className="px-3 py-1.5 text-xs bg-atelier-ivory border border-atelier-parchment text-atelier-charcoal hover:border-atelier-softblack font-mono transition-colors"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={collapseAllDesigns}
                    className="px-3 py-1.5 text-xs bg-atelier-ivory border border-atelier-parchment text-atelier-charcoal hover:border-atelier-softblack font-mono transition-colors"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Search & Filters Toolbar */}
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 pt-2 border-t border-atelier-parchment/60">
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3 top-3 text-atelier-taupe" />
                  <input
                    type="text"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    placeholder="Search by rug name, collection, or SKU code..."
                    className="w-full pl-9 pr-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack placeholder-atelier-taupe focus:outline-none focus:border-atelier-softblack font-light"
                  />
                  {stockSearch && (
                    <button
                      onClick={() => setStockSearch('')}
                      className="absolute right-2.5 top-2.5 text-atelier-taupe hover:text-black"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setInventoryFilter('ALL')}
                    className={`px-3 py-1.5 text-xs font-mono uppercase border transition-colors ${
                      inventoryFilter === 'ALL'
                        ? 'bg-atelier-softblack text-atelier-parchment border-atelier-softblack'
                        : 'bg-atelier-ivory border-atelier-parchment text-atelier-charcoal hover:border-black'
                    }`}
                  >
                    All Designs ({products.length})
                  </button>
                  <button
                    onClick={() => setInventoryFilter('LOW')}
                    className={`px-3 py-1.5 text-xs font-mono uppercase border transition-colors flex items-center space-x-1 ${
                      inventoryFilter === 'LOW'
                        ? 'bg-amber-900 text-amber-50 border-amber-900'
                        : 'bg-atelier-ivory border-amber-300 text-amber-900 hover:bg-amber-50'
                    }`}
                  >
                    <span>Low Stock (&lt;2)</span>
                  </button>
                  <button
                    onClick={() => setInventoryFilter('OUT')}
                    className={`px-3 py-1.5 text-xs font-mono uppercase border transition-colors flex items-center space-x-1 ${
                      inventoryFilter === 'OUT'
                        ? 'bg-rose-900 text-rose-50 border-rose-900'
                        : 'bg-atelier-ivory border-rose-300 text-rose-900 hover:bg-rose-50'
                    }`}
                  >
                    <span>Sold Out (0)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Design Cards Grid */}
            {designStockList.length === 0 ? (
              <div className="bg-atelier-cream border border-atelier-parchment p-12 text-center space-y-3">
                <Package size={32} className="mx-auto text-atelier-taupe" />
                <h3 className="font-serif text-lg text-atelier-softblack">No matching designs found</h3>
                <p className="text-xs text-atelier-charcoal max-w-sm mx-auto font-light">
                  No rugs matched your current filter criteria. Try clearing your search query or switching filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {designStockList.map(({ product, variants, totalStock, outOfStockCount, lowStockCount, totalWaitlistCount }) => {
                  const isExpanded = expandedDesignIds.has(product.id);
                  const firstImg = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80';

                  return (
                    <div
                      key={product.id}
                      className={`bg-atelier-cream border transition-all duration-200 ${
                        isExpanded ? 'border-atelier-softblack/70 shadow-sm' : 'border-atelier-parchment hover:border-atelier-taupe'
                      }`}
                    >
                      {/* Design Card Summary Bar (Clickable) */}
                      <div
                        onClick={() => toggleExpandDesign(product.id)}
                        className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none bg-atelier-cream hover:bg-atelier-ivory/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <img
                            src={firstImg}
                            alt={product.name}
                            className="w-14 h-16 sm:w-16 sm:h-20 object-cover bg-atelier-ivory border border-atelier-parchment flex-shrink-0"
                          />
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-serif text-base sm:text-lg text-atelier-softblack font-medium truncate">
                                {product.name}
                              </h3>
                              <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase bg-atelier-parchment/60 text-atelier-charcoal border border-atelier-parchment">
                                {product.collection}
                              </span>
                              <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase bg-atelier-ivory text-atelier-taupe border border-atelier-parchment">
                                {product.technique}
                              </span>
                            </div>
                            <p className="text-xs text-atelier-taupe font-light line-clamp-1">
                              {product.subtitle || product.materialComposition}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                              <span className="font-mono text-atelier-charcoal font-medium">
                                {variants.length} Size Variant{variants.length > 1 ? 's' : ''}
                              </span>
                              <span className="text-atelier-parchment">·</span>
                              <span className="font-mono text-atelier-darkbrown font-semibold">
                                {totalStock} Total Unit{totalStock !== 1 ? 's' : ''} in Studio
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Badges & Expand Indicator */}
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 self-end md:self-center w-full md:w-auto justify-between md:justify-end">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {totalStock === 0 ? (
                              <span className="px-2.5 py-1 text-[10px] bg-rose-100 text-rose-800 border border-rose-300 font-mono font-medium uppercase">
                                Sold Out (All Sizes)
                              </span>
                            ) : (
                              <>
                                {outOfStockCount > 0 && (
                                  <span className="px-2 py-0.5 text-[10px] bg-rose-50 text-rose-800 border border-rose-200 font-mono">
                                    {outOfStockCount} size{outOfStockCount > 1 ? 's' : ''} out of stock
                                  </span>
                                )}
                                {lowStockCount > 0 && (
                                  <span className="px-2 py-0.5 text-[10px] bg-amber-50 text-amber-900 border border-amber-300 font-mono">
                                    {lowStockCount} size{lowStockCount > 1 ? 's' : ''} low
                                  </span>
                                )}
                              </>
                            )}

                            {totalWaitlistCount > 0 && (
                              <span className="px-2 py-0.5 text-[10px] bg-purple-50 text-purple-800 border border-purple-200 font-mono flex items-center space-x-1">
                                <Mail size={10} />
                                <span>{totalWaitlistCount} waiting</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 pl-2 border-l border-atelier-parchment/60">
                            <span className="text-xs font-mono text-atelier-taupe hidden sm:inline-block">
                              {isExpanded ? 'Hide Sizes' : 'Manage Stock'}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-atelier-ivory border border-atelier-parchment flex items-center justify-center text-atelier-softblack transition-transform">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Size Variants Nested Matrix */}
                      {isExpanded && (
                        <div className="border-t border-atelier-parchment bg-atelier-ivory/50 p-4 sm:p-6 space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-atelier-parchment/60 text-xs">
                            <span className="font-serif text-atelier-softblack font-medium">
                              Size Matrix & Stock Levels for "{product.name}"
                            </span>
                            <span className="text-[11px] text-atelier-taupe font-mono">
                              Instant sync: changes save directly to catalog & store
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            {variants.map((v) => {
                              const currentStock = getInventory(v.sku);
                              const subscribers = stockSubscriptions[v.sku] || [];
                              const isUpdating = updatingStockSku === v.sku;

                              return (
                                <div
                                  key={v.sku}
                                  className="bg-atelier-cream border border-atelier-parchment p-3 sm:p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                                >
                                  {/* Size info */}
                                  <div className="flex items-center space-x-4 min-w-0">
                                    <div className="font-mono text-xs text-atelier-darkbrown font-semibold min-w-[130px]">
                                      {v.sku}
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="text-xs font-medium text-atelier-softblack">
                                        {v.size}
                                      </div>
                                      <div className="text-[11px] text-atelier-taupe font-mono">
                                        {v.dimensionsFt} · {v.weightKg || 20} kg
                                      </div>
                                    </div>
                                    <div className="pl-4 border-l border-atelier-parchment/60">
                                      <div className="font-mono text-xs font-semibold text-atelier-softblack">
                                        {formatPrice(v.priceUSD)}
                                      </div>
                                      <div className="text-[10px] text-atelier-taupe uppercase">
                                        {v.isReadyToShip ? 'Ready to Ship' : 'Made to Order'}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Stock Status Pill */}
                                  <div className="flex items-center space-x-3">
                                    {currentStock === 0 ? (
                                      <span className="inline-block px-2.5 py-1 text-[11px] bg-rose-100 text-rose-800 border border-rose-300 font-mono font-medium">
                                        Sold Out (0 units)
                                      </span>
                                    ) : currentStock === 1 ? (
                                      <span className="inline-block px-2.5 py-1 text-[11px] bg-amber-100 text-amber-900 border border-amber-300 font-mono font-medium">
                                        Only 1 Unit Left
                                      </span>
                                    ) : (
                                      <span className="inline-block px-2.5 py-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-medium">
                                        {currentStock} units in stock
                                      </span>
                                    )}

                                    {subscribers.length > 0 && (
                                      <span className="text-[11px] text-purple-700 font-mono flex items-center space-x-1" title={subscribers.join(', ')}>
                                        <Mail size={12} />
                                        <span>{subscribers.length} client waiting</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Quick Stepper + Direct Number Input */}
                                  <div className="flex items-center space-x-2 self-end lg:self-center">
                                    <div className="flex items-center border border-atelier-parchment bg-atelier-ivory">
                                      <button
                                        onClick={() => handleQuickStock(v.sku, currentStock - 1)}
                                        disabled={currentStock <= 0 || isUpdating}
                                        className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-atelier-softblack hover:bg-atelier-parchment transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Decrease Stock by 1"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        min={0}
                                        value={currentStock}
                                        onChange={(e) => handleQuickStock(v.sku, Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-14 h-8 text-center font-mono text-xs font-semibold bg-transparent border-x border-atelier-parchment focus:outline-none focus:bg-white text-atelier-softblack"
                                      />
                                      <button
                                        onClick={() => handleQuickStock(v.sku, currentStock + 1)}
                                        disabled={isUpdating}
                                        className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-atelier-softblack hover:bg-atelier-parchment transition-colors disabled:opacity-30"
                                        title="Increase Stock by 1"
                                      >
                                        +
                                      </button>
                                    </div>

                                    {/* Quick +5 & Set 0 Buttons */}
                                    <button
                                      onClick={() => handleQuickStock(v.sku, currentStock + 5)}
                                      className="px-2 py-1.5 text-[10px] font-mono uppercase bg-atelier-ivory border border-atelier-parchment text-atelier-charcoal hover:border-black transition-colors"
                                      title="Quickly add 5 units"
                                    >
                                      +5
                                    </button>
                                    {currentStock > 0 && (
                                      <button
                                        onClick={() => handleQuickStock(v.sku, 0)}
                                        className="px-2 py-1.5 text-[10px] font-mono uppercase bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors"
                                        title="Set stock to 0 (Mark sold out)"
                                      >
                                        Set 0
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 3: CUSTOMER ORDERS & FULFILLMENT */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-atelier-cream border border-atelier-parchment p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="font-serif text-xl text-atelier-softblack font-normal">
                    Orders & Atelier Fulfillment
                  </h2>
                  <p className="text-xs text-atelier-charcoal/80 font-light">
                    Track client orders, advance Bhadohi loom milestones, manage air waybill tracking numbers, and send live dispatch notices.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportOrdersCsv}
                    className="px-3.5 py-1.5 text-xs bg-atelier-ivory border border-atelier-parchment text-atelier-charcoal hover:border-black flex items-center space-x-1.5 transition-colors font-mono"
                    title="Download complete order records as spreadsheet"
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 pt-2 border-t border-atelier-parchment/60">
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3 top-3 text-atelier-taupe" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order #, client name, email, or country..."
                    className="w-full pl-9 pr-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack placeholder-atelier-taupe focus:outline-none focus:border-atelier-softblack font-light"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch('')}
                      className="absolute right-2.5 top-2.5 text-atelier-taupe hover:text-black"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['ALL', 'PROCESSING', 'IN PRODUCTION', 'QUALITY CHECK', 'DISPATCHED', 'DELIVERED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-2.5 py-1.5 text-[11px] font-mono uppercase border transition-colors ${
                        orderStatusFilter === st
                          ? 'bg-atelier-softblack text-atelier-parchment border-atelier-softblack font-medium'
                          : 'bg-atelier-ivory border-atelier-parchment text-atelier-charcoal hover:border-black'
                      }`}
                    >
                      {st === 'ALL'
                        ? `All (${orders.length})`
                        : st === 'IN PRODUCTION'
                        ? 'On Loom'
                        : st === 'QUALITY CHECK'
                        ? 'Quality'
                        : st.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-atelier-cream border border-atelier-parchment p-12 text-center space-y-3">
                <Truck size={32} className="mx-auto text-atelier-taupe" />
                <h3 className="font-serif text-lg text-atelier-softblack">No orders found</h3>
                <p className="text-xs text-atelier-charcoal max-w-sm mx-auto font-light">
                  No orders match your filter. Place a test transaction through the store checkout or adjust your search.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isUpdatingStage = orderStageUpdating === order.orderNumber;
                  const isSendingEmail = emailDispatchingOrder === order.orderNumber;
                  const currentCourier = courierInputs[order.orderNumber] || {
                    carrier: order.carrier || 'Insured Express International',
                    trackingNumber: order.trackingNumber || '',
                  };

                  return (
                    <div
                      key={order.orderNumber}
                      className="bg-atelier-cream border border-atelier-parchment p-5 sm:p-6 space-y-5 shadow-sm"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-atelier-parchment pb-4 gap-3">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-sm font-bold text-atelier-softblack">
                              {order.orderNumber}
                            </span>

                            <span
                              className={`px-2.5 py-0.5 text-[10px] font-mono tracking-wider uppercase border font-medium ${
                                order.status === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : order.status === 'DISPATCHED'
                                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                                  : order.status === 'QUALITY CHECK'
                                  ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                                  : order.status === 'IN PRODUCTION'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-neutral-100 text-neutral-900 border-neutral-300'
                              }`}
                            >
                              {order.status}
                            </span>

                            {order.isMadeToOrder && (
                              <span className="px-2 py-0.5 text-[9px] bg-purple-50 text-purple-800 border border-purple-200 font-mono uppercase">
                                Loom Bespoke
                              </span>
                            )}

                            {/* Razorpay / Gateway Verification Badge */}
                            <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono flex items-center space-x-1">
                              <ShieldCheck size={11} className="text-emerald-700" />
                              <span>{order.paymentProvider || 'Razorpay Verified'}</span>
                              {order.paymentId && (
                                <span className="text-emerald-700 font-bold">({order.paymentId})</span>
                              )}
                            </span>
                          </div>

                          <div className="text-xs text-atelier-taupe">
                            Placed on {order.date} · Client: <strong className="text-atelier-charcoal">{order.customer.firstName} {order.customer.lastName}</strong> ({order.customer.email})
                            {order.customer.phone && ` · Tel: ${order.customer.phone}`}
                          </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handlePreviewEmail(order)}
                            className="px-2.5 py-1.5 text-xs bg-atelier-ivory border border-atelier-parchment text-atelier-charcoal hover:border-black flex items-center space-x-1.5 transition-colors"
                            title="Preview client order confirmation HTML"
                          >
                            <Mail size={12} />
                            <span>Preview Email</span>
                          </button>

                          <Link
                            to={`/order-tracking?orderNumber=${order.orderNumber}&email=${order.customer.email}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 text-xs bg-atelier-softblack text-atelier-parchment hover:bg-atelier-darkbrown flex items-center space-x-1.5 transition-colors"
                            title="Open client-facing live tracking page"
                          >
                            <span>Live Tracking</span>
                            <ExternalLink size={12} />
                          </Link>

                          <button
                            onClick={() => handleDeleteOrder(order.orderNumber)}
                            className="p-1.5 text-atelier-taupe hover:text-rose-700 border border-transparent hover:border-rose-200 transition-colors"
                            title="Delete this order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Order Details & Fulfillment 3-Column Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                        {/* Col 1: Ordered Items */}
                        <div className="space-y-3 bg-atelier-ivory/60 p-4 border border-atelier-parchment/70">
                          <div className="flex items-center justify-between border-b border-atelier-parchment/60 pb-2">
                            <span className="text-[10px] text-atelier-taupe uppercase tracking-widest font-medium">
                              Ordered Rugs ({order.items.length})
                            </span>
                            <span className="font-mono text-atelier-softblack font-semibold">
                              Total: {formatPrice(order.totalUSD)}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex space-x-3 items-center bg-atelier-cream p-2 border border-atelier-parchment/50">
                                <img
                                  src={item.productImage || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=200&q=80'}
                                  alt={item.productName}
                                  className="w-10 h-12 object-cover bg-atelier-ivory border border-atelier-parchment flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-serif text-atelier-softblack font-medium truncate">
                                    {item.productName}
                                  </div>
                                  <div className="text-[11px] text-atelier-taupe font-mono">
                                    {item.size} · SKU: {item.sku}
                                  </div>
                                  <div className="text-[11px] text-atelier-charcoal font-medium">
                                    Qty: {item.quantity} · {formatPrice(item.priceUSD * item.quantity)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Col 2: Shipping Destination */}
                        <div className="space-y-3 bg-atelier-ivory/60 p-4 border border-atelier-parchment/70">
                          <span className="text-[10px] text-atelier-taupe uppercase tracking-widest block font-medium border-b border-atelier-parchment/60 pb-2">
                            Delivery Destination
                          </span>
                          <div className="text-atelier-charcoal space-y-1">
                            <div className="font-medium text-atelier-softblack">
                              {order.customer.firstName} {order.customer.lastName}
                            </div>
                            <div>{order.shippingAddress.address}</div>
                            {order.shippingAddress.apartment && <div>{order.shippingAddress.apartment}</div>}
                            <div>
                              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                              {order.shippingAddress.postalCode}
                            </div>
                            <div className="font-semibold text-atelier-softblack">
                              {order.shippingAddress.country}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-atelier-parchment/60 text-[11px] space-y-1">
                            <div className="text-atelier-taupe">
                              Courier: <strong className="text-atelier-softblack font-mono">{order.carrier}</strong>
                            </div>
                            <div className="text-atelier-darkbrown font-mono">
                              Air Waybill: <strong className="text-atelier-softblack">{order.trackingNumber || 'Pending Assignment'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Col 3: Interactive Fulfillment Controls */}
                        <div className="space-y-4 bg-atelier-cream p-4 border border-atelier-parchment">
                          {/* 1. Stage Stepper */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-atelier-taupe uppercase tracking-widest font-medium">
                                Advance Order Stage
                              </span>
                              {isUpdatingStage && (
                                <span className="text-[10px] font-mono text-atelier-darkbrown flex items-center space-x-1 animate-pulse">
                                  <RefreshCw size={10} className="animate-spin" />
                                  <span>Syncing...</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {(['PROCESSING', 'IN PRODUCTION', 'QUALITY CHECK', 'DISPATCHED', 'DELIVERED'] as const).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleUpdateOrderStatus(order.orderNumber, st)}
                                  disabled={isUpdatingStage}
                                  className={`px-2 py-1 text-[10px] border font-mono transition-colors disabled:opacity-50 ${
                                    order.status === st
                                      ? 'bg-atelier-softblack text-atelier-parchment border-atelier-softblack font-semibold'
                                      : 'bg-atelier-ivory border-atelier-parchment text-atelier-charcoal hover:border-black'
                                  }`}
                                >
                                  {st === 'IN PRODUCTION'
                                    ? 'On Loom'
                                    : st === 'QUALITY CHECK'
                                    ? 'Quality'
                                    : st === 'PROCESSING'
                                    ? 'Processing'
                                    : st === 'DISPATCHED'
                                    ? 'Dispatched'
                                    : 'Delivered'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 2. Courier & Tracking Assignment */}
                          <div className="space-y-2 pt-2 border-t border-atelier-parchment/70">
                            <span className="text-[10px] text-atelier-taupe uppercase tracking-widest block font-medium">
                              Courier & Air Waybill
                            </span>

                            <div className="space-y-1.5">
                              <select
                                value={currentCourier.carrier}
                                onChange={(e) => handleCourierInputChange(order.orderNumber, 'carrier', e.target.value)}
                                className="w-full px-2 py-1 bg-atelier-ivory border border-atelier-parchment text-[11px] text-atelier-softblack focus:outline-none focus:border-black"
                              >
                                <option value="Insured Express International">Insured Express International</option>
                                <option value="Insured Express Air">Insured Express Air</option>
                                <option value="Speed Post / EMS International">Speed Post / EMS International</option>
                                <option value="Express Air Cargo">Express Air Cargo</option>
                              </select>

                              <div className="flex space-x-1.5">
                                <input
                                  type="text"
                                  value={currentCourier.trackingNumber}
                                  onChange={(e) => handleCourierInputChange(order.orderNumber, 'trackingNumber', e.target.value)}
                                  placeholder="Enter Air Waybill tracking # (e.g. EXP-IN-9821)"
                                  className="flex-1 px-2.5 py-1 bg-atelier-ivory border border-atelier-parchment text-xs font-mono text-atelier-softblack focus:outline-none focus:border-black"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveCourierDetails(order)}
                                  className="px-2.5 py-1 bg-atelier-ivory border border-atelier-parchment hover:border-black text-atelier-charcoal hover:text-black transition-colors flex items-center space-x-1 text-xs"
                                  title="Save courier tracking details"
                                >
                                  <Save size={12} />
                                  <span>Save</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* 3. Send Dispatch Notification */}
                          <div className="pt-2 border-t border-atelier-parchment/70">
                            <button
                              type="button"
                              onClick={() => handleSendDispatchEmail(order)}
                              disabled={isSendingEmail}
                              className="w-full py-2 bg-atelier-softblack text-atelier-parchment hover:bg-atelier-darkbrown text-xs font-medium tracking-wider uppercase transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                            >
                              {isSendingEmail ? (
                                <>
                                  <RefreshCw size={12} className="animate-spin" />
                                  <span>Sending Notice...</span>
                                </>
                              ) : (
                                <>
                                  <Send size={12} />
                                  <span>Send Dispatch Email to Client</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 4: CUSTOM RUG STUDIO QUOTES & CALCULATOR */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'quotes' && (
          <div className="space-y-8">
            {/* Atelier Bespoke Calculator */}
            <div className="bg-atelier-cream border border-atelier-parchment p-6 space-y-6">
              <div className="border-b border-atelier-parchment pb-4 space-y-1">
                <span className="text-[10px] text-atelier-taupe tracking-widest uppercase font-medium">
                  Atelier Loom Estimation Engine
                </span>
                <h2 className="font-serif text-xl text-atelier-softblack font-normal">
                  Custom Rug Dimensions & Cost Calculator
                </h2>
                <p className="text-xs text-atelier-charcoal/80 font-light">
                  Use this tool to quote bespoke commissions for interior designers, architects, and private clients.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                    Width (ft)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={25}
                    value={calcWidth}
                    onChange={(e) => setCalcWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                    Length (ft)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={35}
                    value={calcLength}
                    onChange={(e) => setCalcLength(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                    Weaving Technique
                  </label>
                  <select
                    value={calcTechnique}
                    onChange={(e) => setCalcTechnique(e.target.value)}
                    className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black"
                  >
                    <option value="Hand-Tufted">Hand-Tufted ($38/sq ft)</option>
                    <option value="Hand-Knotted">Hand-Knotted ($62/sq ft)</option>
                    <option value="Flatweave">Flatweave ($28/sq ft)</option>
                  </select>
                </div>

                {/* Estimate Result Box */}
                <div className="bg-atelier-ivory border border-atelier-parchment p-4 space-y-1">
                  <span className="text-[10px] text-atelier-taupe uppercase font-mono block">
                    {customEstimate.sqFt} sq. ft. @ ${customEstimate.rate}/sq ft
                  </span>
                  <div className="font-serif text-2xl text-atelier-darkbrown font-medium">
                    {formatPrice(customEstimate.totalUSD)}
                  </div>
                  <div className="text-[10px] text-atelier-taupe font-mono">
                    Weight: ~{customEstimate.weightKg} kg · Lead: {customEstimate.leadTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="bg-atelier-cream border border-atelier-parchment p-6 space-y-4">
              <h3 className="font-serif text-lg text-atelier-softblack font-normal">
                Incoming Bespoke Quotes & Inquiries ({quotes.length})
              </h3>

              {quotes.length === 0 ? (
                <div className="p-8 text-center text-xs text-atelier-taupe">
                  No bespoke inquiries submitted yet. When visitors submit the Custom Rug Studio form on /custom-rugs, their dimensions and requirements appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-atelier-parchment/60 text-atelier-charcoal uppercase tracking-wider text-[10px] border-b border-atelier-parchment">
                      <tr>
                        <th className="py-3 px-4 font-medium">Client Name</th>
                        <th className="py-3 px-4 font-medium">Dimensions</th>
                        <th className="py-3 px-4 font-medium">Technique & Material</th>
                        <th className="py-3 px-4 font-medium">Color Palette</th>
                        <th className="py-3 px-4 font-medium">Budget USD</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-atelier-parchment/50">
                      {quotes.map((q) => (
                        <tr key={q.id} className="hover:bg-atelier-ivory/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-atelier-softblack">{q.fullName}</div>
                            <div className="text-[11px] text-atelier-taupe font-mono">{q.email}</div>
                          </td>

                          <td className="py-3 px-4 font-mono">
                            {q.width}' × {q.length}'
                            <div className="text-[10px] text-atelier-taupe">
                              {q.width * q.length} sq. ft.
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div>{q.technique}</div>
                            <div className="text-[11px] text-atelier-taupe">{q.material}</div>
                          </td>

                          <td className="py-3 px-4 text-atelier-charcoal">
                            {q.colorPreference || 'Atelier Standard'}
                          </td>

                          <td className="py-3 px-4 font-mono font-medium">
                            {q.estimatedPriceUSD?.min ? formatPrice(q.estimatedPriceUSD.min) : 'Flexible'}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-mono uppercase border ${
                                q.status === 'Production Scheduled'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : q.status === 'Quotation Sent'
                                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                                  : 'bg-amber-50 text-amber-900 border-amber-300'
                              }`}
                            >
                              {q.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                const newStatus: any =
                                  q.status === 'Received'
                                    ? 'Reviewing'
                                    : q.status === 'Reviewing'
                                    ? 'Quotation Sent'
                                    : 'Production Scheduled';
                                quoteService.updateQuoteStatus(q.referenceNumber, newStatus).then(() => {
                                  loadOrdersAndQuotes();
                                });
                              }}
                              className="px-2.5 py-1 text-[10px] bg-atelier-ivory border border-atelier-parchment hover:border-black uppercase font-mono"
                            >
                              Advance Stage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 5: SYSTEM ARCHITECTURE & CREDENTIALS */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-atelier-cream border border-atelier-parchment p-6 space-y-4">
              <h2 className="font-serif text-xl text-atelier-softblack font-normal">
                Backend Infrastructure & Services Status
              </h2>
              <p className="text-xs text-atelier-charcoal/80 font-light leading-relaxed">
                Prasri Rugs is architected with complete dual-mode resilience. When live credentials are supplied in your environment variables, the platform seamlessly runs on PostgreSQL and real gateways. If credentials are empty, the atelier runs in a secure, persistent local sandbox without any runtime disruption.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Supabase Database */}
              <div className="bg-atelier-cream border border-atelier-parchment p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database size={18} className="text-atelier-darkbrown" />
                    <h3 className="font-serif text-base text-atelier-softblack font-normal">
                      Supabase Database
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-mono uppercase border ${
                      isSupabaseConfigured()
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                    }`}
                  >
                    {isSupabaseConfigured() ? 'Connected' : 'Local Sandbox'}
                  </span>
                </div>
                <p className="text-xs text-atelier-charcoal/80 leading-relaxed font-light">
                  Stores products, size variants, orders, customer details, custom quote requests, and stock subscriptions in PostgreSQL with Row Level Security.
                </p>
                <div className="text-[10px] font-mono text-atelier-taupe bg-atelier-ivory p-2.5 border border-atelier-parchment">
                  Schema: supabase/migrations/20260915_init_schema.sql
                </div>
              </div>

              {/* Payment Gateways */}
              <div className="bg-atelier-cream border border-atelier-parchment p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign size={18} className="text-atelier-darkbrown" />
                    <h3 className="font-serif text-base text-atelier-softblack font-normal">
                      Payment Gateway
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs text-atelier-charcoal/80 leading-relaxed font-light">
                  Stripe Elements for worldwide credit/debit cards, Apple Pay, Google Pay + Razorpay for India UPI/Netbanking.
                </p>
                <div className="text-[10px] font-mono text-atelier-taupe bg-atelier-ivory p-2.5 border border-atelier-parchment">
                  Status: {paymentService.getStatus().isSandboxMode ? 'Verified Sandbox Engine' : 'Production Gateway'}
                </div>
              </div>

              {/* Transactional Emails */}
              <div className="bg-atelier-cream border border-atelier-parchment p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail size={18} className="text-atelier-darkbrown" />
                    <h3 className="font-serif text-base text-atelier-softblack font-normal">
                      Transactional Email
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-atelier-charcoal/80 leading-relaxed font-light">
                  Generates luxury HTML confirmation emails, dispatch notices with tracking, bespoke quote proposals, and back-in-stock alerts.
                </p>
                <div className="text-[10px] font-mono text-atelier-taupe bg-atelier-ivory p-2.5 border border-atelier-parchment">
                  Service: Resend / SMTP Compliant
                </div>
              </div>
            </div>

            {/* Live Gateway Diagnostics & Testing Suite */}
            <div className="bg-atelier-cream border border-atelier-parchment p-6 space-y-5">
              <div className="space-y-1 border-b border-atelier-parchment pb-3">
                <h3 className="font-serif text-base text-atelier-softblack font-normal flex items-center space-x-2">
                  <ShieldCheck size={18} className="text-atelier-darkbrown" />
                  <span>Live Gateways & Connectivity Diagnostics</span>
                </h3>
                <p className="text-xs text-atelier-charcoal/80 font-light">
                  Test live backend API endpoints, inspect registered Razorpay payments, and verify real-time email delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Razorpay Test Box */}
                <div className="bg-atelier-ivory border border-atelier-parchment p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm text-atelier-softblack font-medium">Razorpay Backend API</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-atelier-parchment/60 text-atelier-charcoal">
                        /api/orders
                      </span>
                    </div>
                    <p className="text-xs text-atelier-charcoal/80 font-light leading-relaxed">
                      Queries the local Razorpay webhook & verification backend running on port 3000 to fetch active transactions and test signature verification health.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleTestRazorpayApi}
                      disabled={testingRazorpay}
                      className="w-full px-4 py-2.5 bg-atelier-softblack text-atelier-parchment text-xs uppercase tracking-wider font-mono hover:bg-atelier-darkbrown transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {testingRazorpay ? <RefreshCw size={13} className="animate-spin" /> : <Database size={13} />}
                      <span>{testingRazorpay ? 'Pinging /api/orders...' : 'Test Razorpay API Connectivity'}</span>
                    </button>
                  </div>

                  {razorpayDiagResult && (
                    <div className="mt-3 p-3 bg-white border border-atelier-parchment text-[11px] font-mono space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-atelier-softblack pb-1 border-b border-atelier-parchment">
                        <span>Backend Status:</span>
                        <span className={razorpayDiagResult.error ? 'text-rose-600' : 'text-emerald-700'}>
                          {razorpayDiagResult.error ? 'Error' : '200 OK'}
                        </span>
                      </div>
                      {razorpayDiagResult.error ? (
                        <p className="text-rose-600 pt-1">{razorpayDiagResult.error}</p>
                      ) : (
                        <div className="space-y-1 text-atelier-charcoal pt-1">
                          <div>Orders in backend memory: <strong>{razorpayDiagResult.count ?? (razorpayDiagResult.orders ? razorpayDiagResult.orders.length : 0)}</strong></div>
                          {razorpayDiagResult.orders && razorpayDiagResult.orders.length > 0 && (
                            <div className="text-[10px] text-atelier-taupe truncate">
                              Latest: {razorpayDiagResult.orders[0].receipt || razorpayDiagResult.orders[0].order_id || 'Active'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Email Test Box */}
                <div className="bg-atelier-ivory border border-atelier-parchment p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm text-atelier-softblack font-medium">Transactional Email Relay</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-atelier-parchment/60 text-atelier-charcoal">
                        Direct Gmail SMTP
                      </span>
                    </div>
                    <p className="text-xs text-atelier-charcoal/80 font-light leading-relaxed">
                      Sends a real diagnostic dispatch alert directly to your atelier inbox (<strong className="font-mono text-atelier-darkbrown">{ATELIER_PRIMARY_EMAIL}</strong>) to confirm email delivery.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSendTestEmail}
                      disabled={testingEmail}
                      className="w-full px-4 py-2.5 bg-atelier-ivory border border-atelier-softblack text-atelier-softblack text-xs uppercase tracking-wider font-mono hover:bg-atelier-softblack hover:text-atelier-parchment transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {testingEmail ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>{testingEmail ? 'Sending Test Alert...' : `Send Test Alert to ${ATELIER_PRIMARY_EMAIL}`}</span>
                    </button>
                  </div>

                  <div className="mt-2 text-[10px] text-atelier-taupe font-mono">
                    All client messages, custom rug inquiries, and order confirmations route to this address.
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Setup Instructions Box */}
            <div className="bg-atelier-cream border border-atelier-parchment p-6 space-y-4">
              <h3 className="font-serif text-base text-atelier-softblack font-normal flex items-center space-x-2">
                <Key size={16} />
                <span>How to connect your live Supabase & Payment keys</span>
              </h3>
              <p className="text-xs text-atelier-charcoal leading-relaxed font-light">
                Open the file <code className="font-mono bg-atelier-ivory px-1.5 py-0.5 border border-atelier-parchment text-atelier-darkbrown">.env</code> in your root directory and paste your production keys:
              </p>
              <pre className="bg-atelier-ivory p-4 text-[11px] font-mono text-atelier-charcoal border border-atelier-parchment overflow-x-auto">
{`# 1. Supabase Credentials (from your supabase.com project settings)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# 2. Stripe Elements (from dashboard.stripe.com)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51...

# 3. Razorpay (for India UPI payments)
VITE_RAZORPAY_KEY_ID=rzp_live_...`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PRODUCT DRAWER */}
      {/* ------------------------------------------------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-atelier-softblack/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-atelier-cream border border-atelier-parchment max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-atelier-parchment flex items-center justify-between bg-atelier-ivory">
              <div>
                <h3 className="font-serif text-xl text-atelier-softblack font-normal">
                  {editingProductId ? 'Edit Rug Masterpiece' : 'Add New Rug to Catalog'}
                </h3>
                <p className="text-xs text-atelier-taupe">
                  Configure design specs, storytelling copy, photography, and individual size variant pricing.
                </p>
              </div>

              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-atelier-taupe hover:text-atelier-softblack"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 text-xs">
              {/* SECTION 1: Core Design Information */}
              <div className="space-y-4">
                <h4 className="font-serif text-base text-atelier-softblack border-b border-atelier-parchment pb-2 font-normal">
                  1. Core Design & Taxonomy
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                      Rug Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Kashi Reverie Rug"
                      className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black font-serif text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                      Subtitle / Headline
                    </label>
                    <input
                      type="text"
                      value={prodSubtitle}
                      onChange={(e) => setProdSubtitle(e.target.value)}
                      placeholder="e.g. Sculptural Wool Relief in Warm Parchment"
                      className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodSlug}
                      onChange={(e) => setProdSlug(e.target.value)}
                      placeholder="e.g. kashi-reverie-rug"
                      className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                      Collection
                    </label>
                    <select
                      value={prodCollectionSlug}
                      onChange={(e) => {
                        const slug = e.target.value as CollectionSlug;
                        setProdCollectionSlug(slug);
                        const names: Record<CollectionSlug, string> = {
                          'modern-forms': 'Modern Forms',
                          'quiet-neutrals': 'Quiet Neutrals',
                          'botanical-studies': 'Botanical Studies',
                          'heritage-reimagined': 'Heritage Reimagined',
                          'texture-sculpture': 'Texture & Sculpture',
                          'hand-knotted-collection': 'Hand-Knotted Collection',
                        };
                        setProdCollection(names[slug] || 'Modern Forms');
                      }}
                      className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black"
                    >
                      <option value="modern-forms">Modern Forms</option>
                      <option value="quiet-neutrals">Quiet Neutrals</option>
                      <option value="botanical-studies">Botanical Studies</option>
                      <option value="heritage-reimagined">Heritage Reimagined</option>
                      <option value="texture-sculpture">Texture & Sculpture</option>
                      <option value="hand-knotted-collection">Hand-Knotted Collection</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Craftsmanship & Materials */}
              <div className="space-y-4">
                <h4 className="font-serif text-base text-atelier-softblack border-b border-atelier-parchment pb-2 font-normal">
                  2. Weaving Technique & Material Composition
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                      Weaving Technique
                    </label>
                    <select
                      value={prodTechnique}
                      onChange={(e) => setProdTechnique(e.target.value as Technique)}
                      className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black"
                    >
                      <option value="Hand-Tufted">Hand-Tufted</option>
                      <option value="Hand-Knotted">Hand-Knotted</option>
                      <option value="Flatweave">Flatweave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                      Material Category
                    </label>
                    <select
                      value={prodMaterial}
                      onChange={(e) => setProdMaterial(e.target.value as Material)}
                      className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black"
                    >
                      <option value="Blended Wool">Blended Wool</option>
                      <option value="100% Pure Wool">100% Pure Wool</option>
                      <option value="Wool & Botanical Silk">Wool & Botanical Silk</option>
                      <option value="New Zealand Wool & Viscose">New Zealand Wool & Viscose</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                      Material Breakdown / Composition
                    </label>
                    <input
                      type="text"
                      value={prodMaterialComp}
                      onChange={(e) => setProdMaterialComp(e.target.value)}
                      placeholder="e.g. 85% New Zealand Blended Wool, 15% Botanical Silk"
                      className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                      Color Palette (comma separated)
                    </label>
                    <input
                      type="text"
                      value={prodColors}
                      onChange={(e) => setProdColors(e.target.value)}
                      placeholder="e.g. Warm Ivory, Parchment, Taupe"
                      className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                      Pile Height / Knot Density
                    </label>
                    <input
                      type="text"
                      value={prodPileHeight}
                      onChange={(e) => setProdPileHeight(e.target.value)}
                      placeholder="e.g. 12–14mm variable relief"
                      className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Editorial Narrative */}
              <div className="space-y-4">
                <h4 className="font-serif text-base text-atelier-softblack border-b border-atelier-parchment pb-2 font-normal">
                  3. Editorial Narrative & Care Instructions
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                      Description & Aesthetic Statement
                    </label>
                    <textarea
                      rows={3}
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      placeholder="Describe the aesthetic, textural relief, and living spaces it suits..."
                      className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                        Craft Notes (Bhadohi Studio Process)
                      </label>
                      <textarea
                        rows={2}
                        value={prodCraftNotes}
                        onChange={(e) => setProdCraftNotes(e.target.value)}
                        placeholder="e.g. Purified soft-water wash, open sun dried, hand-sheared..."
                        className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-atelier-taupe uppercase tracking-wider mb-1 font-medium">
                        Care Instructions
                      </label>
                      <textarea
                        rows={2}
                        value={prodCareSummary}
                        onChange={(e) => setProdCareSummary(e.target.value)}
                        placeholder="Vacuuming guidelines, spot cleaning instructions..."
                        className="w-full px-3 py-2 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-softblack focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Photography (Local Upload & URL) */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-atelier-parchment pb-2 gap-2">
                  <div>
                    <h4 className="font-serif text-base text-atelier-softblack font-normal flex items-center space-x-2">
                      <ImageIcon size={16} />
                      <span>4. Photography & Imagery ({imagesList.length} photos)</span>
                    </h4>
                    <p className="text-[11px] text-atelier-taupe">
                      Upload photos directly from your computer or provide web image URLs.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Upload from Computer Button */}
                    <button
                      type="button"
                      disabled={isProcessingUpload}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-atelier-softblack text-atelier-parchment text-xs font-medium hover:bg-atelier-darkbrown transition-colors flex items-center space-x-1.5 shadow-sm"
                    >
                      <Upload size={13} />
                      <span>{isProcessingUpload ? 'Optimizing Photo...' : 'Upload from Device'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddImageRow}
                      className="px-3 py-1.5 bg-atelier-ivory border border-atelier-parchment text-xs text-atelier-charcoal hover:border-black flex items-center space-x-1 transition-colors"
                    >
                      <Plus size={12} />
                      <span>Add URL Field</span>
                    </button>
                  </div>
                </div>

                {/* Local Upload Dropzone Banner */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-atelier-parchment hover:border-atelier-taupe bg-atelier-ivory/60 hover:bg-atelier-ivory p-5 text-center cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="w-9 h-9 mx-auto rounded-full bg-atelier-parchment/60 flex items-center justify-center text-atelier-darkbrown">
                    <Upload size={16} />
                  </div>
                  <div className="font-serif text-sm text-atelier-softblack font-medium">
                    Click here to choose rug photos from your computer
                  </div>
                  <p className="text-[11px] text-atelier-taupe font-light">
                    Supports JPEG, PNG, WebP, HEIC. High-res images are automatically optimized and embedded into your atelier catalog.
                  </p>
                </div>

                {/* Photo List & Perspective Selectors */}
                <div className="space-y-3">
                  {imagesList.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-atelier-parchment bg-atelier-cream/40 space-y-1">
                      <p className="font-serif text-xs text-atelier-softblack font-medium">No photographs attached yet</p>
                      <p className="text-[11px] text-atelier-taupe font-light">
                        Upload photos from your computer above or click &ldquo;+ Add Photo by URL&rdquo; below.
                      </p>
                    </div>
                  ) : (
                    imagesList.map((img, idx) => (
                    <div
                      key={img.id}
                      className="p-3 bg-atelier-ivory border border-atelier-parchment flex items-start space-x-3 transition-colors hover:border-atelier-taupe"
                    >
                      {/* Image Thumbnail with Perspective Badge Preview */}
                      <div className="relative w-16 h-20 bg-neutral-100 border border-atelier-parchment flex-shrink-0 overflow-hidden group">
                        <img
                          src={img.url || 'https://via.placeholder.com/80x100?text=No+Image'}
                          alt={img.label}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-atelier-softblack/80 text-[8px] text-white px-0.5 py-0.5 text-center truncate uppercase tracking-wider font-medium">
                          {img.label || getPerspectiveBadge(img.viewType)}
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        {/* Source Status or Web URL (5 cols) */}
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] text-atelier-taupe uppercase mb-0.5 font-medium">
                            {img.url.startsWith('data:') ? 'Local Image (Device Photo)' : 'Image URL'}
                          </label>
                          {img.url.startsWith('data:') ? (
                            <div className="w-full px-2.5 py-1.5 bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
                              <span className="font-mono text-[10px] truncate">✓ Local Photo Embedded</span>
                              <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5">
                                Ready
                              </span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={img.url}
                              onChange={(e) => handleUpdateImageField(idx, 'url', e.target.value)}
                              placeholder="https://..."
                              className="w-full px-2.5 py-1.5 bg-atelier-cream border border-atelier-parchment text-[11px] font-mono focus:outline-none focus:border-black"
                            />
                          )}
                        </div>

                        {/* Perspective View Dropdown (4 cols) */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] text-atelier-taupe uppercase mb-0.5 font-medium">
                            Perspective View
                          </label>
                          <select
                            value={img.viewType}
                            onChange={(e) => handleUpdateImageField(idx, 'viewType', e.target.value)}
                            className="w-full px-2 py-1.5 bg-atelier-cream border border-atelier-parchment text-[11px] focus:outline-none focus:border-black"
                          >
                            {PERSPECTIVE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Storefront Badge / Label (3 cols) */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-atelier-taupe uppercase mb-0.5 font-medium">
                            Storefront Badge
                          </label>
                          <input
                            type="text"
                            value={img.label}
                            onChange={(e) => handleUpdateImageField(idx, 'label', e.target.value)}
                            placeholder={getPerspectiveBadge(img.viewType)}
                            className="w-full px-2.5 py-1.5 bg-atelier-cream border border-atelier-parchment text-[11px] focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveImageRow(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 self-center"
                        title="Remove photograph"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )))}
                </div>
              </div>

              {/* SECTION 5: Size Variant Matrix Builder */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-atelier-parchment pb-2 gap-2">
                  <div>
                    <h4 className="font-serif text-base text-atelier-softblack font-normal">
                      5. Size Variant Matrix & Stock Allocation
                    </h4>
                    <p className="text-[11px] text-atelier-taupe">
                      Define sizes, unique SKUs, retail pricing in USD, and initial stock count.
                    </p>
                  </div>

                  {/* Quick Add Presets */}
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] text-atelier-taupe uppercase self-center mr-1">Quick Add:</span>
                    <button
                      type="button"
                      onClick={() => handleAddVariantPreset("5' × 8'", "5' × 8' (152 × 244 cm)", 1850, 18)}
                      className="px-2 py-1 bg-atelier-ivory border border-atelier-parchment text-[10px] font-mono hover:border-black"
                    >
                      + 5×8
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddVariantPreset("6' × 9'", "6' × 9' (183 × 274 cm)", 2450, 24)}
                      className="px-2 py-1 bg-atelier-ivory border border-atelier-parchment text-[10px] font-mono hover:border-black"
                    >
                      + 6×9
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddVariantPreset("8' × 10'", "8' × 10' (244 × 305 cm)", 3400, 32)}
                      className="px-2 py-1 bg-atelier-ivory border border-atelier-parchment text-[10px] font-mono hover:border-black"
                    >
                      + 8×10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddVariantPreset("9' × 12'", "9' × 12' (274 × 366 cm)", 4600, 42)}
                      className="px-2 py-1 bg-atelier-ivory border border-atelier-parchment text-[10px] font-mono hover:border-black"
                    >
                      + 9×12
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddVariantPreset("10' × 14'", "10' × 14' (305 × 427 cm)", 5950, 52)}
                      className="px-2 py-1 bg-atelier-ivory border border-atelier-parchment text-[10px] font-mono hover:border-black"
                    >
                      + 10×14
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddVariantPreset("2.5' × 10' Runner", "2.5' × 10' (76 × 305 cm)", 1250, 12)}
                      className="px-2 py-1 bg-atelier-ivory border border-atelier-parchment text-[10px] font-mono hover:border-black"
                    >
                      + Runner
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {variantsList.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="p-3 bg-atelier-ivory border border-atelier-parchment grid grid-cols-2 sm:grid-cols-6 gap-3 items-center"
                    >
                      <div>
                        <label className="block text-[10px] text-atelier-taupe uppercase mb-0.5 font-medium">
                          Size
                        </label>
                        <input
                          type="text"
                          value={v.size}
                          onChange={(e) => handleUpdateVariantField(idx, 'size', e.target.value)}
                          className="w-full px-2 py-1 bg-atelier-cream border border-atelier-parchment text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-atelier-taupe uppercase mb-0.5 font-medium">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleUpdateVariantField(idx, 'sku', e.target.value)}
                          className="w-full px-2 py-1 bg-atelier-cream border border-atelier-parchment text-[11px] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-atelier-taupe uppercase mb-0.5 font-medium">
                          Price (USD $)
                        </label>
                        <input
                          type="number"
                          value={v.priceUSD}
                          onChange={(e) => handleUpdateVariantField(idx, 'priceUSD', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-atelier-cream border border-atelier-parchment text-xs font-mono font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-atelier-taupe uppercase mb-0.5 font-medium">
                          Stock (Units)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={v.inventory}
                          onChange={(e) => handleUpdateVariantField(idx, 'inventory', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-atelier-cream border border-atelier-parchment text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-atelier-taupe uppercase mb-0.5 font-medium">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={v.weightKg || 20}
                          onChange={(e) => handleUpdateVariantField(idx, 'weightKg', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-atelier-cream border border-atelier-parchment text-xs font-mono"
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-3 sm:pt-0">
                        <label className="flex items-center space-x-1 text-[10px] text-atelier-charcoal cursor-pointer">
                          <input
                            type="checkbox"
                            checked={v.isReadyToShip}
                            onChange={(e) => handleUpdateVariantField(idx, 'isReadyToShip', e.target.checked)}
                            className="rounded border-atelier-parchment"
                          />
                          <span>Ready</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Remove size"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 6: Storefront Badges & Flags */}
              <div className="p-4 bg-atelier-ivory border border-atelier-parchment flex flex-wrap gap-6 items-center">
                <span className="text-[11px] text-atelier-taupe uppercase tracking-wider font-medium">
                  Storefront Badges:
                </span>
                <label className="flex items-center space-x-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="rounded border-atelier-parchment text-black"
                  />
                  <span>Featured Piece (Homepage Spotlight)</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={prodBestSeller}
                    onChange={(e) => setProdBestSeller(e.target.checked)}
                    className="rounded border-atelier-parchment text-black"
                  />
                  <span>Bestseller</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={prodIsNew}
                    onChange={(e) => setProdIsNew(e.target.checked)}
                    className="rounded border-atelier-parchment text-black"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-atelier-parchment flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 text-xs text-atelier-charcoal hover:text-black border border-atelier-parchment bg-atelier-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 bg-atelier-softblack text-atelier-parchment text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center space-x-2"
                >
                  <Check size={14} />
                  <span>{editingProductId ? 'Update Rug Masterpiece' : 'Publish Rug to Storefront'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: TRANSACTIONAL EMAIL PREVIEW */}
      {/* ------------------------------------------------------------- */}
      {emailPreviewContent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-atelier-softblack/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-atelier-parchment max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 bg-atelier-softblack text-atelier-parchment flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span className="font-serif text-sm">Client Email Dispatch Preview</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(emailPreviewContent);
                    setEmailCopied(true);
                    setTimeout(() => setEmailCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 text-[11px] bg-neutral-800 text-neutral-200 hover:bg-neutral-700 flex items-center space-x-1"
                >
                  {emailCopied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{emailCopied ? 'Copied HTML' : 'Copy HTML'}</span>
                </button>
                <button
                  onClick={() => setEmailPreviewContent(null)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-neutral-100">
              <div
                className="bg-white shadow-sm p-4 rounded"
                dangerouslySetInnerHTML={{ __html: emailPreviewContent }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FLOATING TOAST NOTIFICATIONS */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-md w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 shadow-xl border text-xs transition-all transform animate-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-atelier-softblack text-atelier-parchment border-atelier-parchment/40'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-50 border-rose-600'
                : 'bg-atelier-ivory text-atelier-softblack border-atelier-parchment'
            }`}
          >
            <div className="flex items-center space-x-3">
              {toast.type === 'success' && <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />}
              {toast.type === 'info' && <RefreshCw size={16} className="text-atelier-darkbrown flex-shrink-0" />}
              <span className="font-mono">{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-3 text-atelier-taupe hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
