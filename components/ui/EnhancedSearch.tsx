import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchSuggestion {
  id: number;
  name: string;
  category?: string;
  image?: string;
  popularity?: number;
}

interface RecentSearch {
  id: string;
  term: string;
  timestamp: number;
}

const EnhancedSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
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

  // Fetch search suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate with mock data
      const mockSuggestions: SearchSuggestion[] = [
        { id: 1, name: `${query} Ruby`, category: 'Gemstones', popularity: 95 },
        { id: 2, name: `${query} Sapphire`, category: 'Gemstones', popularity: 88 },
        { id: 3, name: `${query} Emerald`, category: 'Gemstones', popularity: 92 },
        { id: 4, name: `${query} Diamond`, category: 'Gemstones', popularity: 98 },
        { id: 5, name: `${query} Necklace`, category: 'Jewelry', popularity: 75 },
      ];
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex].name);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (term: string) => {
    setSearchQuery(term);
    setShowSuggestions(false);
    // Add to recent searches
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      term,
      timestamp: Date.now()
    };
    setRecentSearches(prev => [newSearch, ...prev.filter(s => s.term !== term)].slice(0, 10));
    // Navigate to search results
    window.location.href = `/shop?search=${encodeURIComponent(term)}`;
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

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
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
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search gemstones, jewelry, or categories..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base shadow-sm transition-all"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          // Removed aria-expanded as it's not supported on input elements
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

      <AnimatePresence>
        {showSuggestions && (searchQuery || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            {searchQuery ? (
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="px-4 py-3 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500 mx-auto"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                      <Search className="w-4 h-4 mr-2" />
                      Search Suggestions
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <button
                          onClick={() => handleSuggestionClick(suggestion.name)}
                          className={`w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors flex items-center justify-between ${
                            selectedIndex === index ? 'bg-amber-50' : ''
                          }`}
                          // Removed aria-selected as it's not supported on button elements
                        >
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{suggestion.name}</span>
                            {suggestion.category && (
                              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {suggestion.category}
                              </span>
                            )}
                          </div>
                          {suggestion.popularity && (
                            <div className="flex items-center text-xs text-amber-600">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {suggestion.popularity}%
                            </div>
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p>No results found for "{searchQuery}"</p>
                    <p className="text-sm mt-1">Try different keywords or check spelling</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2">
                {recentSearches.length > 0 && (
                  <>
                    <div className="px-4 py-2 flex items-center justify-between">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
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
                    {recentSearches.map((search) => (
                      <button
                        key={search.id}
                        onClick={() => handleSuggestionClick(search.term)}
                        className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors flex items-center"
                      >
                        <Clock className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-700">{search.term}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSearch;