// RFC 6901 JSON Pointers, used for the `#<pointer>` part of issue paths (§2.6).

/** Escapes one reference token: `~` becomes `~0`, `/` becomes `~1`. */
export function escapePointerSegment(segment: string): string {
  return segment.replaceAll("~", "~0").replaceAll("/", "~1");
}

/** Builds a JSON Pointer from path segments; `[]` is the whole document (`""`). */
export function toJsonPointer(segments: readonly (string | number)[]): string {
  return segments.map((segment) => `/${escapePointerSegment(String(segment))}`).join("");
}

/** Appends one segment to an existing JSON Pointer. */
export function appendPointer(pointer: string, segment: string | number): string {
  return `${pointer}/${escapePointerSegment(String(segment))}`;
}
