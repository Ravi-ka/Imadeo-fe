import { FOLDER_MAX_DEPTH, FolderNode } from '@/components/dam/types';

export type FlatFolder = {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  children: FolderNode[];
};

/** Flatten tree into a list with depth (root folders = depth 1). */
export function flattenFolderTree(nodes: FolderNode[], depth = 1): FlatFolder[] {
  const result: FlatFolder[] = [];
  for (const node of nodes) {
    result.push({
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      depth,
      children: node.children || [],
    });
    if (node.children?.length) {
      result.push(...flattenFolderTree(node.children, depth + 1));
    }
  }
  return result;
}

export function findFolderNode(
  nodes: FolderNode[],
  id: string
): FolderNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findFolderNode(node.children || [], id);
    if (found) return found;
  }
  return null;
}

/** Breadcrumb path from root to folder (inclusive). */
export function getFolderPath(nodes: FolderNode[], folderId: string): FolderNode[] {
  const walk = (list: FolderNode[], trail: FolderNode[]): FolderNode[] | null => {
    for (const node of list) {
      const next = [...trail, node];
      if (node.id === folderId) return next;
      const found = walk(node.children || [], next);
      if (found) return found;
    }
    return null;
  };
  return walk(nodes, []) || [];
}

/** Depth of a folder (root = 1). Returns 0 if not found. */
export function getFolderDepth(nodes: FolderNode[], folderId: string | null): number {
  if (!folderId) return 0;
  return getFolderPath(nodes, folderId).length;
}

/** Height of subtree rooted at node (leaf = 1). */
export function getSubtreeHeight(node: FolderNode): number {
  if (!node.children?.length) return 1;
  return 1 + Math.max(...node.children.map(getSubtreeHeight));
}

/** Collect id + all descendant ids. */
export function collectDescendantIds(node: FolderNode): Set<string> {
  const ids = new Set<string>([node.id]);
  const walk = (n: FolderNode) => {
    for (const child of n.children || []) {
      ids.add(child.id);
      walk(child);
    }
  };
  walk(node);
  return ids;
}

/**
 * Valid destinations when moving `folderId`.
 * Excludes self, descendants, and destinations where
 * destDepth + 1 + subtreeHeight > FOLDER_MAX_DEPTH.
 * Includes null (workspace root) when the move would fit.
 */
export function getValidFolderMoveDestinations(
  tree: FolderNode[],
  folderId: string
): { id: string | null; name: string; depth: number }[] {
  const node = findFolderNode(tree, folderId);
  if (!node) return [];

  const excluded = collectDescendantIds(node);
  const subtreeHeight = getSubtreeHeight(node);
  const destinations: { id: string | null; name: string; depth: number }[] = [];

  // Root: new depth = subtreeHeight
  if (subtreeHeight <= FOLDER_MAX_DEPTH) {
    destinations.push({ id: null, name: 'Media Assets (Root)', depth: 0 });
  }

  const flat = flattenFolderTree(tree);
  for (const dest of flat) {
    if (excluded.has(dest.id)) continue;
    // Folder under dest would be at dest.depth + 1; subtree extends that by subtreeHeight - 1
    if (dest.depth + subtreeHeight > FOLDER_MAX_DEPTH) continue;
    destinations.push({
      id: dest.id,
      name: dest.name,
      depth: dest.depth,
    });
  }

  return destinations;
}

/** Any folder is a valid asset move destination (no depth limit on assets). */
export function getAssetMoveDestinations(
  tree: FolderNode[]
): { id: string | null; name: string; depth: number }[] {
  return [
    { id: null, name: 'Media Assets (Root)', depth: 0 },
    ...flattenFolderTree(tree).map((f) => ({
      id: f.id,
      name: f.name,
      depth: f.depth,
    })),
  ];
}

export function canCreateSubfolder(currentDepth: number): boolean {
  return currentDepth < FOLDER_MAX_DEPTH;
}
