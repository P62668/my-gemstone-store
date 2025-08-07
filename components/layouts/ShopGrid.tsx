import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { H1, H2, H3, BodyText, Button, ProductCard, SearchInput, Select } from '../ui';
import { sampleGemstones } from '../../utils/sample-data';
import { Gemstone } from '../../interfaces';

const ShopGrid: React.FC = () => {
  // SEO meta tags
  const pageTitle = 'Shop Gemstones | Shankarmala';
  const pageDescription =
    'Browse and filter our curated gemstone collection. Find rubies, emeralds, sapphires, diamonds, pearls, and more.';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [gemstones, setGemstones] = useState<Gemstone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // const { addToCart } = useCart(); // Removed unused variable

  useEffect(() => {
    const fetchGemstones = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/gemstones');
        if (!res.ok) throw new Error('Failed to fetch gemstones');
        const data: Gemstone[] = await res.json();
        setGemstones(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Unknown error');
        } else {
          setError('Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchGemstones();
  }, []);

  // Filter and sort logic
  let filteredGemstones: Gemstone[] = gemstones.filter((gem) => {
    const priceOk: boolean = gem.price >= priceRange[0] && gem.price <= priceRange[1];
    // Use Gemstone.name for type filtering
    const typeOk: boolean = selectedTypes.length === 0 || selectedTypes.includes(gem.name);
    return priceOk && typeOk;
  });
  if (sortBy === 'price-low')
    filteredGemstones = [...filteredGemstones].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high')
    filteredGemstones = [...filteredGemstones].sort((a, b) => b.price - a.price);
  if (sortBy === 'name')
    filteredGemstones = [...filteredGemstones].sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === 'newest') filteredGemstones = [...filteredGemstones].reverse();

  const handleViewDetails = (id: string) => {
    router.push(`/product/${id}`);
  };

  return (
    <>
      {/* SEO Head */}
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
      </Head>
      <div className="min-h-screen bg-gray-50" role="main" aria-label="Gemstone shop grid">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <H1 className="text-4xl font-bold text-gray-900 mb-4">Gemstone Collection</H1>
            <BodyText className="text-xl text-gray-600">
              Discover our curated selection of premium gemstones
            </BodyText>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8" tabIndex={-1}>
            {/* Sidebar Filters */}
            <div className="lg:w-80 flex-shrink-0">
              <div
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
                aria-label="Filters sidebar"
              >
                <H2 className="text-xl font-semibold mb-6">Filters</H2>

                {/* Search */}
                <div className="mb-6">
                  <SearchInput
                    placeholder="Search gemstones..."
                    value=""
                    onChange={() => {}}
                    onSearch={() => {}}
                    aria-label="Search gemstones"
                  />
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <H3 className="font-medium mb-3">Price Range</H3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full"
                      aria-valuenow={priceRange[1]}
                      aria-valuemin={0}
                      aria-valuemax={1000000}
                      aria-label="Price range"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>$0</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Gemstone Type */}
                <div className="mb-6">
                  <H3 className="font-medium mb-3">Gemstone Type</H3>
                  <div className="space-y-2">
                    {['Ruby', 'Emerald', 'Sapphire', 'Diamond', 'Pearl', 'Opal'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(selectedTypes.filter((t) => t !== type));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          aria-checked={selectedTypes.includes(type)}
                          aria-label={type}
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Certification filter removed: not present in Gemstone interface */}

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTypes([]);
                    setPriceRange([0, 1000000]);
                  }}
                  className="w-full"
                  aria-label="Clear all filters"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8"
                aria-label="Shop toolbar"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600" aria-live="polite">
                      Showing {filteredGemstones.length} results
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Sort */}
                    <Select
                      label="Sort by"
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { value: 'featured', label: 'Featured' },
                        { value: 'price-low', label: 'Price: Low to High' },
                        { value: 'price-high', label: 'Price: High to Low' },
                        { value: 'name', label: 'Name A-Z' },
                        { value: 'newest', label: 'Newest First' },
                      ]}
                      className="w-48"
                      aria-label="Sort gemstones"
                    />

                    {/* View Toggle */}
                    <div
                      className="flex border border-gray-300 rounded-lg"
                      role="group"
                      aria-label="View mode toggle"
                    >
                      <button
                        onClick={() => setViewMode('grid')}
                        aria-label="Grid view"
                        className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                        aria-pressed={viewMode === 'grid'}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        aria-label="List view"
                        className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                        aria-pressed={viewMode === 'list'}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              {loading ? (
                <div className="text-center py-8" role="status" aria-live="polite">
                  Loading gemstones...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500" role="alert" aria-live="assertive">
                  {error}
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                      : 'space-y-4 sm:space-y-6'
                  }
                >
                  {filteredGemstones.map((gemstone) => (
                    <ProductCard
                      key={gemstone.id}
                      gemstone={gemstone}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2" aria-label="Pagination">
                  <button
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  <button
                    className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Page 1"
                  >
                    1
                  </button>
                  <button
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Page 2"
                  >
                    2
                  </button>
                  <button
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Page 3"
                  >
                    3
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                  <button
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Page 10"
                  >
                    10
                  </button>
                  <button
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </nav>
              </div>

              {/* No Results */}
              {filteredGemstones.length === 0 && (
                <div className="text-center py-12" role="alert" aria-live="assertive">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <H2 className="text-2xl font-semibold text-gray-900 mb-2">No gemstones found</H2>
                  <BodyText className="text-gray-600 mb-6">
                    Try adjusting your filters or search terms
                  </BodyText>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedTypes([]);
                      setPriceRange([0, 1000000]);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopGrid;
