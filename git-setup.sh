#!/bin/bash

# Create a new Git command called 'quickpush'
echo '#!/bin/bash

message="$1"
if [ -z "$message" ]; then
    echo "Please provide a commit message"
    echo "Usage: git quickpush \"your commit message\""
    exit 1
fi

git add .
git commit -m "$message"
git push origin main' > ~/.local/bin/git-quickpush

# Make the script executable
chmod +x ~/.local/bin/git-quickpush

# Add the directory to PATH if not already there
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
fi

# Usage instructions
echo "Git quickpush command has been created!"
echo "To use it, type: git quickpush "vercel"
