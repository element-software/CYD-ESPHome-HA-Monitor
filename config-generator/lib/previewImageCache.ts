class PreviewImageCache {
  private cache = new Map<string, string>();

  public set(path: string, objectUrl: string) {
    const existing = this.cache.get(path);
    if (existing && existing.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(existing);
      } catch {
        // Ignore errors
      }
    }
    this.cache.set(path, objectUrl);
  }

  public get(path: string): string | undefined {
    return this.cache.get(path);
  }
}

export const previewImageCache = new PreviewImageCache();
