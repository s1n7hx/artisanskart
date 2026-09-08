import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Code,
  Copy,
  Check,
  Sparkles,
  Layers,
  Edit3,
  ExternalLink,
  BookOpen,
  Sliders,
  Save,
  RotateCcw,
  Plus,
  Image as ImageIcon,
  HelpCircle,
  Package,
  Download,
  FolderArchive,
  FileCode,
  ArrowDownToLine,
  CheckCircle,
  Upload,
  Zap,
  Activity,
  MousePointer,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { testWordPressApi, getWordPressPhpSnippet } from '../services/wordpress';
import { generateClientThemeZip } from '../services/themeGenerator';

interface WordPressSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIdForEdit?: number | null;
}

const PHOTO_PRESETS = [
  {
    name: 'Terracotta Pottery',
    url: 'https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    cat: 'Clay & Pottery',
  },
  {
    name: 'Watercolor Floral Artwork',
    url: 'https://images.pexels.com/photos/4006576/pexels-photo-4006576.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    cat: 'Fine Art',
  },
  {
    name: 'Handmade Beaded Jewelry',
    url: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    cat: 'Accessories',
  },
  {
    name: 'Artisan Ceramic Cups',
    url: 'https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    cat: 'Ceramics',
  },
  {
    name: 'Hand-woven Macrame & Craft',
    url: 'https://images.pexels.com/photos/4587955/pexels-photo-4587955.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    cat: 'Textiles',
  },
  {
    name: 'Carved Wooden Coasters',
    url: 'https://images.pexels.com/photos/1797103/pexels-photo-1797103.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    cat: 'Woodcraft',
  },
];

export const WordPressSyncModal: React.FC<WordPressSyncModalProps> = ({
  isOpen,
  onClose,
  selectedProductIdForEdit,
}) => {
  const {
    products,
    wpConfig,
    updateWpConfig,
    syncWithWordPress,
    updateProduct,
    addNewProduct,
    resetProductsToDefault,
    heroContent,
    updateHeroContent,
    resetHeroToDefault,
    animationSettings,
    updateAnimationSettings,
    resetAnimationToDefault,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'theme-upload' | 'editor' | 'media-studio' | 'motion-studio' | 'connection' | 'guide'>(
    selectedProductIdForEdit ? 'editor' : 'theme-upload'
  );

  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  // Connection settings state
  const [urlInput, setUrlInput] = useState(wpConfig.url || '');
  const [postType, setPostType] = useState<'posts' | 'products' | 'custom'>(wpConfig.postType || 'posts');
  const [customEndpoint, setCustomEndpoint] = useState(wpConfig.customEndpoint || '');
  const [autoSync, setAutoSync] = useState(wpConfig.autoSync || false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    siteName?: string;
    postCount?: number;
  } | null>(null);

  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Live Editor state
  const [selectedProdId, setSelectedProdId] = useState<number>(
    selectedProductIdForEdit || (products[0]?.id ?? 1)
  );

  const currentProduct = products.find((p) => p.id === selectedProdId) || products[0];

  // Edit form state
  const [editTitle, setEditTitle] = useState(currentProduct?.title || '');
  const [editDesc, setEditDesc] = useState(currentProduct?.description || '');
  const [editPrice, setEditPrice] = useState(currentProduct?.price || 349);
  const [editCategory, setEditCategory] = useState(currentProduct?.category || 'Clay Crafts');
  const [editMaker, setEditMaker] = useState(currentProduct?.maker || '');
  const [editCls, setEditCls] = useState(currentProduct?.cls || '');
  const [editSchool, setEditSchool] = useState(currentProduct?.school || '');
  const [editStock, setEditStock] = useState(currentProduct?.stock || 'Made on Demand');
  const [editImage, setEditImage] = useState(currentProduct?.image || '');

  // Hero Content Studio form state
  const [heroMainImg, setHeroMainImg] = useState(heroContent.mainImage);
  const [heroLeftImg, setHeroLeftImg] = useState(heroContent.leftImage);
  const [heroRightImg, setHeroRightImg] = useState(heroContent.rightImage);
  const [heroBadge, setHeroBadge] = useState(heroContent.badgeText);
  const [heroHead1, setHeroHead1] = useState(heroContent.headlineLine1);
  const [heroHead2, setHeroHead2] = useState(heroContent.headlineLine2);
  const [heroHead3, setHeroHead3] = useState(heroContent.headlineLine3);
  const [heroSub, setHeroSub] = useState(heroContent.subhead);
  const [heroMainLabel, setHeroMainLabel] = useState(heroContent.mainTag);
  const [heroLeftLabel, setHeroLeftLabel] = useState(heroContent.leftTag);
  const [heroRightLabel, setHeroRightLabel] = useState(heroContent.rightTag);

  // Motion Studio form state
  const [marqueeSpeed, setMarqueeSpeed] = useState(animationSettings.marqueeSpeed);
  const [enableMagnet, setEnableMagnet] = useState(animationSettings.enableMagnet);
  const [enableFloating, setEnableFloating] = useState(animationSettings.enableFloatingBadges);
  const [enableReveal, setEnableReveal] = useState(animationSettings.enableScrollReveal);

  // Keep form in sync when changing selected product
  useEffect(() => {
    if (currentProduct) {
      setEditTitle(currentProduct.title);
      setEditDesc(currentProduct.description || '');
      setEditPrice(currentProduct.price);
      setEditCategory(currentProduct.category);
      setEditMaker(currentProduct.maker);
      setEditCls(currentProduct.cls);
      setEditSchool(currentProduct.school);
      setEditStock(currentProduct.stock);
      setEditImage(currentProduct.image);
    }
  }, [selectedProdId, currentProduct]);

  // Sync Hero state with context when heroContent changes
  useEffect(() => {
    setHeroMainImg(heroContent.mainImage);
    setHeroLeftImg(heroContent.leftImage);
    setHeroRightImg(heroContent.rightImage);
    setHeroBadge(heroContent.badgeText);
    setHeroHead1(heroContent.headlineLine1);
    setHeroHead2(heroContent.headlineLine2);
    setHeroHead3(heroContent.headlineLine3);
    setHeroSub(heroContent.subhead);
    setHeroMainLabel(heroContent.mainTag);
    setHeroLeftLabel(heroContent.leftTag);
    setHeroRightLabel(heroContent.rightTag);
  }, [heroContent]);

  // Sync Motion state
  useEffect(() => {
    setMarqueeSpeed(animationSettings.marqueeSpeed);
    setEnableMagnet(animationSettings.enableMagnet);
    setEnableFloating(animationSettings.enableFloatingBadges);
    setEnableReveal(animationSettings.enableScrollReveal);
  }, [animationSettings]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setter(event.target.result as string);
          showToast('Image uploaded and loaded into preview!', 'check-circle-2');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      showToast('Please enter your WordPress URL first.', 'alert-circle');
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    const result = await testWordPressApi(urlInput);
    setIsTesting(false);
    setTestResult({
      tested: true,
      success: result.success,
      message: result.message,
      siteName: result.siteName,
      postCount: result.postCount,
    });

    if (result.success) {
      updateWpConfig({
        url: urlInput,
        postType,
        customEndpoint,
        autoSync,
        isConnected: true,
        status: 'connected',
      });
      showToast('WordPress site connected successfully!', 'check-circle-2');
    } else {
      showToast('Connection failed. Check details in the modal.', 'alert-circle');
    }
  };

  const handleSaveConnectionAndSync = async () => {
    updateWpConfig({
      url: urlInput,
      postType,
      customEndpoint,
      autoSync,
    });
    const success = await syncWithWordPress(urlInput);
    if (success) {
      showToast('Products and descriptions synced with WordPress!', 'sparkles');
    }
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    const updated: Product = {
      ...currentProduct,
      title: editTitle,
      description: editDesc,
      price: Number(editPrice) || 0,
      category: editCategory,
      maker: editMaker,
      cls: editCls,
      school: editSchool,
      stock: editStock,
      image: editImage,
      source: 'custom',
      updatedAt: new Date().toISOString(),
    };

    updateProduct(updated);
    showToast(`"${editTitle}" and photo updated across the site!`, 'check-circle-2');
  };

  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroContent({
      badgeText: heroBadge,
      headlineLine1: heroHead1,
      headlineLine2: heroHead2,
      headlineLine3: heroHead3,
      subhead: heroSub,
      mainImage: heroMainImg,
      mainTag: heroMainLabel,
      leftImage: heroLeftImg,
      leftTag: heroLeftLabel,
      rightImage: heroRightImg,
      rightTag: heroRightLabel,
    });
    showToast('Hero photos, tags & headlines updated successfully!', 'sparkles');
  };

  const handleSaveMotion = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnimationSettings({
      marqueeSpeed,
      enableMagnet,
      enableFloatingBadges: enableFloating,
      enableScrollReveal: enableReveal,
    });
    showToast('Animation & motion preferences saved!', 'zap');
  };

  const handleCreateNewCraft = () => {
    const newId = Date.now();
    const newCraft: Product = {
      id: newId,
      title: 'New Student Handcrafted Item',
      description: 'Crafted with natural materials and traditional techniques by student creators.',
      category: 'Clay Crafts',
      price: 299,
      rating: 5.0,
      reviews: 1,
      maker: 'Student Artisan',
      cls: 'Fine Arts',
      school: 'Campus Art Studio',
      image: 'https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      stock: 'Made on Demand',
      source: 'custom',
    };
    addNewProduct(newCraft);
    setSelectedProdId(newId);
    showToast('New craft added! Edit its photo and details below.', 'sparkles');
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(getWordPressPhpSnippet());
    setCopiedSnippet(true);
    showToast('WordPress CORS & Meta snippet copied to clipboard!', 'copy');
    setTimeout(() => setCopiedSnippet(false), 3000);
  };

  const handleDownloadThemeZip = async () => {
    setIsGeneratingZip(true);
    showToast('Preparing ArtisansKart Theme v2.1.0 (.zip)...', 'package');

    try {
      const dynamicBlob = await generateClientThemeZip(products);
      const downloadUrl = URL.createObjectURL(dynamicBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'artisanskart-theme.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      showToast('ArtisansKart Theme v2.1.0 (.zip) generated and downloaded!', 'check-circle-2');
    } catch (err: any) {
      console.error('Failed to download theme ZIP:', err);
      showToast('Failed to create theme package: ' + (err.message || 'Unknown error'), 'alert-circle');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-[fadeIn_0.2s_ease-out]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#e7e0d8] overflow-hidden animate-[scaleUp_0.25s_ease-out]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e7e0d8] bg-[#FAF9F6] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E293B] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Globe className="w-5 h-5 text-[#C85A32]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#1E293B]">
                  ArtisansKart Visual &amp; Content Management
                </h2>
                {wpConfig.isConnected ? (
                  <span className="badge-sage text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    WordPress Live
                  </span>
                ) : (
                  <span className="text-[11px] text-[#C85A32] bg-[#C85A32]/10 px-2.5 py-0.5 rounded-full font-bold">
                    Interactive Studio
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Change Hero photos, marquee speed, animations, craft descriptions, or download your ready WordPress theme.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#e7e0d8] hover:bg-black/5 flex items-center justify-center cursor-pointer transition text-slate-500 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-[#e7e0d8] flex items-center gap-2 bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('theme-upload')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'theme-upload'
                ? 'border-[#C85A32] text-[#C85A32] bg-[#FAF9F6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>WordPress Theme</span>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              Ready .ZIP
            </span>
          </button>

          <button
            onClick={() => setActiveTab('media-studio')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'media-studio'
                ? 'border-[#C85A32] text-[#C85A32] bg-[#FAF9F6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Hero &amp; Photo Studio</span>
            <span className="bg-[#C85A32]/10 text-[#C85A32] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              Photos
            </span>
          </button>

          <button
            onClick={() => setActiveTab('motion-studio')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'motion-studio'
                ? 'border-[#C85A32] text-[#C85A32] bg-[#FAF9F6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Animations &amp; Motion</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              Speed &amp; Magnet
            </span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'editor'
                ? 'border-[#C85A32] text-[#C85A32] bg-[#FAF9F6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Crafts Catalog &amp; Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('connection')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'connection'
                ? 'border-[#C85A32] text-[#C85A32] bg-[#FAF9F6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>WP REST API Sync</span>
            {wpConfig.isConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'guide'
                ? 'border-[#C85A32] text-[#C85A32] bg-[#FAF9F6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Gutenberg Guide</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#FAF9F6] space-y-6">
          {/* TAB 0: UPLOAD AS WORDPRESS THEME */}
          {activeTab === 'theme-upload' && (
            <div className="space-y-6">
              {/* Theme Hero Banner */}
              <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-lg border border-slate-800">
                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 bg-[#C85A32] text-white text-xs font-bold px-3 py-1 rounded-full">
                    <Package className="w-3.5 h-3.5" />
                    <span>Official WordPress Theme Ready</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                    Upload Directly to WordPress
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    We've packaged this entire ArtisansKart storefront into a production-ready WordPress Theme. Download the zip file and upload it into your WordPress Dashboard in seconds.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDownloadThemeZip}
                      disabled={isGeneratingZip}
                      className="bg-[#C85A32] hover:bg-[#b04b27] text-white font-bold text-sm px-6 py-3 rounded-2xl flex items-center gap-2.5 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingZip ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Download WordPress Theme (.zip)</span>
                    </button>
                    <span className="text-xs text-slate-400">
                      File: <code className="text-[#e7c7a5] font-mono">artisanskart-theme.zip</code> (Version 2.1.0 • Live Marquee &amp; 13 Crafts)
                    </span>
                  </div>
                </div>

                <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                  <FolderArchive className="w-64 h-64 text-white" />
                </div>
              </div>

              {/* 4-Step Installation Guide */}
              <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs space-y-5">
                <div>
                  <h4 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#C85A32]" />
                    <span>How to Install or Update Theme in WordPress</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    No coding or FTP needed. Use standard WordPress Theme Upload:
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                    <div className="w-7 h-7 rounded-full bg-[#C85A32] text-white flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h5 className="font-bold text-sm text-[#1E293B]">Download ZIP</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click the orange button above to download <code className="text-[#C85A32] font-mono text-[11px]">artisanskart-theme.zip</code> (v2.1.0).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                    <div className="w-7 h-7 rounded-full bg-[#C85A32] text-white flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h5 className="font-bold text-sm text-[#1E293B]">Go to Themes</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      In your WordPress Dashboard (<code className="text-[#C85A32] font-mono text-[11px]">/wp-admin</code>), go to <strong>Appearance &rarr; Themes &rarr; Add New Theme</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                    <div className="w-7 h-7 rounded-full bg-[#C85A32] text-white flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h5 className="font-bold text-sm text-[#1E293B]">Upload &amp; Replace</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click <strong>Upload Theme</strong>, select the zip, click <strong>Install Now</strong>, then click the blue button <strong>"Replace installed with uploaded"</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                    <div className="w-7 h-7 rounded-full bg-[#8A9A86] text-white flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <h5 className="font-bold text-sm text-[#1E293B]">Activate &amp; View</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click <strong>Activate</strong>! Visit your homepage and refresh (Ctrl+F5) to see the sliding marquee, hero collage, and all 13 student crafts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: HERO & PHOTO STUDIO */}
          {activeTab === 'media-studio' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl border border-[#e7e0d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#C85A32]" />
                    <span>Hero Photos &amp; Visual Media Customizer</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Change any photo in the hero section, upload your own images, or pick from curated artisan presets.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      resetHeroToDefault();
                      showToast('Hero photos reset to original defaults.', 'rotate-ccw');
                    }}
                    className="bg-white border border-[#e7e0d8] hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Hero Defaults</span>
                  </button>
                </div>
              </div>

              {/* Photo Presets Palette */}
              <div className="bg-white rounded-2xl p-4 border border-[#e7e0d8] shadow-xs">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Quick Photo Presets (Click to use for Main Image)</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setHeroMainImg(preset.url);
                        showToast(`Main hero photo set to: ${preset.name}`, 'check-circle-2');
                      }}
                      className="group relative rounded-xl overflow-hidden border border-[#e7e0d8] hover:border-[#C85A32] text-left p-1 cursor-pointer transition bg-[#FAF9F6]"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <p className="text-[10px] font-bold text-[#1E293B] mt-1 truncate">{preset.name}</p>
                      <p className="text-[9px] text-slate-400">{preset.cat}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero Form & Live Preview */}
              <form onSubmit={handleSaveHero} className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs space-y-6">
                <h4 className="text-sm font-bold text-[#1E293B] border-b border-[#e7e0d8] pb-3">
                  Hero Section Imagery &amp; Satellite Cards
                </h4>

                {/* Main Hero Center Photo */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-black text-[#C85A32] uppercase tracking-wider">
                        1. Center Main Hero Photo (Center Card)
                      </span>
                      <p className="text-xs text-slate-500">The centerpiece showcase image featuring pottery / crafts in motion.</p>
                    </div>
                    <label className="bg-white border border-[#e7e0d8] hover:border-[#C85A32] text-slate-700 hover:text-[#C85A32] text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setHeroMainImg)}
                      />
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-8 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Image URL
                        </label>
                        <input
                          type="url"
                          required
                          value={heroMainImg}
                          onChange={(e) => setHeroMainImg(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#e7e0d8] text-xs focus:border-[#C85A32] focus:outline-hidden"
                          placeholder="https://images.pexels.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Badge Label on Photo
                        </label>
                        <input
                          type="text"
                          value={heroMainLabel}
                          onChange={(e) => setHeroMainLabel(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#e7e0d8] text-xs focus:border-[#C85A32] focus:outline-hidden"
                          placeholder="Crafting in progress"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-4 flex justify-center">
                      <div className="relative w-32 h-36 rounded-2xl overflow-hidden border-2 border-[#e7e0d8] shadow-md bg-white">
                        <img src={heroMainImg} alt="Preview" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold py-0.5 px-1 rounded text-center truncate">
                          {heroMainLabel || 'Center Preview'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left Satellite Photo & Right Satellite Photo */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Left Satellite */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                        2. Left Satellite (Fine Art)
                      </span>
                      <label className="text-[11px] font-semibold text-[#C85A32] hover:underline cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setHeroLeftImg)}
                        />
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <img src={heroLeftImg} alt="Left" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <input
                          type="url"
                          value={heroLeftImg}
                          onChange={(e) => setHeroLeftImg(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e7e0d8] text-xs focus:outline-hidden"
                          placeholder="Image URL"
                        />
                        <input
                          type="text"
                          value={heroLeftLabel}
                          onChange={(e) => setHeroLeftLabel(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e7e0d8] text-xs focus:outline-hidden"
                          placeholder="Badge Tag (e.g. Fine Arts)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Satellite */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                        3. Right Satellite (Jewelry / Crafts)
                      </span>
                      <label className="text-[11px] font-semibold text-[#C85A32] hover:underline cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setHeroRightImg)}
                        />
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <img src={heroRightImg} alt="Right" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <input
                          type="url"
                          value={heroRightImg}
                          onChange={(e) => setHeroRightImg(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e7e0d8] text-xs focus:outline-hidden"
                          placeholder="Image URL"
                        />
                        <input
                          type="text"
                          value={heroRightLabel}
                          onChange={(e) => setHeroRightLabel(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e7e0d8] text-xs focus:outline-hidden"
                          placeholder="Badge Tag (e.g. Jewelry)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hero Headlines & Text */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-4">
                  <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider block">
                    4. Hero Headlines &amp; Tagline
                  </span>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Headline Line 1</label>
                      <input
                        type="text"
                        value={heroHead1}
                        onChange={(e) => setHeroHead1(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Headline Line 2</label>
                      <input
                        type="text"
                        value={heroHead2}
                        onChange={(e) => setHeroHead2(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Headline Line 3</label>
                      <input
                        type="text"
                        value={heroHead3}
                        onChange={(e) => setHeroHead3(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Top Pill Badge Text</label>
                      <input
                        type="text"
                        value={heroBadge}
                        onChange={(e) => setHeroBadge(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Subheadline Description</label>
                      <input
                        type="text"
                        value={heroSub}
                        onChange={(e) => setHeroSub(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Actions */}
                <div className="pt-3 border-t border-[#e7e0d8] flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Applies live immediately to the main screen.
                  </span>
                  <button
                    type="submit"
                    className="btn-terracotta text-sm font-semibold px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save &amp; Apply Hero Media</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ANIMATION & MOTION STUDIO */}
          {activeTab === 'motion-studio' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl border border-[#e7e0d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#C85A32]" />
                    <span>Animation &amp; Motion Controls</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adjust motion intensity, marquee scrolling speed, and interactive cursor physics.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      resetAnimationToDefault();
                      showToast('Animation settings reset to default.', 'rotate-ccw');
                    }}
                    className="bg-white border border-[#e7e0d8] hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Motion Defaults</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveMotion} className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs space-y-6">
                {/* 1. Marquee Infinite Scroll Speed */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider block">
                        Marquee Infinite Craft Carousel Speed
                      </span>
                      <p className="text-xs text-slate-500">
                        Controls how fast the dual-row showcase tiles glide across the screen.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#C85A32] uppercase bg-[#C85A32]/10 px-2.5 py-1 rounded-full">
                      {marqueeSpeed}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {(['slow', 'normal', 'fast', 'paused'] as const).map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setMarqueeSpeed(spd)}
                        className={`p-3 rounded-xl border text-center transition cursor-pointer capitalize font-bold text-xs ${
                          marqueeSpeed === spd
                            ? 'border-[#C85A32] bg-[#C85A32] text-white shadow-xs'
                            : 'border-[#e7e0d8] bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {spd === 'slow' && '🐢 Slow (50s)'}
                        {spd === 'normal' && '✨ Normal (30s)'}
                        {spd === 'fast' && '⚡ Fast (16s)'}
                        {spd === 'paused' && '⏸️ Paused'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Interactive Magnet Physics */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
                      <MousePointer className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Hero Magnet Cursor Follow</span>
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Subtly pulls the satellite artisan badges towards the user's cursor on desktop.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={enableMagnet}
                      onChange={(e) => setEnableMagnet(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C85A32]"></div>
                  </label>
                </div>

                {/* 3. Floating Artisan Icons */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#8A9A86]" />
                      <span>Floating Decorative Artisan Icons</span>
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Floating clay, paintbrush, scissor, and flower badges in the About section.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={enableFloating}
                      onChange={(e) => setEnableFloating(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C85A32]"></div>
                  </label>
                </div>

                {/* 4. Scroll Reveal Animations */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Smooth Scroll Character &amp; Card Reveals</span>
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Word-by-word lighting up as you scroll through the artisan philosophy statement.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={enableReveal}
                      onChange={(e) => setEnableReveal(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C85A32]"></div>
                  </label>
                </div>

                {/* Save Motion */}
                <div className="pt-3 border-t border-[#e7e0d8] flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Preferences saved directly to your browser storage.
                  </span>
                  <button
                    type="submit"
                    className="btn-terracotta text-sm font-semibold px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Apply Motion Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: LIVE CRAFT & PHOTO EDITOR */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl border border-[#e7e0d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B]">
                    Instant Live Craft &amp; Photo Editing
                  </h3>
                  <p className="text-xs text-slate-500">
                    Edit craft photos, descriptions, prices, student makers, or titles below. All changes update across the website immediately and persist in your browser!
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCreateNewCraft}
                    className="btn-terracotta text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Craft</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetProductsToDefault();
                      showToast('Reset products to original defaults.', 'rotate-ccw');
                    }}
                    className="bg-white border border-[#e7e0d8] hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                    title="Reset all customized products to system defaults"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Left: Product Selector Sidebar */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-[#e7e0d8] max-h-[520px] overflow-y-auto space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Select Craft to Edit ({products.length})
                  </p>
                  {products.map((p) => {
                    const isSelected = p.id === selectedProdId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProdId(p.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-[#C85A32] bg-[#C85A32]/5 shadow-xs'
                            : 'border-[#e7e0d8] hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-11 h-11 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#1E293B] truncate">{p.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-semibold text-[#C85A32]">₹{p.price}</span>
                            <span>•</span>
                            <span className="truncate">{p.category}</span>
                          </div>
                        </div>
                        {p.source === 'custom' && (
                          <span className="w-2 h-2 rounded-full bg-[#C85A32] shrink-0" title="Custom edited" />
                        )}
                        {p.source === 'wordpress' && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="WordPress Synced" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right: Edit Form */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
                  {currentProduct ? (
                    <form onSubmit={handleSaveProductEdit} className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#e7e0d8]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">ID #{currentProduct.id}</span>
                          <span className="text-xs font-bold text-[#1E293B]">
                            Editing: {currentProduct.title}
                          </span>
                        </div>
                        {currentProduct.source && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            Source: {currentProduct.source}
                          </span>
                        )}
                      </div>

                      {/* Title & Price */}
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Craft Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden"
                            placeholder="e.g. Terracotta Diya Set of 6"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Price (₹ INR) *
                          </label>
                          <input
                            type="number"
                            required
                            min="10"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden"
                            placeholder="349"
                          />
                        </div>
                      </div>

                      {/* Description Textarea */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Full Craft Description *
                          </label>
                          <span className="text-[11px] text-slate-400">
                            {editDesc.length} characters
                          </span>
                        </div>
                        <textarea
                          required
                          rows={3}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Describe materials, student crafting process, dimensions, finish..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden leading-relaxed"
                        />
                      </div>

                      {/* Photo URL & Device Upload */}
                      <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Craft Image Photo
                          </label>
                          <label className="text-xs font-bold text-[#C85A32] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, setEditImage)}
                            />
                          </label>
                        </div>
                        <div className="flex gap-3 items-center">
                          <input
                            type="url"
                            value={editImage}
                            onChange={(e) => setEditImage(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-[#e7e0d8] text-xs focus:border-[#C85A32] focus:outline-hidden bg-white"
                            placeholder="https://..."
                          />
                          {editImage && (
                            <img
                              src={editImage}
                              alt="Preview"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          )}
                        </div>
                      </div>

                      {/* Category & Stock */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Category
                          </label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e0d8] text-sm bg-white focus:border-[#C85A32] focus:outline-hidden"
                          >
                            <option value="Clay Crafts">Clay Crafts</option>
                            <option value="Hand-painted Cards">Hand-painted Cards</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Keychains">Keychains</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Stock / Build Status
                          </label>
                          <input
                            type="text"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden"
                            placeholder="e.g. Made on Demand / In Stock (5 left)"
                          />
                        </div>
                      </div>

                      {/* Student Maker & School Details */}
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Student Maker
                          </label>
                          <input
                            type="text"
                            value={editMaker}
                            onChange={(e) => setEditMaker(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden"
                            placeholder="e.g. Sakib Ansari"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Class / Dept
                          </label>
                          <input
                            type="text"
                            value={editCls}
                            onChange={(e) => setEditCls(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden"
                            placeholder="e.g. Class 10 / B.Des"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            School / College
                          </label>
                          <input
                            type="text"
                            value={editSchool}
                            onChange={(e) => setEditSchool(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden"
                            placeholder="e.g. DPS RK Puram"
                          />
                        </div>
                      </div>

                      {/* Submit Actions */}
                      <div className="pt-3 border-t border-[#e7e0d8] flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Changes take effect across all pages instantly.
                        </span>
                        <button
                          type="submit"
                          className="btn-terracotta text-sm font-semibold px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save &amp; Apply Craft Details</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      Select a craft from the left list to begin editing.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORDPRESS REST API CONNECTION */}
          {activeTab === 'connection' && (
            <div className="space-y-6">
              {/* Connection Form Card */}
              <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#1E293B]">
                    Connect Your WordPress REST API
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    WordPress comes with a built-in REST API. Simply enter your WordPress domain name below to pull your posts, featured images, and descriptions in real time.
                  </p>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    WordPress Site URL *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://your-wordpress-site.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isTesting}
                      onClick={handleTestConnection}
                      className="bg-[#1E293B] text-white hover:bg-[#C85A32] disabled:opacity-50 text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-xs"
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Test Connection</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Diagnostics Result Card */}
                {testResult && (
                  <div
                    className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 animate-[fadeIn_0.2s_ease-out] ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{testResult.message}</p>
                      {testResult.siteName && (
                        <p className="text-[11px] mt-1 text-slate-600">
                          Detected Site: <strong>{testResult.siteName}</strong>
                        </p>
                      )}
                      {!testResult.success && (
                        <p className="text-[11px] mt-1 text-amber-800">
                          Tip: Ensure your WordPress has CORS enabled. Check the "WordPress PHP Snippet" section below to copy a 5-line CORS fix.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Post Type & Endpoint Configuration */}
                <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-[#e7e0d8]">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      WordPress Content Type
                    </label>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e0d8] text-sm bg-white focus:border-[#C85A32] focus:outline-hidden"
                    >
                      <option value="posts">Standard WordPress Posts (/wp/v2/posts)</option>
                      <option value="products">Custom Post Type: Products (/wp/v2/products)</option>
                      <option value="custom">Custom REST API Endpoint</option>
                    </select>
                  </div>

                  {postType === 'custom' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Custom Endpoint Path
                      </label>
                      <input
                        type="text"
                        value={customEndpoint}
                        onChange={(e) => setCustomEndpoint(e.target.value)}
                        placeholder="/wp-json/my-plugin/v1/crafts"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3 self-center sm:pt-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSync}
                        onChange={(e) => setAutoSync(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C85A32]"></div>
                    </label>
                    <span className="text-xs font-semibold text-[#1E293B]">
                      Auto-sync on page load
                    </span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-4 border-t border-[#e7e0d8] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">
                    {wpConfig.lastSync
                      ? `Last synced: ${new Date(wpConfig.lastSync).toLocaleTimeString()}`
                      : 'Not synced yet'}
                  </span>

                  <button
                    type="button"
                    onClick={handleSaveConnectionAndSync}
                    className="btn-terracotta text-sm font-semibold px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Save URL &amp; Sync Content Now</span>
                  </button>
                </div>
              </div>

              {/* PHP CORS & Meta Snippet Helper */}
              <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#C85A32]" />
                    <h4 className="text-sm font-bold text-[#1E293B]">
                      WordPress PHP Snippet (functions.php)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={copySnippet}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#e7e0d8] hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition cursor-pointer"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Snippet</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Optional: If your WordPress blocks external browser requests (CORS), paste this snippet into your theme's <code className="bg-slate-100 px-1 py-0.5 rounded text-[#C85A32]">functions.php</code> or a custom plugin.
                </p>
                <pre className="bg-[#1E293B] text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono max-h-48">
                  {getWordPressPhpSnippet()}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: GUIDE ON EDITING IN WORDPRESS GUTENBERG */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#1E293B]">
                  How to Change Descriptions &amp; Crafts Directly in WordPress
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You never need to open the code or re-upload files. Follow these 4 easy steps in your WordPress dashboard:
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#C85A32]">
                      <span className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-xs">
                        1
                      </span>
                      <span>Go to WordPress Admin</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Log into your WordPress site at <code className="text-[#C85A32]">your-site.com/wp-admin</code> and navigate to <strong>Posts &rarr; All Posts</strong> or <strong>Add New</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#C85A32]">
                      <span className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-xs">
                        2
                      </span>
                      <span>Edit Title &amp; Description</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      In the WordPress Gutenberg block editor, write or edit your craft description directly. Format paragraphs, bold text, or craft highlights as you like.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#C85A32]">
                      <span className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-xs">
                        3
                      </span>
                      <span>Set Featured Image</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Upload high-resolution craft photos into the <strong>Featured Image</strong> box in the WordPress sidebar. ArtisansKart automatically uses this image.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#C85A32]">
                      <span className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center text-xs">
                        4
                      </span>
                      <span>Click Publish / Update</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Hit <strong>Update</strong> in WordPress! The changes are immediately served via <code className="text-[#C85A32]">/wp-json/wp/v2/posts</code> and reflect on ArtisansKart automatically.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 mt-4">
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Need Custom Fields for Price &amp; School?</span>
                    You can add standard WordPress Custom Fields (or use ACF - Advanced Custom Fields) named <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">price</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">maker</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">school</code>, and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">stock</code>.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e7e0d8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
            <span>ArtisansKart Headless &amp; Visual Studio Engine</span>
          </div>
          <button
            onClick={onClose}
            className="btn-terracotta text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
