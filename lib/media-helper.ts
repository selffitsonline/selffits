/**
 * Media optimization helpers for SELFFITS.
 * Replaces heavy inline base64 images with lightweight HTTP streaming media URLs
 * to eliminate megabytes of HTML/RSC payload bloat while preserving 100% of image data.
 */

export function optimizeMediaUrls(data: any, sectionKey: string): any {
  if (!data || typeof data !== "object") return data;

  const clone = JSON.parse(JSON.stringify(data));

  function scan(obj: any, path: string[]) {
    if (!obj || typeof obj !== "object") return;
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === "string" && val.startsWith("data:image/")) {
        const id = obj.id || (path.length > 0 ? path[path.length - 1] : "root");
        const v = val.length;
        obj[key] = `/api/media?section=${encodeURIComponent(sectionKey)}&id=${encodeURIComponent(
          String(id)
        )}&field=${encodeURIComponent(key)}&v=${v}`;
      } else if (typeof val === "object" && val !== null) {
        scan(val, [...path, key]);
      }
    }
  }

  scan(clone, []);
  return clone;
}

export function extractMediaFromSetting(settingValue: any, id: string, field: string): string | null {
  if (!settingValue || typeof settingValue !== "object") return null;

  // Direct top-level match (e.g. homepage_about { imageUrl: "data:..." })
  if (
    settingValue[field] &&
    typeof settingValue[field] === "string" &&
    settingValue[field].startsWith("data:image/")
  ) {
    if (id === "root" || id === "default" || !id) {
      return settingValue[field];
    }
  }

  // Recursive search for object with matching id
  function search(obj: any): string | null {
    if (!obj || typeof obj !== "object") return null;

    if (String(obj.id) === String(id) && obj[field] && typeof obj[field] === "string") {
      return obj[field];
    }

    for (const val of Object.values(obj)) {
      if (typeof val === "object" && val !== null) {
        const found = search(val);
        if (found) return found;
      }
    }
    return null;
  }

  const foundInNested = search(settingValue);
  if (foundInNested) return foundInNested;

  // Fallback: check if the field itself exists anywhere at top level
  if (settingValue[field] && typeof settingValue[field] === "string" && settingValue[field].startsWith("data:image/")) {
    return settingValue[field];
  }

  return null;
}
