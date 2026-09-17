import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  Volume2, 
  HelpCircle, 
  Home,
  Info,
  Award,
  FolderGit2,
  FileCheck2,
  Store,
  Wallet,
  FileBarChart2,
  Sparkles,
  Users2,
  Menu,
  X,
  Globe2,
  Check,
  MapPin,
  Briefcase,
  Database
} from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '../contexts/LanguageContext';
import { NationalEmblem } from './NationalEmblem';
import azadiLogo from '../assets/images/azadi_ka_amrit_mahotsav.png';
import g20Logo from '../assets/images/g20_logo.png';
import digitalIndiaLogo from '../assets/images/digital_india_logo.png';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const GovernmentHeader: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const changeFontSize = (size: 'sm' | 'md' | 'lg') => {
    setFontSize(size);
    document.documentElement.classList.remove('text-zoom-sm', 'text-zoom-md', 'text-zoom-lg');
    document.documentElement.classList.add(`text-zoom-${size}`);
  };

  const navItems = [
    { label: t('nav_home'), path: '/', icon: <Home className="w-3.5 h-3.5" />, isHome: true },
    { label: t('nav_mps'), path: '/mps', icon: <Award className="w-3.5 h-3.5" /> },
    { 
      label: t('nav_projects'), 
      path: '/projects', 
      icon: <FolderGit2 className="w-3.5 h-3.5" />, 
      hasDropdown: true,
      submenu: [
        { label: 'All Projects Directory', path: '/projects' },
        { label: 'Digital Twin Interactive Map', path: '/digital-twin' },
        { label: 'Project Splitting Radar', path: '/project-splitting' }
      ]
    },
    { 
      label: t('nav_rural_intelligence') || 'Rural Intelligence', 
      path: '/rural-intelligence', 
      icon: <MapPin className="w-3.5 h-3.5" />, 
      hasDropdown: true,
      submenu: [
        { label: 'Rural Intelligence Dashboard', path: '/rural-intelligence' },
        { label: 'Village Explorer & Map', path: '/village-explorer' },
        { label: 'Low-Project Villages (Fewer Works)', path: '/village-priority' },
        { label: 'Data Quality & LGD Audit', path: '/village-data-quality' }
      ]
    },
    { 
      label: t('nav_contractor_opportunities') || 'Contractor Opportunities', 
      path: '/opportunities', 
      icon: <Briefcase className="w-3.5 h-3.5" />, 
      hasDropdown: true,
      submenu: [
        { label: 'Upcoming Opportunities Dashboard', path: '/opportunities' },
        { label: 'My Interested Projects', path: '/contractor-dashboard' },
        { label: 'Express Interest in Works', path: '/contractor-interest' },
        { label: 'Official Tender Portals & Sources', path: '/tender-sources' }
      ]
    },
    { 
      label: 'National Pipeline', 
      path: '/national-data', 
      icon: <Database className="w-3.5 h-3.5" />, 
      hasDropdown: true,
      submenu: [
        { label: 'National Pipeline Dashboard', path: '/national-data' },
        { label: 'State Coverage Tiers', path: '/national-data' },
        { label: 'Data Source Registry', path: '/national-data' },
        { label: 'Data Quality & Provenance Report', path: '/national-data' }
      ]
    },
    { 
      label: 'Procurement & Vendors', 
      path: '/tenders', 
      icon: <FileCheck2 className="w-3.5 h-3.5" />, 
      hasDropdown: true,
      submenu: [
        { label: 'Public Works Tenders & NITs', path: '/tenders' },
        { label: 'Vendor Directory & Marketplace', path: '/vendors' },
        { label: 'Contractor Performance Registry', path: '/contractors' },
        { label: 'Supply Chain Intelligence', path: '/supply-chain' }
      ]
    },
    { 
      label: 'Reports & Analytics', 
      path: '/reports', 
      icon: <FileBarChart2 className="w-3.5 h-3.5" />, 
      hasDropdown: true,
      submenu: [
        { label: 'Executive Analytics & Reports', path: '/reports' },
        { label: 'Fund Management & Allocation', path: '/funds' },
        { label: 'AI Risk Engine & Explainability', path: '/ai-insights' },
        { label: 'Compliance & Audit Trail', path: '/compliance' }
      ]
    },
    { label: t('nav_citizen'), path: '/citizen', icon: <Users2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-[#f0f4f8] text-[#334155] border-b border-gray-200 text-xs py-1 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto flex flex-wrap justify-between items-center gap-2">
          
          {/* Left utility elements */}
          <div className="flex items-center space-x-2.5 flex-wrap">
            <div className="flex items-center space-x-1.5 font-medium text-slate-800">
              {/* Indian Flag SVG */}
              <span className="inline-block w-4 h-2.5 rounded-[1px] overflow-hidden shadow-xs border border-gray-300">
                <span className="block h-1/3 bg-[#FF9933]"></span>
                <span className="block h-1/3 bg-white flex items-center justify-center">
                  <span className="w-0.5 h-0.5 rounded-full bg-[#000080]"></span>
                </span>
                <span className="block h-1/3 bg-[#138808]"></span>
              </span>
              <span>{t('bharat_sarkar')}</span>
              <span className="text-gray-400">|</span>
              <span>{t('gov_india')}</span>
            </div>
            
            <span className="text-gray-300 hidden sm:inline">|</span>
            <a href="#main-content" className="hover:text-[#0b2e59] transition hidden md:inline">
              {t('skip_to_content')}
            </a>
            
            <span className="text-gray-300 hidden md:inline">|</span>
            <button 
              className="flex items-center space-x-1 hover:text-[#0b2e59] transition hidden lg:flex"
              title="Screen Reader Access"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('screen_reader')}</span>
            </button>
            
            <span className="text-gray-300 hidden lg:inline">|</span>
            {/* Font size adjustments */}
            <div className="flex items-center space-x-1 font-semibold text-[11px] text-slate-600">
              <button 
                onClick={() => changeFontSize('sm')} 
                className={`px-1 rounded hover:bg-slate-200 ${fontSize === 'sm' ? 'text-blue-700 font-bold underline' : ''}`}
                title="Decrease Font Size"
              >
                A-
              </button>
              <button 
                onClick={() => changeFontSize('md')} 
                className={`px-1 rounded hover:bg-slate-200 ${fontSize === 'md' ? 'text-blue-700 font-bold underline' : ''}`}
                title="Standard Font Size"
              >
                A
              </button>
              <button 
                onClick={() => changeFontSize('lg')} 
                className={`px-1 rounded hover:bg-slate-200 ${fontSize === 'lg' ? 'text-blue-700 font-bold underline' : ''}`}
                title="Increase Font Size"
              >
                A+
              </button>
            </div>
            
            <span className="text-gray-300">|</span>
            {/* Multi-Language Dropdown Switcher */}
            <div className="relative">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1 font-semibold text-slate-700 hover:text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-300 transition"
              >
                <Globe2 className="w-3 h-3 text-gov-navy" />
                <span className="text-blue-700 font-bold">
                  {SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName || 'English'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {langDropdownOpen && (
                <div className="absolute left-0 mt-1 w-36 bg-white rounded-md shadow-xl border border-slate-200 py-1 z-50 animate-fadeIn text-xs">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-blue-50 transition ${
                        language === lang.code ? 'text-blue-700 font-bold bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Toggle English / Hindi */}
            <div className="hidden sm:flex items-center space-x-1 font-medium text-[11px]">
              <button
                onClick={() => setLanguage('en')}
                className={`hover:text-blue-700 transition ${language === 'en' ? 'text-blue-700 font-bold underline' : 'text-slate-600'}`}
              >
                English
              </button>
              <span className="text-gray-300">/</span>
              <button
                onClick={() => setLanguage('hi')}
                className={`hover:text-blue-700 transition ${language === 'hi' ? 'text-blue-700 font-bold underline' : 'text-slate-600'}`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Right utility elements */}
          <div className="flex items-center space-x-3 text-slate-600">
            <Link to="/about" className="hover:text-blue-700 transition hidden sm:inline">{t('sitemap')}</Link>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <Link to="/about" className="hover:text-blue-700 transition hidden sm:inline">{t('faqs')}</Link>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <Link to="/citizen" className="hover:text-blue-700 transition flex items-center space-x-1">
              <HelpCircle className="w-3 h-3 text-slate-400" />
              <span>{t('helpdesk')}</span>
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/about" className="hover:text-blue-700 transition">{t('contact_us')}</Link>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => navigate('/projects')}
              className="text-slate-500 hover:text-blue-700" 
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN BRANDING BANNER */}
      <div className="relative py-2.5 px-4 sm:px-6 bg-white overflow-hidden border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 relative z-10">
          
          {/* Left: Authentic Lion Capital of Ashoka & Title Text */}
          <div className="flex items-center space-x-3.5">
            {/* Authentic State Emblem of India Component */}
            <NationalEmblem className="w-12 h-16 sm:w-14 sm:h-18" />

            {/* Title Case Text matching official layout */}
            <div className="leading-tight">
              <h1 className="text-base sm:text-lg lg:text-[19px] font-bold text-[#0b2e59] tracking-tight font-sans">
                {t('mplads_title_1')}
              </h1>
              <h2 className="text-base sm:text-lg lg:text-[19px] font-bold text-[#0b2e59] tracking-tight font-sans -mt-0.5">
                {t('mplads_title_2')}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {t('mospi_dept')}
              </p>
              <p className="text-[11px] text-slate-500 font-normal">
                {t('gov_of_india_sub')}
              </p>
            </div>
          </div>

          {/* Right: Official Government Initiative Logos (Aligned to the right) */}
          <div className="hidden lg:flex items-center space-x-5 xl:space-x-7 ml-auto pr-2">
            
            {/* G20 India Official Logo */}
            <div className="flex items-center justify-center px-1.5 py-0.5">
              <img
                src={g20Logo}
                alt="G20 Bharat 2023 INDIA - Official Summit Logo"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-xs"
                loading="eager"
              />
            </div>

            {/* 75 Azadi Ka Amrit Mahotsav Authentic Logo */}
            <div className="flex items-center justify-center px-1.5 py-0.5">
              <img
                src={azadiLogo}
                alt="75 Azadi Ka Amrit Mahotsav - 75 Years of Indian Independence"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-xs"
                loading="eager"
              />
            </div>

            {/* Digital India Official Logo */}
            <div className="flex items-center justify-center px-1.5 py-0.5">
              <img
                src={digitalIndiaLogo}
                alt="Digital India - Power To Empower"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
                loading="eager"
              />
            </div>

          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. MAIN NAVIGATION BAR */}
      <nav className="bg-[#0b2e59] text-white shadow-sm sticky top-0">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-0.5 text-xs font-medium">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
              if (item.isHome) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="px-3.5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-slate-900 font-bold flex items-center space-x-1.5 transition shadow-xs"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              }

              if (item.submenu) {
                return (
                  <div 
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => setActiveSubmenu(item.path)}
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    <Link
                      to={item.path}
                      className={`px-3 py-2.5 flex items-center space-x-1.5 transition duration-150 border-b-2 ${
                        isActive
                          ? 'bg-[#14437a] text-white font-bold border-amber-400'
                          : 'border-transparent text-slate-100 hover:bg-[#14437a] hover:text-white'
                      }`}
                    >
                      <span className="opacity-90">{item.icon}</span>
                      <span>{item.label}</span>
                      <ChevronDown className="w-3 h-3 text-slate-300 opacity-70 ml-0.5" />
                    </Link>

                    {activeSubmenu === item.path && (
                      <div className="absolute left-0 top-full w-60 bg-white text-slate-800 rounded-b shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn text-xs">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setActiveSubmenu(null)}
                            className="block px-3.5 py-2 hover:bg-blue-50 text-slate-700 hover:text-gov-navy transition font-medium"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2.5 flex items-center space-x-1.5 transition duration-150 border-b-2 ${
                    isActive
                      ? 'bg-[#14437a] text-white font-bold border-amber-400'
                      : 'border-transparent text-slate-100 hover:bg-[#14437a] hover:text-white'
                  }`}
                >
                  <span className="opacity-90">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <ChevronDown className="w-3 h-3 text-slate-300 opacity-70 ml-0.5" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Official Government Portal Search Bar */}
          <div className="py-1.5 my-auto flex-shrink-0 pl-2 lg:pl-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-44 sm:w-56 xl:w-64 2xl:w-72 pl-3 pr-2 py-1.5 text-xs bg-white text-slate-800 placeholder-slate-400 rounded-l border border-r-0 border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-slate-900 font-bold text-xs rounded-r border border-amber-500 flex items-center space-x-1 transition flex-shrink-0"
                title="Search"
              >
                <Search className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />
                <span className="hidden xl:inline text-[11px] font-bold uppercase tracking-wider">Search</span>
              </button>
            </form>
          </div>

        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#071f3d] border-t border-slate-700 py-2 px-4 space-y-1 text-sm">
            {navItems.map((item) => (
              <div key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded text-xs text-slate-200 hover:bg-[#0b2e59]"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
                {item.submenu && (
                  <div className="pl-6 space-y-1 py-1 bg-[#05162b]/50 rounded mb-1">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-2 py-1 text-[11px] text-slate-300 hover:text-white"
                      >
                        • {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
};

