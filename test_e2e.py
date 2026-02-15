#!/usr/bin/env python3
"""
End-to-end integration test for duplicate icon deduplication.

This test demonstrates the complete workflow:
1. Start with a YAML file that has duplicate icons
2. Run the deduplication script
3. Verify the output is correct
"""

import os
import tempfile
import shutil
import subprocess
import sys


def test_end_to_end():
    """Test the complete workflow with duplicate icons."""
    
    # Create a temporary directory for testing
    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"Test directory: {tmpdir}")
        
        # Create a test YAML with duplicate icons (like the issue reported)
        test_yaml = """# Test configuration
substitutions:
  # Row 1, Column 1
  r1c1_icon: "\\uea0b"  # bolt icon
  
  # Row 1, Column 2  
  r1c2_icon: "\\uea0b"  # DUPLICATE - also bolt icon
  
  # Row 2, Column 1
  r2c1_icon: "\\ue1ff"  # thermostat icon
  
  # Row 2, Column 2
  r2c2_icon: "\\uea0b"  # DUPLICATE - bolt again!
  
  # Row 3, Column 1
  r3c1_icon: "\\ue1ff"  # DUPLICATE - thermostat again
  
  # Row 3, Column 2
  r3c2_icon: "\\ue88a"  # home icon

font:
  - file: "gfonts://Material Icons"
    id: icon_font
    size: 28
    glyphs: "${icon_glyphs}"  # This would fail with duplicates!
"""
        
        test_yaml_path = os.path.join(tmpdir, 'ha-monitor.yaml')
        with open(test_yaml_path, 'w') as f:
            f.write(test_yaml)
        
        # Copy the script to the test directory
        script_path = os.path.join(tmpdir, 'generate_font_glyphs.py')
        shutil.copy('generate_font_glyphs.py', script_path)
        
        # Run the script
        print("\n--- Running deduplication script ---")
        result = subprocess.run(
            ['python3', 'generate_font_glyphs.py'],
            cwd=tmpdir,
            capture_output=True,
            text=True
        )
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        assert result.returncode == 0, f"Script failed with code {result.returncode}"
        
        # Check the generated file
        glyphs_file = os.path.join(tmpdir, 'font-glyphs.yaml')
        assert os.path.exists(glyphs_file), "font-glyphs.yaml was not created"
        
        with open(glyphs_file, 'r') as f:
            glyphs_content = f.read()
        
        print("\n--- Generated font-glyphs.yaml ---")
        print(glyphs_content)
        
        # Verify the content
        # We should have exactly 3 unique icons: \uea0b, \ue1ff, \ue88a
        assert '\\uea0b' in glyphs_content, "Missing \\uea0b icon"
        assert '\\ue1ff' in glyphs_content, "Missing \\ue1ff icon"
        assert '\\ue88a' in glyphs_content, "Missing \\ue88a icon"
        
        # Count occurrences - each should appear exactly once in the icon_glyphs value
        import re
        match = re.search(r'icon_glyphs:\s*"([^"]+)"', glyphs_content)
        assert match, "Could not find icon_glyphs value"
        
        icon_string = match.group(1)
        print(f"\n--- Deduplicated icon string ---")
        print(f"icon_glyphs: \"{icon_string}\"")
        print(f"Length: {len(icon_string)} characters")
        
        # Verify no duplicates by checking length
        # Each icon is 6 characters (e.g., \uea0b)
        # With 3 unique icons, we expect 18 characters
        assert len(icon_string) == 18, f"Expected 18 characters, got {len(icon_string)}"
        
        # Verify each icon appears exactly once
        assert icon_string.count('\\uea0b') == 1, "\\uea0b appears more than once"
        assert icon_string.count('\\ue1ff') == 1, "\\ue1ff appears more than once"
        assert icon_string.count('\\ue88a') == 1, "\\ue88a appears more than once"
        
        print("\n✓ All end-to-end tests passed!")
        print("  - Original YAML had 6 icon definitions with duplicates")
        print("  - Script correctly identified 3 unique icons")
        print("  - Generated font-glyphs.yaml contains no duplicates")
        return True


if __name__ == '__main__':
    try:
        success = test_end_to_end()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
