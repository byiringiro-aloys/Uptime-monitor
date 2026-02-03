import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    {
      keys: ['M'],
      description: 'Toggle dark/light theme (when not typing)'
    },
    {
      keys: ['Ctrl', 'Shift', 'D'],
      macKeys: ['Cmd', 'Shift', 'D'],
      description: 'Toggle dark/light theme (alternative)'
    },
    {
      keys: ['Esc'],
      description: 'Close modals and menus'
    }
  ];

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* Keyboard shortcuts button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-full shadow-lg transition-colors z-40"
        title="Keyboard shortcuts"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-5 w-5" />
      </button>

      {/* Shortcuts modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-primary-900 rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-primary-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="p-6 space-y-4">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center space-x-1">
                    {(isMac && shortcut.macKeys ? shortcut.macKeys : shortcut.keys).map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-primary-800 border border-gray-300 dark:border-primary-700 rounded">
                          {key}
                        </kbd>
                        {keyIndex < (isMac && shortcut.macKeys ? shortcut.macKeys : shortcut.keys).length - 1 && (
                          <span className="text-gray-400 dark:text-gray-500">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-primary-800 rounded">Esc</kbd> to close this dialog
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;