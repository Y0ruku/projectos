import {
  AllocationResult,
  DiskBlock,
  FileItem,
} from "./types";

/**
 * Contiguous Allocation
 *
 * หา Block ที่ว่างและต้องอยู่ติดกัน
 */
export function contiguousAllocation(
  disk: DiskBlock[],
  requiredBlocks: number
): AllocationResult {
  if (requiredBlocks <= 0) {
    return {
      success: false,
      blocks: [],
      message: "จำนวน Block ต้องมากกว่า 0",
    };
  }

  let consecutiveBlocks: number[] = [];

  for (const block of disk) {
    if (block.fileId === null) {
      consecutiveBlocks.push(block.index);

      if (consecutiveBlocks.length === requiredBlocks) {
        return {
          success: true,
          blocks: [...consecutiveBlocks],
          message: `จัดสรรพื้นที่แบบ Contiguous สำเร็จ ${requiredBlocks} Blocks`,
        };
      }
    } else {
      consecutiveBlocks = [];
    }
  }

  return {
    success: false,
    blocks: [],
    message:
      "ไม่สามารถจัดสรรพื้นที่แบบ Contiguous ได้ เนื่องจากไม่มีพื้นที่ว่างที่ต่อเนื่องกันเพียงพอ",
  };
}

/**
 * Linked Allocation
 *
 * Block ไม่จำเป็นต้องอยู่ติดกัน
 */
export function linkedAllocation(
  disk: DiskBlock[],
  requiredBlocks: number
): AllocationResult {
  const freeBlocks = disk
    .filter((block) => block.fileId === null)
    .slice(0, requiredBlocks)
    .map((block) => block.index);

  if (freeBlocks.length < requiredBlocks) {
    return {
      success: false,
      blocks: [],
      message: "พื้นที่ Disk ไม่เพียงพอสำหรับ Linked Allocation",
    };
  }

  return {
    success: true,
    blocks: freeBlocks,
    message: `จัดสรรพื้นที่แบบ Linked สำเร็จ ${requiredBlocks} Blocks`,
  };
}

/**
 * Indexed Allocation
 *
 * ใช้ Index Block 1 Block
 * แล้วเก็บ Data Blocks แยกออกจากกันได้
 */
export function indexedAllocation(
  disk: DiskBlock[],
  requiredBlocks: number
): AllocationResult {
  const freeBlocks = disk
    .filter((block) => block.fileId === null)
    .map((block) => block.index);

  // ต้องใช้ 1 Block สำหรับ Index
  const totalRequired = requiredBlocks + 1;

  if (freeBlocks.length < totalRequired) {
    return {
      success: false,
      blocks: [],
      message:
        "พื้นที่ Disk ไม่เพียงพอสำหรับ Indexed Allocation",
    };
  }

  const selectedBlocks = freeBlocks.slice(0, totalRequired);

  return {
    success: true,
    blocks: selectedBlocks,
    message:
      `จัดสรรพื้นที่แบบ Indexed สำเร็จ ` +
      `(Index Block 1 + Data Blocks ${requiredBlocks})`,
  };
}

/**
 * เลือก Allocation Algorithm
 */
export function allocateBlocks(
  disk: DiskBlock[],
  requiredBlocks: number,
  method: "contiguous" | "linked" | "indexed"
): AllocationResult {
  switch (method) {
    case "contiguous":
      return contiguousAllocation(disk, requiredBlocks);

    case "linked":
      return linkedAllocation(disk, requiredBlocks);

    case "indexed":
      return indexedAllocation(disk, requiredBlocks);

    default:
      return {
        success: false,
        blocks: [],
        message: "ไม่พบ Allocation Method",
      };
  }
}

/**
 * คำนวณ Fragmentation
 */
export function calculateFragmentation(
  disk: DiskBlock[]
) {
  let totalFreeBlocks = 0;
  let largestFreeBlock = 0;
  let currentFreeBlock = 0;
  let freeGroups = 0;

  for (const block of disk) {
    if (block.fileId === null) {
      totalFreeBlocks++;
      currentFreeBlock++;

      if (currentFreeBlock > largestFreeBlock) {
        largestFreeBlock = currentFreeBlock;
      }
    } else {
      if (currentFreeBlock > 0) {
        freeGroups++;
      }

      currentFreeBlock = 0;
    }
  }

  if (currentFreeBlock > 0) {
    freeGroups++;
  }

  return {
    totalFreeBlocks,
    largestFreeBlock,
    freeGroups,
    fragmented:
      freeGroups > 1 &&
      totalFreeBlocks > largestFreeBlock,
  };
}

/**
 * หา File จาก ID
 */
export function findFile(
  files: FileItem[],
  fileId: number
) {
  return files.find((file) => file.id === fileId);
}