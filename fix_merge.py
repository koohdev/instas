with open('components/studio/url-library-tab.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.startswith('<<<<<<< HEAD'):
        continue
    elif line.startswith('======='):
        skip = True
        continue
    elif line.startswith('>>>>>>> origin/master'):
        skip = False
        continue

    if not skip:
        new_lines.append(line)

with open('components/studio/url-library-tab.tsx', 'w') as f:
    f.writelines(new_lines)
