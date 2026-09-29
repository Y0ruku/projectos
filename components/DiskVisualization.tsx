"use client";

import { DiskBlock, FileItem } from "@/lib/types";

type Props = {
  disk: DiskBlock[];
  files: FileItem[];
};

export default function DiskVisualization({
  disk,
  files,
}: Props) {
  function getFile(blockFileId: number | null) {
    if (blockFileId === null) {
      return null;
    }

    return files.find(
      (file) => file.id === blockFileId
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">
          Disk Blocks
        </h2>

        <p className="text-sm text-slate-500">
          แสดงการจัดสรรพื้นที่ของ Virtual Disk
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 md:grid-cols-16">
        {disk.map((block) => {
          const file = getFile(block.fileId);

          return (
            <div
              key={block.index}
              title={
                file
                  ? `${file.name} - Block ${block.index}`
                  : `Free Block ${block.index}`
              }
              className={`group relative flex aspect-square items-center justify-center rounded-lg border text-xs font-bold transition hover:scale-105 ${
                file
                  ? "border-blue-300 bg-blue-100 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              {file ? (
                <span>
                  {file.name
                    .substring(0, 1)
                    .toUpperCase()}
                </span>
              ) : (
                <span>·</span>
              )}

              <div className="pointer-events-none absolute -top-12 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                Block {block.index}
                {file
                  ? ` • ${file.name}`
                  : " • Free"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-5 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-blue-300 bg-blue-100" />
          <span>Used Block</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-slate-200 bg-slate-50" />
          <span>Free Block</span>
        </div>
      </div>
    </div>
  );
}