#!/bin/bash

# Fix npm permissions
sudo chown -R 501:20 "/Users/apple/.npm"

# Install TipTap packages
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-placeholder

echo "✅ Installation complete!"
