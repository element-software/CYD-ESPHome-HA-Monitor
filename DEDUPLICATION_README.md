# Duplicate Icon Fix

This directory contains the solution for handling duplicate Material Icons in the ESPHome configuration.

## The Problem

When using the same Material Icon multiple times across different sensor slots, ESPHome would throw an error:
```
Found duplicate glyph: (b'\\uea0b').
```

This happened because the font glyphs were concatenated like:
```yaml
glyphs: "${r1c1_icon}${r1c2_icon}${r3c1_icon}"  # Creates duplicates!
```

## The Solution

We use a Python script to deduplicate the icons:

1. **`generate_font_glyphs.py`** - Reads `ha-monitor.yaml`, extracts all icon substitutions, deduplicates them, and generates `font-glyphs.yaml`

2. **`font-glyphs.yaml`** - Auto-generated file containing the deduplicated `icon_glyphs` substitution

3. **`ha-monitor.yaml`** - Updated to include `font-glyphs.yaml` and use `${icon_glyphs}` in the font configuration

## Usage

After changing any icon values in `ha-monitor.yaml`, run:
```bash
python3 generate_font_glyphs.py
```

This will regenerate `font-glyphs.yaml` with deduplicated icons.

## Testing

Run the tests to verify the deduplication works:
```bash
python3 test_deduplication.py  # Unit test
python3 test_e2e.py            # End-to-end test
```

Both tests should pass with "✓ All tests passed!" messages.
