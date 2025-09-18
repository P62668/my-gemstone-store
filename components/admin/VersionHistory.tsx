import React, { useState } from 'react';
import { History, Eye, ArrowLeft, ArrowRight } from 'lucide-react';

interface Version {
  id: number;
  version: number;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

interface VersionHistoryProps {
  versions: Version[];
  currentPageVersion: number;
  onViewVersion: (version: number) => void;
  onRestoreVersion: (version: number) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ 
  versions, 
  currentPageVersion,
  onViewVersion,
  onRestoreVersion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewVersion = (version: number) => {
    setSelectedVersion(version);
    onViewVersion(version);
  };

  const handleRestoreVersion = (version: number) => {
    if (window.confirm(`Are you sure you want to restore version ${version}? This will replace the current content.`)) {
      onRestoreVersion(version);
      setIsOpen(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-amber-600" />
          <span className="font-medium text-gray-800">Version History</span>
          <span className="text-sm text-gray-500">
            {versions.length} versions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Current: v{currentPageVersion}
          </span>
          <span className="text-gray-500">
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {versions.length > 0 ? (
            <div className="space-y-3">
              {versions.map((version) => (
                <div 
                  key={version.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    version.version === currentPageVersion 
                      ? 'border-amber-300 bg-amber-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      version.version === currentPageVersion 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      v{version.version}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        Version {version.version}
                        {version.version === currentPageVersion && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(version.createdAt)} by {version.author.firstName} {version.author.lastName}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewVersion(version.version)}
                      className="p-2 text-gray-500 hover:text-amber-600 rounded-full hover:bg-gray-100"
                      title="Preview version"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {version.version !== currentPageVersion && (
                      <button
                        onClick={() => handleRestoreVersion(version.version)}
                        className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100"
                        title="Restore version"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No version history available</p>
              <p className="text-sm text-gray-500 mt-1">Versions will be created when you save changes</p>
            </div>
          )}
          
          {selectedVersion && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">Previewing Version {selectedVersion}</h4>
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="text-sm text-amber-600 hover:text-amber-800"
                >
                  Close Preview
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>This is a preview of version {selectedVersion}. To restore this version, click the restore button above.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VersionHistory;