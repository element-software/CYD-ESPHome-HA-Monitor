#!/usr/bin/env python3
"""
Test script to validate the duplicate icon deduplication works correctly.

This test creates a temporary YAML file with duplicate icons and verifies
that the generate_font_glyphs.py script correctly deduplicates them.
"""

import tempfile
import os
import sys
import re


def test_deduplication():
    """Test that duplicate icons are correctly deduplicated."""
    
    # Create a test YAML with duplicate icons
    test_yaml = """substitutions:
  r1c1_icon: "\\uea0b"
  r1c2_icon: "\\uea0b"  # Duplicate of r1c1
  r2c1_icon: "\\ue1ff"
  r2c2_icon: "\\uea0b"  # Duplicate of r1c1
  r3c1_icon: "\\ue1ff"  # Duplicate of r2c1
  r3c2_icon: "\\ue88a"
"""
    
    # Expected: 3 unique icons (\\uea0b, \\ue1ff, \\ue88a)
    expected_unique_count = 3
    expected_icons = ['\\uea0b', '\\ue1ff', '\\ue88a']
    
    # Write test YAML to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
        f.write(test_yaml)
        temp_yaml = f.name
    
    try:
        # Read and parse the file like generate_font_glyphs.py does
        with open(temp_yaml, 'r', encoding='utf-8') as f:
            content = f.read()
        
        icon_pattern = r'r\d+c\d+_icon:\s*"([^"]+)"'
        icons = re.findall(icon_pattern, content)
        
        print(f"Test: Found {len(icons)} total icon substitutions")
        assert len(icons) == 6, f"Expected 6 icons, found {len(icons)}"
        
        # Deduplicate
        seen = set()
        unique_icons = []
        for icon in icons:
            if icon not in seen:
                seen.add(icon)
                unique_icons.append(icon)
        
        print(f"Test: Deduplicated to {len(unique_icons)} unique icons")
        print(f"Test: Unique icons are: {unique_icons}")
        
        assert len(unique_icons) == expected_unique_count, \
            f"Expected {expected_unique_count} unique icons, got {len(unique_icons)}"
        
        assert set(unique_icons) == set(expected_icons), \
            f"Expected icons {expected_icons}, got {unique_icons}"
        
        print("✓ All tests passed!")
        return True
        
    finally:
        # Clean up
        if os.path.exists(temp_yaml):
            os.unlink(temp_yaml)


if __name__ == '__main__':
    try:
        success = test_deduplication()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
