import os, re

root = r'c:\Users\krris\Documents\OurEduca - Copy\mobile\src\components\modals'
files = [f for f in os.listdir(root) if f.endswith('.tsx') and f != 'ModalShell.tsx']

theme_tokens = ['AppTheme', 'AppTypography', 'AppRadius', 'AppSpacing', 'AppShadows', 'Tokens', 'Colors', 'Typography', 'Layout', 'Motion']

# Mapping for other broken relative imports
alias_mappings = {
    r"['\"](\.\./)+components/Icons['\"]": "'@components/common/Icons'",
    r"['\"](\.\./)+components/common/Icons['\"]": "'@components/common/Icons'",
    r"['\"](\.\./)+types['\"]": "'@/types'",
    r"['\"](\.\./)+utils/haptics['\"]": "'@utils/haptics'",
    r"['\"](\.\./)+constants/motion['\"]": "'@constants/motion'",
    r"['\"](\.\./)+contexts/SchoolDataContext['\"]": "'@context/SchoolDataContext'",
    r"['\"](\.\./)+contexts/SystemStatusContext['\"]": "'@context/SystemStatusContext'",
    r"['\"](\.\./)+components/HardwareStreamPlayer['\"]": "'@components/common/HardwareStreamPlayer'",
    r"['\"](\.\./)+features/platform/constants['\"]": "'@features/platform/constants'",
}

for f in files:
    path = os.path.join(root, f)
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Fix design-system imports
    pattern_ds = r"import\s+{([^}]+)}\s+from\s+['\"]([^'\"]*design-system[^'\"]*)['\"];"
    
    def replace_ds(match):
        imports_str = match.group(1)
        imports = [i.strip() for i in imports_str.split(',') if i.strip()]
        theme_imports = []
        common_imports = []
        modal_imports = []
        for imp in imports:
            if imp in theme_tokens:
                theme_imports.append(imp)
            elif imp == 'ModalShell':
                modal_imports.append(imp)
            else:
                common_imports.append(imp)
        lines = []
        if theme_imports:
            lines.append(f"import {{ {', '.join(theme_imports)} }} from '@constants/Theme';")
        if common_imports:
            lines.append(f"import {{ {', '.join(common_imports)} }} from '@components/common';")
        if modal_imports:
            lines.append(f"import {{ ModalShell }} from './ModalShell';")
        return "\n".join(lines)

    new_content = re.sub(pattern_ds, replace_ds, content)
    
    # 2. Fix other relative imports using aliases
    for pattern, alias in alias_mappings.items():
        new_content = re.sub(pattern, alias, new_content)
    
    # 3. Specifically fix any remaining relative ModalShell imports if they were missed
    new_content = re.sub(r"import\s+{ ModalShell }\s+from\s+['\"]([^'\"]*modals[^'\"]*)['\"];", "import { ModalShell } from './ModalShell';", new_content)

    with open(path, 'w', encoding='utf-8') as file:
        file.write(new_content)

print(f"Refactored {len(files)} files with alias mappings.")
