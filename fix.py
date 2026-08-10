with open("components/studio/batch-queue-panel.tsx", "r") as f:
    content = f.read()
import re
content = re.sub(r'<<<<<<< Updated upstream.*?=======\n(.*?)\n>>>>>>> Stashed changes', r'\1', content, flags=re.DOTALL)
with open("components/studio/batch-queue-panel.tsx", "w") as f:
    f.write(content)
