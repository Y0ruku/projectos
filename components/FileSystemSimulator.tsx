"use client";

import { useMemo, useState } from "react";

import StatsCard from "./StatsCard";
import DiskVisualization from "./DiskVisualization";
import FileList from "./FileList";

import {
  AllocationMethod,
  FileItem,
} from "@/lib/types";

import {
  allocateBlocks,
  calculateFragmentation,
} from "@/lib/allocation";

import {
  BLOCK_SIZE,
  TOTAL_BLOCKS,
  createInitialDisk,
  createFileItem,
  createFolderItem,
  getFreeBlocks,
  getUsagePercentage,
  getUsedBlocks,
} from "@/lib/file-system";

export default function FileSystemSimulator() {
  const [disk, setDisk] = useState(
    createInitialDisk()
  );

  const [files, setFiles] = useState<FileItem[]>([]);

  const [allocationMethod, setAllocationMethod] =
    useState<AllocationMethod>("contiguous");

  const [fileName, setFileName] =
    useState("");

  const [fileSize, setFileSize] =
    useState("5");

  const [folderName, setFolderName] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error">("success");

  const [nextId, setNextId] = useState(1);

  const usedBlocks = getUsedBlocks(disk);
  const freeBlocks = getFreeBlocks(disk);
  const usagePercentage =
    getUsagePercentage(disk);

  const fragmentation = useMemo(
    () => calculateFragmentation(disk),
    [disk]
  );

  function showMessage(
    text: string,
    type: "success" | "error"
  ) {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3500);
  }

  function handleCreateFile() {
    const name = fileName.trim();

    const size = Number(fileSize);

    if (!name) {
      showMessage(
        "กรุณาระบุชื่อไฟล์",
        "error"
      );
      return;
    }

    if (!Number.isFinite(size) || size <= 0) {
      showMessage(
        "ขนาดไฟล์ต้องมากกว่า 0 MB",
        "error"
      );
      return;
    }

    const requiredBlocks = Math.ceil(
      size / BLOCK_SIZE
    );

    if (requiredBlocks > TOTAL_BLOCKS) {
      showMessage(
        "ไฟล์มีขนาดใหญ่เกิน Virtual Disk",
        "error"
      );
      return;
    }

    const result = allocateBlocks(
      disk,
      requiredBlocks,
      allocationMethod
    );

    if (!result.success) {
      showMessage(
        result.message,
        "error"
      );
      return;
    }

    const fileId = nextId;

    const newFile = createFileItem(
      fileId,
      name,
      size,
      result.blocks,
      null
    );

    const newDisk = disk.map(
      (block) => {
        if (
          result.blocks.includes(block.index)
        ) {
          return {
            ...block,
            fileId,
          };
        }

        return block;
      }
    );

    setDisk(newDisk);

    setFiles((current) => [
      ...current,
      newFile,
    ]);

    setNextId((current) => current + 1);

    setFileName("");

    showMessage(
      result.message,
      "success"
    );
  }

  function handleCreateFolder() {
    const name = folderName.trim();

    if (!name) {
      showMessage(
        "กรุณาระบุชื่อ Folder",
        "error"
      );
      return;
    }

    const exists = files.some(
      (file) =>
        file.name.toLowerCase() ===
        name.toLowerCase()
    );

    if (exists) {
      showMessage(
        "มีชื่อไฟล์หรือ Folder นี้อยู่แล้ว",
        "error"
      );
      return;
    }

    const newFolder =
      createFolderItem(
        nextId,
        name,
        null
      );

    setFiles((current) => [
      ...current,
      newFolder,
    ]);

    setNextId((current) => current + 1);

    setFolderName("");

    showMessage(
      `สร้าง Folder "${name}" สำเร็จ`,
      "success"
    );
  }

  function handleDeleteFile(id: number) {
    const target = files.find(
      (file) => file.id === id
    );

    if (!target) {
      return;
    }

    const newDisk = disk.map(
      (block) => {
        if (block.fileId === id) {
          return {
            ...block,
            fileId: null,
          };
        }

        return block;
      }
    );

    setDisk(newDisk);

    setFiles((current) =>
      current.filter(
        (file) => file.id !== id
      )
    );

    showMessage(
      `ลบ "${target.name}" สำเร็จ และคืนพื้นที่ Disk แล้ว`,
      "success"
    );
  }

  function handleReset() {
    const confirmed =
      window.confirm(
        "ต้องการ Reset Virtual Disk ใช่หรือไม่?"
      );

    if (!confirmed) {
      return;
    }

    setDisk(createInitialDisk());
    setFiles([]);
    setNextId(1);

    showMessage(
      "Reset Virtual Disk สำเร็จ",
      "success"
    );
  }

  function createDemoData() {
    setDisk(createInitialDisk());
    setFiles([]);

    const demoFiles: FileItem[] = [];

    let currentDisk =
      createInitialDisk();

    const demoData = [
      {
        name: "report.txt",
        size: 4,
      },
      {
        name: "data.txt",
        size: 3,
      },
      {
        name: "image.jpg",
        size: 5,
      },
    ];

    let id = 1;

    for (const item of demoData) {
      const result = allocateBlocks(
        currentDisk,
        item.size,
        allocationMethod
      );

      if (!result.success) {
        continue;
      }

      const newFile = createFileItem(
        id,
        item.name,
        item.size,
        result.blocks,
        null
      );

      demoFiles.push(newFile);

      currentDisk = currentDisk.map(
        (block) => {
          if (
            result.blocks.includes(
              block.index
            )
          ) {
            return {
              ...block,
              fileId: id,
            };
          }

          return block;
        }
      );

      id++;
    }

    setDisk(currentDisk);
    setFiles(demoFiles);
    setNextId(id);

    showMessage(
      "สร้างข้อมูลตัวอย่างสำหรับ Demo สำเร็จ",
      "success"
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                Operating System Project
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                File System Simulator
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                โปรแกรมจำลองระบบจัดการไฟล์และการจัดสรรพื้นที่ดิสก์
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={createDemoData}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Demo Data
              </button>

              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Message */}
        {message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Disk Size"
            value={`${TOTAL_BLOCKS} MB`}
            subtitle={`${TOTAL_BLOCKS} Blocks`}
            icon="💾"
          />

          <StatsCard
            title="Used Space"
            value={`${usedBlocks} MB`}
            subtitle={`${usagePercentage}% ของ Disk`}
            icon="📊"
          />

          <StatsCard
            title="Free Space"
            value={`${freeBlocks} MB`}
            subtitle={`${freeBlocks} Blocks`}
            icon="🗄️"
          />

          <StatsCard
            title="Files"
            value={
              files.filter(
                (file) =>
                  file.type === "file"
              ).length
            }
            subtitle={`${files.filter(
              (file) =>
                file.type === "folder"
            ).length} Folders`}
            icon="📁"
          />
        </section>

        {/* Create Panel */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* File */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Create File
              </h2>

              <p className="text-sm text-slate-500">
                สร้างไฟล์และจัดสรรพื้นที่บน Virtual Disk
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  File Name
                </label>

                <input
                  value={fileName}
                  onChange={(event) =>
                    setFileName(
                      event.target.value
                    )
                  }
                  placeholder="เช่น report.txt"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  File Size (MB)
                </label>

                <input
                  type="number"
                  min="1"
                  value={fileSize}
                  onChange={(event) =>
                    setFileSize(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Allocation Method
                </label>

                <select
                  value={allocationMethod}
                  onChange={(event) =>
                    setAllocationMethod(
                      event.target
                        .value as AllocationMethod
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="contiguous">
                    Contiguous Allocation
                  </option>

                  <option value="linked">
                    Linked Allocation
                  </option>

                  <option value="indexed">
                    Indexed Allocation
                  </option>
                </select>
              </div>

              <button
                onClick={handleCreateFile}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                + Create File
              </button>
            </div>
          </div>

          {/* Folder */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Create Folder
              </h2>

              <p className="text-sm text-slate-500">
                สร้าง Directory สำหรับจัดกลุ่มไฟล์
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Folder Name
                </label>

                <input
                  value={folderName}
                  onChange={(event) =>
                    setFolderName(
                      event.target.value
                    )
                  }
                  placeholder="เช่น Documents"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  Virtual Disk Configuration
                </p>

                <div className="mt-3 space-y-2 text-sm text-slate-500">
                  <div className="flex justify-between">
                    <span>Total Blocks</span>
                    <span className="font-semibold text-slate-800">
                      {TOTAL_BLOCKS}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Block Size</span>
                    <span className="font-semibold text-slate-800">
                      {BLOCK_SIZE} MB
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Allocation</span>
                    <span className="font-semibold text-slate-800">
                      {allocationMethod}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateFolder}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                + Create Folder
              </button>
            </div>
          </div>
        </section>

        {/* Disk */}
        <DiskVisualization
          disk={disk}
          files={files}
        />

        {/* Fragmentation */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Fragmentation Analysis
            </h2>

            <p className="text-sm text-slate-500">
              วิเคราะห์พื้นที่ว่างของ Virtual Disk
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Total Free Blocks
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {fragmentation.totalFreeBlocks}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Largest Free Block
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {fragmentation.largestFreeBlock}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Free Groups
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {fragmentation.freeGroups}
              </p>
            </div>

            <div
              className={`rounded-xl p-4 ${
                fragmentation.fragmented
                  ? "bg-orange-50"
                  : "bg-green-50"
              }`}
            >
              <p className="text-xs text-slate-500">
                Status
              </p>

              <p
                className={`mt-1 text-lg font-bold ${
                  fragmentation.fragmented
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {fragmentation.fragmented
                  ? "Fragmented"
                  : "Normal"}
              </p>
            </div>
          </div>
        </section>

        {/* File List */}
        <FileList
          files={files}
          onDelete={handleDeleteFile}
        />

        {/* Algorithm Explanation */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Allocation Algorithm
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <h3 className="font-bold text-blue-700">
                Contiguous
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                จัดเก็บ Block ของไฟล์ไว้ติดกัน
                เหมาะสำหรับการเข้าถึงข้อมูลที่รวดเร็ว
                แต่สามารถเกิด External Fragmentation ได้
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50 p-5">
              <h3 className="font-bold text-purple-700">
                Linked
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Block ของไฟล์สามารถอยู่คนละตำแหน่ง
                และเชื่อมโยงกันด้วย Pointer
                ทำให้ไม่จำเป็นต้องมีพื้นที่ต่อเนื่อง
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
              <h3 className="font-bold text-amber-700">
                Indexed
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                ใช้ Index Block สำหรับเก็บตำแหน่ง
                ของ Data Blocks ทำให้สามารถเข้าถึง
                Block ที่กระจายอยู่บน Disk ได้
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-slate-200 bg-white py-6">
        <p className="text-center text-sm text-slate-400">
          File System Simulator • Operating System Project
        </p>
      </footer>
    </main>
  );
}