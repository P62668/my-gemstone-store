import React from 'react';
import { create } from 'react-test-renderer';
import PreviewModal from '../../../components/admin/PreviewModal';

// Simple mock for PageRenderer
jest.mock('../../../components/PageRenderer', () => {
  return function MockPageRenderer() {
    return <div>Page Renderer</div>;
  };
});

describe('PreviewModal', () => {
  const mockContent = [
    {
      id: '1',
      type: 'text',
      content: '<p>Test text content</p>',
    },
  ];

  const mockSeo = {
    title: 'Test Page Title',
    description: 'Test page description',
    keywords: 'test, page, keywords',
  };

  it('renders correctly when open', () => {
    const component = create(
      <PreviewModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockContent}
        title="Test Page"
        seo={mockSeo}
      />
    );
    
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('does not render when isOpen is false', () => {
    const component = create(
      <PreviewModal
        isOpen={false}
        onClose={jest.fn()}
        content={mockContent}
        title="Test Page"
        seo={mockSeo}
      />
    );
    
    expect(component.toJSON()).toBeNull();
  });
});