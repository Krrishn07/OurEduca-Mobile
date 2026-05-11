import os, re

root = r'c:\Users\krris\Documents\OurEduca - Copy\mobile\src'

def clean_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove cssInterop import from nativewind
    # Handle cases like: import { cssInterop } from 'nativewind';
    # and import { styled, cssInterop } from 'nativewind';
    new_content = re.sub(r"import\s+\{[^}]*cssInterop[^}]*\}\s+from\s+['\"]nativewind['\"];?\n?", "", content)
    
    # Remove cssInterop( ... ); calls
    new_content = re.sub(r"cssInterop\s*\([^;]+;?\n?", "", new_content)
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

count = 0
for dirpath, dirnames, filenames in os.walk(root):
    for f in filenames:
        if f.endswith('.tsx') or f.endswith('.ts'):
            if clean_file(os.path.join(dirpath, f)):
                count += 1

print(f"Cleaned {count} files.")
