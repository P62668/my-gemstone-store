import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface MetaTag {
  id: string;
  name: string;
  content: string;
}

interface SeoAuditProps {
  title: string;
  description: string;
  keywords: string;
  contentLength: number;
  imageUrl?: string;
  slug: string;
  robots?: string;
  canonical?: string;
  metaTags?: MetaTag[];
  structuredData?: any;
}

interface AuditIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  recommendation: string;
}

const SeoAudit: React.FC<SeoAuditProps> = ({ 
  title, 
  description, 
  keywords, 
  contentLength, 
  imageUrl,
  slug,
  robots,
  canonical,
  metaTags,
  structuredData
}) => {
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const newIssues: AuditIssue[] = [];

    // Title checks
    if (!title) {
      newIssues.push({
        type: 'error',
        message: 'Missing page title',
        recommendation: 'Add a compelling title that describes the page content'
      });
    } else {
      if (title.length < 30) {
        newIssues.push({
          type: 'warning',
          message: 'Title is too short',
          recommendation: 'Make the title between 30-60 characters for optimal visibility'
        });
      }
      if (title.length > 60) {
        newIssues.push({
          type: 'warning',
          message: 'Title is too long',
          recommendation: 'Keep the title under 60 characters for optimal visibility'
        });
      }
    }

    // Description checks
    if (!description) {
      newIssues.push({
        type: 'error',
        message: 'Missing meta description',
        recommendation: 'Add a concise description of the page content'
      });
    } else {
      if (description.length < 50) {
        newIssues.push({
          type: 'warning',
          message: 'Description is too short',
          recommendation: 'Make the description between 50-160 characters for optimal visibility'
        });
      }
      if (description.length > 160) {
        newIssues.push({
          type: 'warning',
          message: 'Description is too long',
          recommendation: 'Keep the description under 160 characters for optimal visibility'
        });
      }
    }

    // Keyword checks
    if (!keywords) {
      newIssues.push({
        type: 'info',
        message: 'No keywords specified',
        recommendation: 'Add relevant keywords to help search engines understand your content'
      });
    } else {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      if (keywordList.length < 3) {
        newIssues.push({
          type: 'warning',
          message: 'Not enough keywords specified',
          recommendation: 'Add at least 3-5 relevant keywords to help with SEO'
        });
      }
      
      if (keywords.length > 200) {
        newIssues.push({
          type: 'warning',
          message: 'Keywords too long',
          recommendation: 'Keep keywords under 200 characters in total'
        });
      }
    }

    // Content length checks
    if (contentLength < 300) {
      newIssues.push({
        type: 'warning',
        message: 'Content may be too short',
        recommendation: 'Consider adding more content to provide value to users and search engines'
      });
    }

    // Image checks
    if (!imageUrl) {
      newIssues.push({
        type: 'info',
        message: 'No featured image',
        recommendation: 'Add a featured image to improve social sharing and SEO'
      });
    } else {
      // Check if image URL is valid
      try {
        new URL(imageUrl);
      } catch (e) {
        newIssues.push({
          type: 'warning',
          message: 'Image URL is not valid',
          recommendation: 'Ensure the image URL is properly formatted with http:// or https://'
        });
      }
    }

    // URL checks
    if (slug.includes(' ')) {
      newIssues.push({
        type: 'error',
        message: 'URL contains spaces',
        recommendation: 'Use hyphens instead of spaces in URLs'
      });
    }

    if (slug.length > 75) {
      newIssues.push({
        type: 'warning',
        message: 'URL is too long',
        recommendation: 'Keep URLs short and descriptive (under 75 characters)'
      });
    }

    // Robots meta tag checks
    if (!robots) {
      newIssues.push({
        type: 'info',
        message: 'Robots meta tag not specified',
        recommendation: 'Add a robots meta tag to control search engine crawling'
      });
    } else {
      const robotsValues = robots.toLowerCase().split(',').map(r => r.trim());
      
      if (!robotsValues.includes('index') && !robotsValues.includes('noindex')) {
        newIssues.push({
          type: 'warning',
          message: 'Robots meta tag missing index/noindex directive',
          recommendation: 'Specify whether the page should be indexed (index) or not (noindex)'
        });
      }
      
      if (!robotsValues.includes('follow') && !robotsValues.includes('nofollow')) {
        newIssues.push({
          type: 'warning',
          message: 'Robots meta tag missing follow/nofollow directive',
          recommendation: 'Specify whether links should be followed (follow) or not (nofollow)'
        });
      }
    }

    // Canonical URL checks
    if (!canonical) {
      newIssues.push({
        type: 'info',
        message: 'Canonical URL not specified',
        recommendation: 'Add a canonical URL to avoid duplicate content issues'
      });
    } else {
      try {
        new URL(canonical);
      } catch (e) {
        newIssues.push({
          type: 'warning',
          message: 'Canonical URL is not valid',
          recommendation: 'Ensure the canonical URL is properly formatted with http:// or https://'
        });
      }
      
      // Check if canonical URL matches current URL
      const currentUrl = `https://shankarmala.com/${slug}`;
      if (canonical !== currentUrl) {
        newIssues.push({
          type: 'info',
          message: 'Canonical URL doesn\'t match current page',
          recommendation: `Canonical URL should be ${currentUrl} to match the current page`
        });
      }
    }

    // Meta tags checks
    if (metaTags && metaTags.length > 0) {
      // Check for duplicate meta tags
      const tagNames = metaTags.map(tag => tag.name);
      const uniqueTagNames = [...new Set(tagNames)];
      
      if (tagNames.length !== uniqueTagNames.length) {
        newIssues.push({
          type: 'error',
          message: 'Duplicate meta tags found',
          recommendation: 'Remove duplicate meta tags to avoid conflicts'
        });
      }
      
      // Check for common meta tags
      const commonTags = metaTags.filter(tag => 
        ['viewport', 'author', 'copyright', 'robots', 'canonical'].includes(tag.name)
      );
      
      if (commonTags.length === 0) {
        newIssues.push({
          type: 'info',
          message: 'No common meta tags found',
          recommendation: 'Add common meta tags like viewport, author, and copyright for better SEO'
        });
      }
    }

    // Structured data checks
    if (!structuredData || !Object.keys(structuredData).length) {
      newIssues.push({
        type: 'info',
        message: 'No structured data found',
        recommendation: 'Add structured data to help search engines understand your content better'
      });
    } else {
      // Check Open Graph data
      if (!structuredData.ogTitle || !structuredData.ogDescription || !structuredData.ogImage) {
        newIssues.push({
          type: 'warning',
          message: 'Incomplete Open Graph data',
          recommendation: 'Add missing Open Graph tags for better social media sharing'
        });
      }
      
      // Check Twitter card data
      if (!structuredData.twitterCard || !structuredData.twitterTitle || !structuredData.twitterDescription || !structuredData.twitterImage) {
        newIssues.push({
          type: 'info',
          message: 'Incomplete Twitter card data',
          recommendation: 'Add missing Twitter card tags for better Twitter sharing'
        });
      }
      
      // Check schema markup
      if (!structuredData.schemaMarkup || !structuredData.schemaMarkup.includes('@context')) {
        newIssues.push({
          type: 'info',
          message: 'Schema markup is missing or incomplete',
          recommendation: 'Add proper schema markup to enhance search engine results'
        });
      }
    }

    setIssues(newIssues);
  }, [title, description, keywords, contentLength, imageUrl, slug, robots, canonical, metaTags, structuredData]);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const errorCount = issues.filter(issue => issue.type === 'error').length;
  const warningCount = issues.filter(issue => issue.type === 'warning').length;
  const infoCount = issues.filter(issue => issue.type === 'info').length;

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="font-medium text-gray-800">SEO Audit</span>
          <span className="text-sm text-gray-500">
            {issues.length > 0 ? `${issues.length} issues found` : 'No issues found'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
              <XCircle className="h-4 w-4" />
              {errorCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              <AlertTriangle className="h-4 w-4" />
              {warningCount}
            </span>
          )}
          {infoCount > 0 && (
            <span className="flex items-center gap-1 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              <Info className="h-4 w-4" />
              {infoCount}
            </span>
          )}
          <span className="text-gray-500">
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {issues.length > 0 ? (
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getIssueColor(issue.type)}`}
                >
                  {getIssueIcon(issue.type)}
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{issue.message}</div>
                    <div className="text-sm text-gray-600 mt-1">{issue.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">Great job! No SEO issues found.</p>
              <p className="text-sm text-gray-500 mt-1">Your page is optimized for search engines.</p>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">SEO Summary</h4>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-amber-700 hover:text-amber-900"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500">Title</div>
                <div className="font-medium">{title ? title.length + '/60' : '0/60'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500">Description</div>
                <div className="font-medium">{description ? description.length + '/160' : '0/160'}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500">Content</div>
                <div className="font-medium">{contentLength} words</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500">URL</div>
                <div className="font-medium">{slug.length} chars</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500">Robots</div>
                <div className="font-medium">{robots || 'index, follow'}</div>
              </div>
            </div>
            
            {showDetails && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-800 mb-2">Structured Data</h5>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  {structuredData && Object.keys(structuredData).length ? (
                    <div className="space-y-2">
                      {structuredData.ogTitle && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">•</span>
                          <span>Open Graph title: {structuredData.ogTitle}</span>
                        </div>
                      )}
                      {structuredData.ogDescription && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">•</span>
                          <span>Open Graph description: {structuredData.ogDescription}</span>
                        </div>
                      )}
                      {structuredData.ogImage && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">•</span>
                          <span>Open Graph image: {structuredData.ogImage}</span>
                        </div>
                      )}
                      {structuredData.twitterCard && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">•</span>
                          <span>Twitter card: {structuredData.twitterCard}</span>
                        </div>
                      )}
                      {structuredData.schemaMarkup && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">•</span>
                          <span>Schema markup: {structuredData.schemaMarkup.includes('@context') ? 'Valid' : 'Missing'}</span>
                        </div>
                      )}
                      {!structuredData || !Object.keys(structuredData).length ? (
                        <div className="text-gray-500">No structured data found</div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-gray-500">No structured data found</div>
                  )}
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-gray-800 mb-2">Robots</h5>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {robots ? (
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        <span>Robots: {robots}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Robots: Not specified</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-gray-800 mb-2">Canonical URL</h5>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {canonical ? (
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        <span>Canonical: {canonical}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Canonical: Not specified</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-gray-800 mb-2">Meta Tags</h5>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {metaTags && metaTags.length > 0 ? (
                      <div className="space-y-1">
                        {metaTags.map((tag, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-green-500">•</span>
                            <span>{tag.name}: {tag.content}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">No custom meta tags found</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeoAudit;
