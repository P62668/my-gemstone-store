import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, TrendingUp, Clock, Tag, Filter, Star } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getFirstImage } from '../../utils/imageUtils';

// Dynamically import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false });

interface SearchSuggestion {
  id: number;
  name: string;
  category?: string;
  image?: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
  popularity?: number;
  type: 'product' | 'category' | 'trending' | 'attribute';
}

interface RecentSearch {
  id: string;
  term: string;
  timestamp: number;
}

interface PopularCategory {
  id: number;
  name: string;
  count: number;
}

const AIPoweredSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [trending, setTrending] = useState<SearchSuggestion[]>([]);
  const [categories, setCategories] = useState<PopularCategory[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches.slice(0, 10)));
    }
  }, [recentSearches]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch enhanced search data
  const fetchEnhancedSearchData = useCallback(async (query: string) => {
    if (!query.trim() && !showSuggestions) {
      // If no query and suggestions aren't shown, fetch trending and categories
      try {
        const res = await fetch('/api/search-enhanced');
        if (res.ok) {
          const data = await res.json();
          setTrending(data.trending || []);
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching enhanced search data:', error);
      }
      return;
    }

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search-suggestions?query=${encodeURIComponent(query)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data || []);
        
        // Also fetch trending and categories
        const enhancedRes = await fetch('/api/search-enhanced');
        if (enhancedRes.ok) {
          const enhancedData = await enhancedRes.json();
          setTrending(enhancedData.trending || []);
          setCategories(enhancedData.categories || []);
        }
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [showSuggestions]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEnhancedSearchData(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchEnhancedSearchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allSuggestions = [...suggestions, ...trending.slice(0, 3)];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
        handleSuggestionClick(allSuggestions[selectedIndex].name);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (term: string, type?: string) => {
    setSearchQuery(term);
    setShowSuggestions(false);
    
    // Add to recent searches
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      term,
      timestamp: Date.now()
    };
    setRecentSearches(prev => [newSearch, ...prev.filter(s => s.term !== term)].slice(0, 10));
    
    // Navigate based on type
    if (type === 'category') {
      window.location.href = `/shop?category=${encodeURIComponent(term)}`;
    } else if (type === 'attribute') {
      // For attributes, search across all products
      window.location.href = `/shop?search=${encodeURIComponent(term)}`;
    } else {
      window.location.href = `/shop?search=${encodeURIComponent(term)}`;
    }
  };

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    setShowSuggestions(false);
    window.location.href = `/shop?category=${categoryId}`;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        term: searchQuery.trim(),
        timestamp: Date.now()
      };
      setRecentSearches(prev => [newSearch, ...prev.filter(s => s.term !== searchQuery.trim())].slice(0, 10));
      
      // Navigate to search results
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Tag className="w-4 h-4" />;
      case 'category':
        return <Filter className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      case 'attribute':
        return <Star className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  // Get background color for suggestion type
  const getSuggestionBgColor = (type: string) => {
    switch (type) {
      case 'product':
        return 'bg-blue-50 text-blue-700';
      case 'category':
        return 'bg-purple-50 text-purple-700';
      case 'trending':
        return 'bg-amber-50 text-amber-700';
      case 'attribute':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  // Render star ratings
  const renderRating = (rating: number, reviewCount: number) => {
    if (!rating || rating === 0) return null;
    
    return (
      <div className="flex items-center mt-1">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
      </div>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setShowSuggestions(true);
            fetchEnhancedSearchData('');
          }}
          placeholder="Search gemstones, jewelry, colors, clarity, or categories..."
          className="w-full pl-10 pr-10 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base shadow-sm transition-all"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {typeof window !== 'undefined' ? (
        <AnimatePresence>
          {showSuggestions && (
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              {searchQuery ? (
                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="px-4 py-6 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto"></div>
                      <p className="mt-2">Finding the perfect match...</p>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <Search className="w-4 h-4 mr-2" />
                          Search Results
                        </h3>
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <MotionDiv
                          key={`${suggestion.type}-${suggestion.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <button
                            onClick={() => handleSuggestionClick(suggestion.name, suggestion.type)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                              selectedIndex === index ? 'bg-amber-50' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`p-1 rounded mr-3 ${getSuggestionBgColor(suggestion.type)}`}>
                                {getSuggestionIcon(suggestion.type)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{suggestion.name}</div>
                                {suggestion.category && (
                                  <div className="text-xs text-gray-500 mt-1">{suggestion.category}</div>
                                )}
                                {suggestion.type === 'product' && renderRating(suggestion.rating || 0, suggestion.reviewCount || 0)}
                              </div>
                            </div>
                            {suggestion.price && (
                              <div className="text-sm font-bold text-gray-900">
                                ${suggestion.price.toLocaleString()}
                              </div>
                            )}
                            {suggestion.popularity && suggestion.type === 'trending' && (
                              <div className="flex items-center text-xs text-amber-600 ml-2">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {suggestion.popularity}%
                              </div>
                            )}
                          </button>
                        </MotionDiv>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="font-medium text-gray-900 mb-1">No results found</h3>
                      <p className="text-sm">Try different keywords or check spelling</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="py-2 border-b border-gray-100">
                      <div className="px-4 py-2 flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-700 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Recent Searches
                        </div>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="space-y-1 px-2">
                        {recentSearches.map((search) => (
                          <button
                            key={search.id}
                            onClick={() => handleSuggestionClick(search.term)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center rounded-lg"
                          >
                            <Clock className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-gray-700">{search.term}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Searches */}
                  {trending.length > 0 && (
                    <div className="py-2 border-b border-gray-100">
                      <div className="px-4 py-2">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Trending Now
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 px-3 pb-2">
                        {trending.slice(0, 6).map((item, index) => (
                          <button
                            key={`trending-${item.id}`}
                            onClick={() => handleSuggestionClick(item.name)}
                            className={`text-left p-2 hover:bg-gray-50 transition-colors rounded-lg text-sm ${
                              selectedIndex === suggestions.length + index ? 'bg-amber-50' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900 line-clamp-1">{item.name}</div>
                            {item.price && (
                              <div className="text-xs text-gray-500 mt-1">
                                ${item.price.toLocaleString()}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Categories */}
                  {categories.length > 0 && (
                    <div className="py-2">
                      <div className="px-4 py-2">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                          <Filter className="w-4 h-4 mr-2" />
                          Shop by Category
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2 px-3 pb-3">
                        {categories.slice(0, 8).map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id, category.name)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-800 rounded-full text-sm transition-colors"
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </MotionDiv>
          )}
        </AnimatePresence>
      ) : (
        showSuggestions && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {searchQuery ? (
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="px-4 py-6 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-2">Finding the perfect match...</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <Search className="w-4 h-4 mr-2" />
                        Search Results
                      </h3>
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion.type}-${suggestion.id}`}
                      >
                        <button
                          onClick={() => handleSuggestionClick(suggestion.name, suggestion.type)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            selectedIndex === index ? 'bg-amber-50' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`p-1 rounded mr-3 ${getSuggestionBgColor(suggestion.type)}`}>
                              {getSuggestionIcon(suggestion.type)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{suggestion.name}</div>
                              {suggestion.category && (
                                <div className="text-xs text-gray-500 mt-1">{suggestion.category}</div>
                              )}
                              {suggestion.type === 'product' && renderRating(suggestion.rating || 0, suggestion.reviewCount || 0)}
                            </div>
                          </div>
                          {suggestion.price && (
                            <div className="text-sm font-bold text-gray-900">
                              ${suggestion.price.toLocaleString()}
                            </div>
                          )}
                          {suggestion.popularity && suggestion.type === 'trending' && (
                            <div className="flex items-center text-xs text-amber-600 ml-2">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {suggestion.popularity}%
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="font-medium text-gray-900 mb-1">No results found</h3>
                    <p className="text-sm">Try different keywords or check spelling</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="py-2 border-b border-gray-100">
                    <div className="px-4 py-2 flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-700 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Recent Searches
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-1 px-2">
                      {recentSearches.map((search) => (
                        <button
                          key={search.id}
                          onClick={() => handleSuggestionClick(search.term)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center rounded-lg"
                        >
                          <Clock className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-700">{search.term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                {trending.length > 0 && (
                  <div className="py-2 border-b border-gray-100">
                    <div className="px-4 py-2">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Trending Now
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-3 pb-2">
                      {trending.slice(0, 6).map((item, index) => (
                        <button
                          key={`trending-${item.id}`}
                          onClick={() => handleSuggestionClick(item.name)}
                          className={`text-left p-2 hover:bg-gray-50 transition-colors rounded-lg text-sm ${
                            selectedIndex === suggestions.length + index ? 'bg-amber-50' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900 line-clamp-1">{item.name}</div>
                          {item.price && (
                            <div className="text-xs text-gray-500 mt-1">
                              ${item.price.toLocaleString()}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Categories */}
                {categories.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-2">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Shop by Category
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 px-3 pb-3">
                      {categories.slice(0, 8).map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category.id, category.name)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-800 rounded-full text-sm transition-colors"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default AIPoweredSearch;