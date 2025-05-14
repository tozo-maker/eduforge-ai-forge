
import { Outline, OutlineVersion } from '@/types/outline';

// In a real app, this would be in a database
let outlineVersions: OutlineVersion[] = [];

// Save a new version of an outline
export const saveOutlineVersion = (outline: Outline, message?: string): OutlineVersion => {
  const newVersion: OutlineVersion = {
    id: crypto.randomUUID(),
    outlineId: outline.id,
    version: outline.version,
    data: JSON.parse(JSON.stringify(outline)), // Deep clone
    createdAt: new Date(),
    message: message || `Version ${outline.version}`
  };
  
  outlineVersions.push(newVersion);
  return newVersion;
};

// Get all versions of an outline
export const getOutlineVersions = (outlineId: string): OutlineVersion[] => {
  return outlineVersions
    .filter(version => version.outlineId === outlineId)
    .sort((a, b) => b.version - a.version);
};

// Get a specific version of an outline
export const getOutlineVersion = (versionId: string): OutlineVersion | undefined => {
  return outlineVersions.find(version => version.id === versionId);
};

// Restore a previous version
export const restoreOutlineVersion = (outline: Outline, versionId: string): Outline | null => {
  const version = getOutlineVersion(versionId);
  if (!version) return null;
  
  // Create a new version with incremented version number
  const restoredOutline: Outline = {
    ...JSON.parse(JSON.stringify(version.data)),
    version: outline.version + 1,
    updatedAt: new Date(),
    parentVersionId: version.id
  };
  
  return restoredOutline;
};

// Create a branch from an existing outline
export const createOutlineBranch = (outline: Outline, branchName: string): Outline => {
  // Create a new outline based on the existing one
  const branchedOutline: Outline = {
    ...JSON.parse(JSON.stringify(outline)),
    id: crypto.randomUUID(),
    title: `${outline.title} (${branchName})`,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    parentVersionId: outline.id
  };
  
  return branchedOutline;
};

// Compare two outline versions (returns a simple diff summary)
export const compareOutlineVersions = (
  versionAId: string,
  versionBId: string
): { added: number; removed: number; modified: number } => {
  const versionA = getOutlineVersion(versionAId);
  const versionB = getOutlineVersion(versionBId);
  
  if (!versionA || !versionB) {
    return { added: 0, removed: 0, modified: 0 };
  }
  
  // Simple comparison (would be more sophisticated in real implementation)
  // Count nodes in each version
  const countNodes = (nodes: any[]): Map<string, any> => {
    const map = new Map();
    const process = (node: any) => {
      map.set(node.id, node);
      node.children.forEach(process);
    };
    nodes.forEach(process);
    return map;
  };
  
  const nodesA = countNodes(versionA.data.rootNodes);
  const nodesB = countNodes(versionB.data.rootNodes);
  
  let added = 0;
  let removed = 0;
  let modified = 0;
  
  // Find added nodes
  nodesB.forEach((node, id) => {
    if (!nodesA.has(id)) {
      added++;
    } else {
      // Check if modified (simplified check)
      const nodeA = nodesA.get(id);
      if (nodeA.title !== node.title || nodeA.description !== node.description) {
        modified++;
      }
    }
  });
  
  // Find removed nodes
  nodesA.forEach((_, id) => {
    if (!nodesB.has(id)) {
      removed++;
    }
  });
  
  return { added, removed, modified };
};
