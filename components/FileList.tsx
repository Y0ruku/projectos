"use client";

import { FileItem } from "@/lib/types";

type Props = {
  files: FileItem[];
  onDelete: (id: number) => void;
};

export default function FileList({
  files,
  onDelete,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900">
          File System
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          รายการไฟล์และโฟลเดอร์ภายใน Virtual Disk
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {files.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            ยังไม่มีไฟล์หรือโฟลเดอร์
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                    file.type === "folder"
                      ? "bg-amber-100"
                      : "bg-blue-100"
                  }`}
                >
                  {file.type === "folder"
                    ? "📁"
                    : "📄"}
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    {file.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {file.type === "folder"
                      ? "Folder"
                      : `${file.size} MB • ${file.blocks.length} Blocks`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {file.type === "file" && (
                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-slate-400">
                      Blocks
                    </p>

                    <p className="text-sm font-medium text-slate-700">
                      {file.blocks.join(", ")}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => onDelete(file.id)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}