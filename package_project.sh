#!/bin/bash
# This script packages up the project into a .zip file while ignoring files
# as specified in .gitignore, in the same way Git does.

# Ensure the zip command is available.
if ! command -v zip >/dev/null 2>&1; then
  echo "Error: zip command not found. Please install zip and try again."
  exit 1
fi

# Generate a timestamped zip filename.
ZIPFILE="project-$(date +%Y%m%d%H%M%S).zip"

# Use Git to list all files that are either tracked or untracked but not ignored.
# This covers all files you'd want to include in your package.
FILE_LIST=$(git ls-files --cached --others --exclude-standard)

# Check if any files were found.
if [ -z "$FILE_LIST" ]; then
  echo "No files found to zip. Exiting."
  exit 0
fi

echo "Creating zip archive: $ZIPFILE"
# Pipe the file list into zip. The -@ option tells zip to read file names from STDIN.
echo "$FILE_LIST" | zip "$ZIPFILE" -@
echo "Archive created successfully: $ZIPFILE"
