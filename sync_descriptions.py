#!/usr/bin/env python3
import re
import os

# Read the markdown table
with open('mcp_tool_descriptions_table_2026-04.md', 'r') as f:
    content = f.read()

# Parse all tools with their descriptions
tools = {}
lines = content.strip().split('\n')
for line in lines[1:]:  # Skip header
    parts = [p.strip().strip('`') for p in line.split('|')[1:-1]]
    if len(parts) >= 4:
        tool_name = parts[0]
        describe_after = parts[3]
        tools[tool_name] = describe_after

print(f"Parsed {len(tools)} tools from markdown table\n")

# Module to file mapping
module_files = {
    'account': 'src/tools/account.ts',
    'activity': 'src/tools/activity.ts',
    'alpha': 'src/tools/alpha.ts',
    'coupon': 'src/tools/coupon.ts',
    'cross_ex': 'src/tools/cross_ex.ts',
    'delivery': 'src/tools/delivery.ts',
    'earn': 'src/tools/earn.ts',
    'flash_swap': 'src/tools/flash_swap.ts',
    'futures': 'src/tools/futures.ts',
    'launch': 'src/tools/launch.ts',
    'margin': 'src/tools/margin.ts',
    'multi_collateral_loan': 'src/tools/multi_collateral_loan.ts',
    'options': 'src/tools/options.ts',
    'p2p': 'src/tools/p2p.ts',
    'rebate': 'src/tools/rebate.ts',
    'spot': 'src/tools/spot.ts',
    'square': 'src/tools/square.ts',
    'sub_account': 'src/tools/sub_account.ts',
    'trad_fi': 'src/tools/trad_fi.ts',
    'unified': 'src/tools/unified.ts',
    'wallet': 'src/tools/wallet.ts',
    'welfare': 'src/tools/welfare.ts',
}

# Process each module file
total_updated = 0
total_files = 0

for module, filepath in module_files.items():
    if not os.path.exists(filepath):
        print(f"Warning: {filepath} not found")
        continue

    with open(filepath, 'r') as f:
        file_content = f.read()

    original = file_content
    file_count = 0

    # Pattern to match multi-line server.tool() calls
    # server.tool(\n    'tool_name',\n    'description',
    pattern = r"(server\.tool\(\s*\n\s*)'([^']+)'(\s*,\s*\n\s*)'([^']+)'(\s*,)"

    matches = list(re.finditer(pattern, file_content))

    # Process matches in reverse order to preserve positions
    for match in reversed(matches):
        full_match = match.group(0)
        prefix = match.group(1)  # server.tool(\n
        tool_name = match.group(2)
        middle = match.group(3)  # ,\n
        old_desc = match.group(4)
        suffix = match.group(5)  # ,

        if tool_name in tools:
            new_desc = tools[tool_name]
            if old_desc != new_desc:
                file_count += 1
                new_match = f"{prefix}'{tool_name}'{middle}'{new_desc}'{suffix}"
                file_content = file_content[:match.start()] + new_match + file_content[match.end():]

    if file_count > 0:
        with open(filepath, 'w') as f:
            f.write(file_content)
        print(f"Updated {filepath}: {file_count} changes")
        total_updated += file_count
        total_files += 1
    else:
        print(f"No changes needed in {filepath}")

print(f"\n=== Summary ===")
print(f"Files updated: {total_files}")
print(f"Descriptions updated: {total_updated}")
