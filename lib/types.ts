export type AllocationMethod =
  | "contiguous"
  | "linked"
  | "indexed";

export type FileType = "file" | "folder";

export type FileItem = {
  id: number;
  name: string;
  type: FileType;
  size: number;
  blocks: number[];
  parentId: number | null;
  createdAt: string;
};

export type DiskBlock = {
  index: number;
  fileId: number | null;
};

export type AllocationResult = {
  success: boolean;
  blocks: number[];
  message: string;
};

export type FragmentationInfo = {
  totalFreeBlocks: number;
  largestFreeBlock: number;
  freeGroups: number;
  fragmented: boolean;
};