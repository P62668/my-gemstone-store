import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'button' | 'divider';
  content: any;
  settings?: {
    alignment?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

interface PageRendererProps {
  content: ContentBlock[];
}

const PageRenderer: React.FC<PageRendererProps> = ({ content }) => {
  const renderBlock = (block: ContentBlock) => {
    // Handle alignment
    const alignmentClass = block.settings?.alignment === 'center' 
      ? 'text-center' 
      : block.settings?.alignment === 'right' 
        ? 'text-right' 
        : 'text-left';
        
    // Handle padding
    const paddingClass = block.settings?.padding || 'py-4';
    
    // Handle background color - only use predefined safe colors to prevent XSS
    const bgClass = block.settings?.backgroundColor ? 
      `bg-${block.settings.backgroundColor.replace(/[^a-zA-Z0-9\-]/g, '')}-100` : '';
      
    // Handle text color - only use predefined safe colors to prevent XSS
    const textClass = block.settings?.textColor ? 
      `text-${block.settings.textColor.replace(/[^a-zA-Z0-9\-]/g, '')}-800` : '';

    const containerClasses = `${alignmentClass} ${paddingClass} ${bgClass} ${textClass}`;

    switch (block.type) {
      case 'text':
        return (
          <div 
            key={block.id} 
            className={containerClasses}
            dangerouslySetInnerHTML={{ __html: block.content }} 
          />
        );
      
      case 'image':
        return (
          <div key={block.id} className={`${containerClasses} flex flex-col items-center`}>
            {block.content.url && (
              <>
                <Image 
                  src={block.content.url} 
                  alt={block.content.alt || 'Image'} 
                  width={600} 
                  height={400} 
                  className="rounded-lg object-cover"
                />
                {block.content.caption && (
                  <p className="text-sm text-gray-600 mt-2">{block.content.caption}</p>
                )}
              </>
            )}
          </div>
        );
      
      case 'video':
        return (
          <div key={block.id} className={`${containerClasses} flex flex-col items-center`}>
            {block.content.url && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                {/* In a real implementation, this would be an actual video embed */}
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-gray-300 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                    <p className="mt-2 text-gray-600">Video: {block.content.title || 'Embedded Video'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'button':
        // Determine button style classes
        let buttonClasses = "inline-block px-6 py-3 rounded-lg font-semibold transition-all ";
        switch (block.content.style) {
          case 'secondary':
            buttonClasses += "bg-gray-200 text-gray-800 hover:bg-gray-300";
            break;
          case 'outline':
            buttonClasses += "border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white";
            break;
          default: // primary
            buttonClasses += "bg-amber-600 text-white hover:bg-amber-700";
        }
        
        return (
          <div key={block.id} className={`${containerClasses} flex justify-center`}>
            <Link 
              href={block.content.url || '#'} 
              className={buttonClasses}
            >
              {block.content.text}
            </Link>
          </div>
        );
      
      case 'divider':
        return (
          <div key={block.id} className="my-6">
            <hr className="border-t border-gray-300" />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {content.map(renderBlock)}
    </div>
  );
};

export default PageRenderer;