import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  spacing: {
    container: string;
    section: string;
    element: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  animations: {
    duration: string;
    easing: string;
  };
}

const ThemeAdmin: React.FC = () => {
  const [theme, setTheme] = useState<ThemeSettings>({
    colors: {
      primary: '#d97706',
      secondary: '#f59e0b',
      accent: '#fbbf24',
      background: '#fefefe',
      text: '#1f2937',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    fonts: {
      heading: 'serif',
      body: 'system-ui',
      accent: 'cursive',
    },
    spacing: {
      container: 'max-w-7xl',
      section: 'py-16',
      element: 'p-6',
    },
    borderRadius: {
      small: 'rounded-lg',
      medium: 'rounded-xl',
      large: 'rounded-2xl',
    },
    shadows: {
      small: 'shadow-md',
      medium: 'shadow-lg',
      large: 'shadow-xl',
    },
    animations: {
      duration: '300ms',
      easing: 'ease-in-out',
    },
  });

  const [activeTab, setActiveTab] = useState('colors');
  const [saving, setSaving] = useState(false);

  const handleColorChange = (colorKey: keyof ThemeSettings['colors'], value: string) => {
    setTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const handleFontChange = (fontKey: keyof ThemeSettings['fonts'], value: string) => {
    setTheme((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontKey]: value,
      },
    }));
  };

  const handleSpacingChange = (spacingKey: keyof ThemeSettings['spacing'], value: string) => {
    setTheme((prev) => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [spacingKey]: value,
      },
    }));
  };

  const handleBorderRadiusChange = (
    radiusKey: keyof ThemeSettings['borderRadius'],
    value: string,
  ) => {
    setTheme((prev) => ({
      ...prev,
      borderRadius: {
        ...prev.borderRadius,
        [radiusKey]: value,
      },
    }));
  };

  const handleShadowChange = (shadowKey: keyof ThemeSettings['shadows'], value: string) => {
    setTheme((prev) => ({
      ...prev,
      shadows: {
        ...prev.shadows,
        [shadowKey]: value,
      },
    }));
  };

  const handleAnimationChange = (animKey: keyof ThemeSettings['animations'], value: string) => {
    setTheme((prev) => ({
      ...prev,
      animations: {
        ...prev.animations,
        [animKey]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });
      alert('Theme settings updated successfully!');
    } catch (error) {
      console.error('Failed to save theme:', error);
      alert('Failed to save theme settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (confirm('Are you sure you want to reset to default theme settings?')) {
      setTheme({
        colors: {
          primary: '#d97706',
          secondary: '#f59e0b',
          accent: '#fbbf24',
          background: '#fefefe',
          text: '#1f2937',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        fonts: {
          heading: 'serif',
          body: 'system-ui',
          accent: 'cursive',
        },
        spacing: {
          container: 'max-w-7xl',
          section: 'py-16',
          element: 'p-6',
        },
        borderRadius: {
          small: 'rounded-lg',
          medium: 'rounded-xl',
          large: 'rounded-2xl',
        },
        shadows: {
          small: 'shadow-md',
          medium: 'shadow-lg',
          large: 'shadow-xl',
        },
        animations: {
          duration: '300ms',
          easing: 'ease-in-out',
        },
      });
    }
  };

  const tabs = [
    { id: 'colors', name: 'Colors', icon: '🎨' },
    { id: 'fonts', name: 'Typography', icon: '📝' },
    { id: 'spacing', name: 'Spacing', icon: '📏' },
    { id: 'effects', name: 'Effects', icon: '✨' },
    { id: 'preview', name: 'Preview', icon: '👁️' },
  ];

  const fontOptions = [
    'serif',
    'system-ui',
    'cursive',
    'monospace',
    'Georgia',
    'Times New Roman',
    'Arial',
    'Helvetica',
  ];

  const spacingOptions = ['max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full'];

  const borderRadiusOptions = [
    'rounded-none',
    'rounded-sm',
    'rounded',
    'rounded-md',
    'rounded-lg',
    'rounded-xl',
    'rounded-2xl',
    'rounded-3xl',
  ];

  const shadowOptions = [
    'shadow-none',
    'shadow-sm',
    'shadow',
    'shadow-md',
    'shadow-lg',
    'shadow-xl',
    'shadow-2xl',
  ];

  return (
    <Layout title="Theme Settings - Kolkata Gems">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Theme Settings</h1>
          <p className="text-lg text-gray-600">Customize the visual appearance of your store</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-amber-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Color Palette</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(theme.colors).map(([key, value]) => (
                <div key={key} className="space-y-3">
                  <label className="block text-sm font-semibold text-amber-700 capitalize">
                    {key} Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) =>
                        handleColorChange(key as keyof ThemeSettings['colors'], e.target.value)
                      }
                      className="w-12 h-12 rounded-lg border border-amber-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        handleColorChange(key as keyof ThemeSettings['colors'], e.target.value)
                      }
                      className="flex-1 rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="#000000"
                    />
                  </div>
                  <div
                    className="w-full h-8 rounded-lg border border-amber-200"
                    style={{ backgroundColor: value }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fonts Tab */}
        {activeTab === 'fonts' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Typography</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(theme.fonts).map(([key, value]) => (
                <div key={key} className="space-y-3">
                  <label className="block text-sm font-semibold text-amber-700 capitalize">
                    {key} Font
                  </label>
                  <select
                    value={value}
                    onChange={(e) =>
                      handleFontChange(key as keyof ThemeSettings['fonts'], e.target.value)
                    }
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <div
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50"
                    style={{ fontFamily: value }}
                  >
                    <p className="text-lg font-semibold">Sample Heading</p>
                    <p className="text-sm">Sample body text with {value} font family.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacing Tab */}
        {activeTab === 'spacing' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Spacing & Layout</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(theme.spacing).map(([key, value]) => (
                <div key={key} className="space-y-3">
                  <label className="block text-sm font-semibold text-amber-700 capitalize">
                    {key} Spacing
                  </label>
                  <select
                    value={value}
                    onChange={(e) =>
                      handleSpacingChange(key as keyof ThemeSettings['spacing'], e.target.value)
                    }
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  >
                    {spacingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <p className="text-sm text-gray-600">Current: {value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Visual Effects</h2>

            {/* Border Radius */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Border Radius</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(theme.borderRadius).map(([key, value]) => (
                  <div key={key} className="space-y-3">
                    <label className="block text-sm font-semibold text-amber-700 capitalize">
                      {key} Radius
                    </label>
                    <select
                      value={value}
                      onChange={(e) =>
                        handleBorderRadiusChange(
                          key as keyof ThemeSettings['borderRadius'],
                          e.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                    >
                      {borderRadiusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <div className={`w-full h-16 bg-amber-200 border border-amber-300 ${value}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Shadows */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Shadows</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(theme.shadows).map(([key, value]) => (
                  <div key={key} className="space-y-3">
                    <label className="block text-sm font-semibold text-amber-700 capitalize">
                      {key} Shadow
                    </label>
                    <select
                      value={value}
                      onChange={(e) =>
                        handleShadowChange(key as keyof ThemeSettings['shadows'], e.target.value)
                      }
                      className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                    >
                      {shadowOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <div
                      className={`w-full h-16 bg-white border border-amber-200 rounded-xl ${value}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Animations */}
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-amber-700">
                    Animation Duration
                  </label>
                  <input
                    type="text"
                    value={theme.animations.duration}
                    onChange={(e) => handleAnimationChange('duration', e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="300ms"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-amber-700">
                    Animation Easing
                  </label>
                  <select
                    value={theme.animations.easing}
                    onChange={(e) => handleAnimationChange('easing', e.target.value)}
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="ease-in-out">ease-in-out</option>
                    <option value="ease-in">ease-in</option>
                    <option value="ease-out">ease-out</option>
                    <option value="linear">linear</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Theme Preview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Color Preview */}
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-4">Color Palette</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(theme.colors).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-full h-12 rounded-lg mb-2 border border-amber-200"
                        style={{ backgroundColor: value }}
                      />
                      <p className="text-xs text-gray-600 capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Component Preview */}
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-4">Component Preview</h3>
                <div className="space-y-4">
                  <div
                    className={`p-4 ${theme.borderRadius.medium} ${theme.shadows.medium}`}
                    style={{ backgroundColor: theme.colors.background }}
                  >
                    <h4
                      className="text-lg font-semibold mb-2"
                      style={{
                        fontFamily: theme.fonts.heading,
                        color: theme.colors.text,
                      }}
                    >
                      Sample Heading
                    </h4>
                    <p
                      className="text-sm"
                      style={{
                        fontFamily: theme.fonts.body,
                        color: theme.colors.text,
                      }}
                    >
                      This is a sample component with your current theme settings.
                    </p>
                    <button
                      className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      Sample Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={resetToDefault}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ThemeAdmin;
