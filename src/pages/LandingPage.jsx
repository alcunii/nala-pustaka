import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Network, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  const { t } = useTranslation('landing');
  
  return (
    <div className="min-h-screen flex flex-col bg-primary-50 font-sans text-gray-800">
      <Helmet>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <link rel="canonical" href="https://nalapustaka.com/" />
        
        {/* Open Graph */}
        <meta property="og:title" content={t('meta.title')} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="og:url" content="https://nalapustaka.com/" />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('meta.title')} />
        <meta name="twitter:description" content={t('meta.description')} />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary-900 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/batik-rambutan.png')]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 opacity-90"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-accent-400/30 bg-accent-900/30 backdrop-blur-sm">
              <span className="text-accent-300 text-sm font-medium tracking-widest uppercase">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6 leading-tight">
              {t('hero.title')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-200 to-accent-500">
                {t('hero.titleHighlight')}
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-primary-100 mb-10 leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: t('hero.description') }} />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/app"
                className="px-8 py-4 bg-accent-600 text-primary-900 rounded-lg font-bold text-lg hover:bg-accent-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {t('hero.ctaPrimary')}
              </Link>
              <Link
                to="/catalog"
                className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>
        </section>

        {/* Academic Value Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-primary-900 mb-4">{t('academic.title')}</h2>
              <div className="w-24 h-1 bg-accent-500 mx-auto rounded-full"></div>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto mb-6">
                {t('academic.subtitle')}
              </p>
              <Link to="/about" className="text-accent-600 font-semibold hover:text-accent-700 hover:underline inline-flex items-center gap-1">
                {t('academic.learnMore') || 'Pelajari Lebih Lanjut'} →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Feature 1 */}
              <Link to="/app" className="block p-8 bg-primary-50 rounded-xl border border-primary-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 flex items-center gap-2">
                  {t('academic.features.rag.title')}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent-500">→</span>
                </h3>
                <p className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('academic.features.rag.description') }} />
              </Link>

              {/* Feature 2 */}
              <Link to="/app" className="block p-8 bg-primary-50 rounded-xl border border-primary-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Network className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 flex items-center gap-2">
                  {t('academic.features.graph.title')}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent-500">→</span>
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('academic.features.graph.description')}
                </p>
              </Link>

              {/* Feature 3 */}
              <Link to="/catalog" className="block p-8 bg-primary-50 rounded-xl border border-primary-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 flex items-center gap-2">
                  {t('academic.features.catalog.title')}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent-500">→</span>
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('academic.features.catalog.description')}
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Insights Section */}
        <section className="py-20 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-primary-900 mb-4">{t('insights.title')}</h2>
              <div className="w-24 h-1 bg-accent-500 mx-auto rounded-full"></div>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                {t('insights.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Article 1 */}
              <Link to="/articles/digital-silence" className="group relative bg-white rounded-xl border border-gray-100 p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-primary-700 uppercase bg-primary-50 rounded-full">
                    Teknologi
                  </span>
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-accent-600 transition-colors">
                  {t('insights.articles.digitalSilence.title')}
                </h3>
                <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                  {t('insights.articles.digitalSilence.description')}
                </p>
                <span className="inline-flex items-center text-accent-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  {t('insights.articles.digitalSilence.readMore')} →
                </span>
              </Link>

              {/* Article 2 */}
              <Link to="/articles/philology-revolution" className="group relative bg-white rounded-xl border border-gray-100 p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-accent-700 uppercase bg-accent-50 rounded-full">
                    Riset
                  </span>
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-accent-600 transition-colors">
                  {t('insights.articles.philology.title')}
                </h3>
                <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                  {t('insights.articles.philology.description')}
                </p>
                <span className="inline-flex items-center text-accent-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  {t('insights.articles.philology.readMore')} →
                </span>
              </Link>

              {/* Article 3 */}
              <Link to="/articles/gen-z-wisdom" className="group relative bg-white rounded-xl border border-gray-100 p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-emerald-700 uppercase bg-emerald-50 rounded-full">
                    Edukasi
                  </span>
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-accent-600 transition-colors">
                  {t('insights.articles.genz.title')}
                </h3>
                <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                  {t('insights.articles.genz.description')}
                </p>
                <span className="inline-flex items-center text-accent-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  {t('insights.articles.genz.readMore')} →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-16 bg-primary-800 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent-500/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent-500/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <span className="text-6xl font-serif text-accent-500/30 absolute top-0 left-0 -translate-x-4 -translate-y-8">"</span>
            <blockquote className="text-2xl md:text-3xl font-serif italic leading-relaxed mb-6">
              {t('quote.text')}
            </blockquote>
            <cite className="text-accent-300 font-medium not-italic tracking-wider uppercase text-sm">
              {t('quote.author')}
            </cite>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}