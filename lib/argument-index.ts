/**
 * Older argument files carry no objectID, and Algolia assigns a random one to those on every
 * save, so each run would add a second copy. The file name is stable and unique.
 */
export function toIndexRecord<T extends { objectID?: string }>(
  fileName: string,
  argument: T
): T & { objectID: string } {
  return { ...argument, objectID: argument.objectID ?? fileName.replace(/\.json$/, '') };
}
