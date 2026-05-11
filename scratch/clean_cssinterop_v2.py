import os, re

root = r'c:\Users\krris\Documents\OurEduca - Copy\mobile'

def clean_file(path):
    if 'node_modules' in path or '.expo' in path or '.git' in path:
        return False
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return False
    
    # Remove cssInterop import from nativewind
    new_content = re.sub(r"import\s+\{[^}]*cssInterop[^}]*\}\s+from\s+['\"]nativewind['\"];?\n?", "", content)
    
    # Remove cssInterop( ... ); calls (handling multi-line)
    new_content = re.sub(r"cssInterop\s*\(\s*[^)]+\)\s*;?\n?", "", new_content)
    
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

print(f"Cleaned {count} files in total.")
