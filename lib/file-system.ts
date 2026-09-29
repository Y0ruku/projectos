import {
  DiskBlock,
  FileItem,
} from "./types";

export const TOTAL_BLOCKS = 32;

export const BLOCK_SIZE = 1;

/**
 * สร้าง Virtual Disk
 */
export function createInitialDisk(): DiskBlock[] {
  return Array.from(
    { length: TOTAL_BLOCKS },
    (_, index) => ({
      index,
      fileId: null,
    })
  );
}

/**
 * คำนวณพื้นที่ที่ใช้งาน
 */
export function getUsedBlocks(
  disk: DiskBlock[]
): number {
  return disk.filter(
    (block) => block.fileId !== null
  ).length;
}

/**
 * คำนวณพื้นที่ว่าง
 */
export function getFreeBlocks(
  disk: DiskBlock[]
): number {
  return disk.filter(
    (block) => block.fileId === null
  ).length;
}

/**
 * คำนวณเปอร์เซ็นต์พื้นที่
 */
export function getUsagePercentage(
  disk: DiskBlock[]
): number {
  const used = getUsedBlocks(disk);

  return Math.round(
    (used / TOTAL_BLOCKS) * 100
  );
}

/**
 * สร้าง File
 */
export function createFileItem(
  id: number,
  name: string,
  size: number,
  blocks: number[],
  parentId: number | null
): FileItem {
  return {
    id,
    name,
    type: "file",
    size,
    blocks,
    parentId,
    createdAt: new Date().toLocaleTimeString(
      "th-TH"
    ),
  };
}

/**
 * สร้าง Folder
 */
export function createFolderItem(
  id: number,
  name: string,
  parentId: number | null
): FileItem {
  return {
    id,
    name,
    type: "folder",
    size: 0,
    blocks: [],
    parentId,
    createdAt: new Date().toLocaleTimeString(
      "th-TH"
    ),
  };
}