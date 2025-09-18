'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

interface Gemstone {
  id: number;
  name: string;
  price?: number;
  images?: string[] | string;
  category?: { name: string };
}

interface DndKitComponentsProps {
  allGemstones: Gemstone[];
  featuredIds: number[];
  onFeaturedIdsChange: (ids: number[]) => void;
  onRemoveFeatured: (id: number) => void;
  onToggleFeatured: (id: number, isFeatured: boolean) => Promise<void>;
}

// SortableProductCard Component with drag and drop functionality
const SortableProductCard = ({ 
  gem, 
  isFeatured, 
  onToggleFeatured 
}: { 
  gem: Gemstone; 
  isFeatured: boolean; 
  onToggleFeatured: (id: number, isFeatured: boolean) => Promise<void>;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: gem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Parse images from JSON string if needed
  const images = typeof gem.images === 'string' ? JSON.parse(gem.images) : gem.images || [];
  const mainImage = images[0] || '/images/placeholder-gemstone.jpg';

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await onToggleFeatured(gem.id, isFeatured);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative bg-white rounded-2xl shadow-lg border-2 ${
        isFeatured ? 'border-amber-400' : 'border-gray-200'
      } overflow-hidden transition-all duration-200 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={mainImage}
          alt={gem.name}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder-gemstone.jpg';
          }}
        />
        <div {...listeners} className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        </div>
        {isFeatured && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            FEATURED
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{gem.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{gem.category?.name || 'Uncategorized'}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-amber-600">₹{gem.price?.toLocaleString() || '0'}</span>
          <span className="text-xs text-gray-400">ID: {gem.id}</span>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
          isFeatured
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
      >
        {isFeatured ? '⭐ Featured' : '☆ Set Featured'}
      </button>

      {/* Featured Indicator */}
      {isFeatured && (
        <div className="absolute bottom-2 right-2">
          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs border border-amber-200">
            ↕
          </div>
        </div>
      )}
    </div>
  );
};

const DndKitComponents: React.FC<DndKitComponentsProps> = ({
  allGemstones,
  featuredIds,
  onFeaturedIdsChange,
  onRemoveFeatured,
  onToggleFeatured,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get featured gemstones in the correct order
  const featuredGemstones = featuredIds
    .map(id => allGemstones.find(gem => gem.id === id))
    .filter((gem): gem is Gemstone => gem !== undefined);

  // Get non-featured gemstones
  const nonFeaturedGemstones = allGemstones.filter(gem => !featuredIds.includes(gem.id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = featuredIds.indexOf(active.id as number);
      const newIndex = featuredIds.indexOf(over.id as number);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newIds = arrayMove(featuredIds, oldIndex, newIndex);
        onFeaturedIdsChange(newIds);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {/* Featured Products Section */}
        {featuredGemstones.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Featured Products (Drag to Reorder)</h3>
            <SortableContext
              items={featuredIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredGemstones.map((gem) => (
                  <SortableProductCard
                    key={gem.id}
                    gem={gem}
                    isFeatured={true}
                    onToggleFeatured={onToggleFeatured}
                  />
                ))}
              </div>
            </SortableContext>
          </section>
        )}

        {/* All Products Section */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">All Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nonFeaturedGemstones.map((gem) => (
              <SortableProductCard
                key={gem.id}
                gem={gem}
                isFeatured={false}
                onToggleFeatured={onToggleFeatured}
              />
            ))}
          </div>
        </section>
      </div>
    </DndContext>
  );
};

export default DndKitComponents;