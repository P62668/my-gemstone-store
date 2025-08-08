import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Sparkles, TrendingUp, Star } from 'lucide-react';

interface SearchSuggestion {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  type: 'exact' | 'similar' | 'trending';
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: any) => void;
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  categories: any[];
  recentSearches: string[];
  trendingSearches: string[];
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onSuggestionClick,
  categories,
  recentSearches,
  trendingSearches,
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    priceRange: [0, 100000],
    rating: '',
    availability: 'all',
    sortBy: 'relevance',
  });
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock suggestions - in real app, this would come from API
  const mockSuggestions: SearchSuggestion[] = [
    {
      id: 1,
      name: 'Natural Ruby',
      category: 'Ruby',
      price: 25000,
      image: '/images/ruby1.jpg',
      rating: 4.8,
      type: 'exact',
    },
    {
      id: 2,
      name: 'Emerald Stone',
      category: 'Emerald',
      price: 35000,
      image: '/images/emerald1.jpg',
      rating: 4.6,
      type: 'similar',
    },
    {
      id: 3,
      name: 'Sapphire Ring',
      category: 'Sapphire',
      price: 45000,
      image: '/images/sapphire1.jpg',
      rating: 4.9,
      type: 'trending',
    },
  ];

  useEffect(() => {
    if (query.length > 2) {
      setSuggestions(
        mockSuggestions.filter(
          (item) =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase()),
        ),
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    onSearch(query, selectedFilters);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all duration-300">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search gemstones, categories, or descriptions..."
              className="w-full pl-12 pr-4 py-4 text-lg border-none outline-none bg-transparent"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>

          <button
            onClick={handleSearch}
            className="px-6 py-4 bg-amber-600 text-white rounded-r-2xl hover:bg-amber-700 transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedFilters.category}
                  onChange={(e) =>
                    setSelectedFilters({ ...selectedFilters, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={selectedFilters.priceRange[0]}
                    onChange={(e) =>
                      setSelectedFilters({
                        ...selectedFilters,
                        priceRange: [parseInt(e.target.value) || 0, selectedFilters.priceRange[1]],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={selectedFilters.priceRange[1]}
                    onChange={(e) =>
                      setSelectedFilters({
                        ...selectedFilters,
                        priceRange: [
                          selectedFilters.priceRange[0],
                          parseInt(e.target.value) || 100000,
                        ],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={selectedFilters.rating}
                  onChange={(e) =>
                    setSelectedFilters({ ...selectedFilters, rating: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={selectedFilters.sortBy}
                  onChange={(e) =>
                    setSelectedFilters({ ...selectedFilters, sortBy: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {trendingSearches.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Trending
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm hover:bg-amber-200 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Suggestions
                </h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => onSuggestionClick(suggestion)}
                      className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <img
                        src={suggestion.image}
                        alt={suggestion.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{suggestion.name}</div>
                        <div className="text-sm text-gray-500">{suggestion.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ₹{suggestion.price.toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="w-4 h-4 fill-current text-yellow-400" />
                          {suggestion.rating}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query.length > 2 && suggestions.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">Try different keywords or browse categories</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;
