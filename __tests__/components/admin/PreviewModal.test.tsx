import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PreviewModal from '../../../components/admin/PreviewModal';

// Mock the PageRenderer component since it's an external dependency
jest.mock('../../../components/PageRenderer', () => {
  return {
    __esModule: true,
    default: ({ content }: any) => (
      <div data-testid="page-renderer">
        {content.map((block: any) => (
          <div key={block.id} data-testid={`block-${block.type}`}>
            {block.type} block
          </div>
        ))}
      </div>
    ),
  };
});

describe('PreviewModal', () => {
  const mockContent = [
    {
      id: '1',
      type: 'text',
      content: '<p>Test text content</p>',
      settings: {
        alignment: 'left',
        padding: 'py-4',
      },
    },
    {
      id: '2',
      type: 'image',
      content: {
        url: 'https://example.com/image.jpg',
        alt: 'Test image',
      },
      settings: {
        alignment: 'center',
      },
    },
  ];

  const mockSeo = {
    title: 'Test Page Title',
    description: 'Test page description',
    keywords: 'test, page, keywords',
    ogImage: 'https://example.com/og-image.jpg',
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    content: mockContent,
    title: 'Test Page',
    seo: mockSeo,
  };

  it('renders correctly when open', () => {
    render(<PreviewModal {...defaultProps} />);
    
    // Check that the modal is rendered
    expect(screen.getByText('Page Preview: Test Page Title')).toBeInTheDocument();
    
    // Check that content blocks are rendered
    expect(screen.getByTestId('page-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('block-text')).toBeInTheDocument();
    expect(screen.getByTestId('block-image')).toBeInTheDocument();
    
    // Check that SEO information is displayed
    expect(screen.getByText('Test Page Title')).toBeInTheDocument();
    expect(screen.getByText('Test page description')).toBeInTheDocument();
    expect(screen.getByText('test, page, keywords')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<PreviewModal {...defaultProps} isOpen={false} />);
    
    // Check that the modal is not in the document
    expect(screen.queryByText('Page Preview: Test Page Title')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    render(<PreviewModal {...defaultProps} onClose={onCloseMock} />);
    
    // Click the close button (X icon)
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Check that onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when background overlay is clicked', () => {
    const onCloseMock = jest.fn();
    render(<PreviewModal {...defaultProps} onClose={onCloseMock} />);
    
    // Click the background overlay
    const overlay = screen.getByRole('button', { hidden: true });
    fireEvent.click(overlay);
    
    // Check that onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('uses page title when SEO title is not set', () => {
    const propsWithoutSeoTitle = {
      ...defaultProps,
      seo: {
        ...mockSeo,
        title: '',
      },
    };
    
    render(<PreviewModal {...propsWithoutSeoTitle} />);
    
    // Should display the page title since SEO title is empty
    expect(screen.getByText('Page Preview: Test Page')).toBeInTheDocument();
  });

  it('displays SEO information correctly', () => {
    render(<PreviewModal {...defaultProps} />);
    
    // Check that SEO information is displayed
    expect(screen.getByText('Title:')).toBeInTheDocument();
    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(screen.getByText('Keywords:')).toBeInTheDocument();
    expect(screen.getByText('OG Image:')).toBeInTheDocument();
    
    // Check that "Not set" is displayed when fields are empty
    const propsWithEmptySeo = {
      ...defaultProps,
      seo: {
        title: '',
        description: '',
        keywords: '',
      },
    };
    
    render(<PreviewModal {...propsWithEmptySeo} />);
    expect(screen.getByText('Title: Not set')).toBeInTheDocument();
    expect(screen.getByText('Description: Not set')).toBeInTheDocument();
    expect(screen.getByText('Keywords: Not set')).toBeInTheDocument();
  });
});