import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NavigationHelperProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const NavigationHelper: React.FC<NavigationHelperProps> = ({ 
  breadcrumbs = [], 
  title, 
  subtitle,
  actions 
}) => {
  const router = useRouter();
  
  // Generate breadcrumbs from current route if not provided
  const generatedBreadcrumbs = breadcrumbs.length > 0 
    ? breadcrumbs 
    : generateBreadcrumbsFromPath(router.pathname);
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex py-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-amber-600 hover:text-amber-700">
                <Home className="w-4 h-4" />
              </Link>
            </li>
            
            {generatedBreadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                {item.href ? (
                  <Link 
                    href={item.href} 
                    className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors luxury-nav-link luxury-ripple"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-gray-500 luxury-font-serif">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        
        {/* Page Header */}
        {(title || subtitle || actions) && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 border-t border-gray-100">
            <div className="mb-4 md:mb-0">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900 luxury-font-serif">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            
            {actions && (
              <div className="flex space-x-3">
                {actions}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to generate breadcrumbs from path
const generateBreadcrumbsFromPath = (path: string): BreadcrumbItem[] => {
  const pathParts = path.split('/').filter(part => part !== '');
  
  if (pathParts.length === 0) {
    return [{ label: 'Home', href: '/' }];
  }
  
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  
  let currentPath = '';
  
  for (const part of pathParts) {
    currentPath += `/${part}`;
    
    // Convert kebab-case to Title Case
    const label = part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({ 
      label, 
      href: currentPath 
    });
  }
  
  // Remove href from last item (current page)
  if (breadcrumbs.length > 0) {
    delete breadcrumbs[breadcrumbs.length - 1].href;
  }
  
  return breadcrumbs;
};

export default NavigationHelper;