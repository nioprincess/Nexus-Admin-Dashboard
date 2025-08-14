"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  ColumnFiltersState,
  getFilteredRowModel,
  flexRender,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  FiSearch,
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiSend,
  FiEye,
} from "react-icons/fi";

type Feedback = {
  id: string;
  feedback_type: "app_features" | "content_improvements" | "sdg_challenge_idea";
  title: string;
  description: string;
  submittedDate: string;
  submittedBy: string;
  status?: string; // Added for potential future use
};

export default function ManageFeedback() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [viewingFeedback, setViewingFeedback] = useState<Feedback | null>(null);

  const [data, setData] = useState<Feedback[]>([
    {
      id: "001",
      feedback_type: "app_features",
      title: "Dark mode support",
      description:
        "Please add dark mode to reduce eye strain at night. This would be especially helpful for users who access the app in low-light environments. The current bright interface can cause discomfort during evening use.",
      submittedDate: "2025-07-28",
      submittedBy: "user123",
    },
    {
      id: "002",
      feedback_type: "content_improvements",
      title: "Update SDG 4 materials",
      description:
        "The current resources for SDG 4 (Quality Education) are outdated and need refreshing. Several statistics are from 2018 and don't reflect current progress. Also, some of the suggested classroom activities could be more interactive.",
      submittedDate: "2025-07-10",
      submittedBy: "teacher456",
    },
    {
      id: "003",
      feedback_type: "sdg_challenge_idea",
      title: "Community recycling challenge",
      description:
        "Propose a monthly recycling competition between schools where they track and report their recycling efforts. The school with the highest recycling rate could be featured in the app. This would encourage environmental awareness among students.",
      submittedDate: "2025-07-15",
      submittedBy: "student789",
    },
  ]);

  const columns: ColumnDef<Feedback>[] = [
    {
      accessorKey: "feedback_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.feedback_type;
        const typeMap = {
          app_features: {
            label: "App Feature",
            color: "bg-blue-100 text-blue-800",
          },
          content_improvements: {
            label: "Content",
            color: "bg-purple-100 text-purple-800",
          },
          sdg_challenge_idea: {
            label: "Challenge Idea",
            color: "bg-green-100 text-green-800",
          },
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${typeMap[type].color}`}
          >
            {typeMap[type].label}
          </span>
        );
      },
      size: 120,
    },
    { accessorKey: "title", header: "Title", size: 150 },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="line-clamp-2">{row.original.description}</div>
      ),
      size: 200,
    },
    {
      accessorKey: "submittedBy",
      header: "Submitted By",
      size: 120,
    },
    {
      accessorKey: "submittedDate",
      header: "Date",
      size: 100,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setViewingFeedback(row.original)}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <FiEye />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      ),
      size: 80,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      setData(data.filter((feedback) => feedback.id !== id));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Feedback Detail Modal */}
      {viewingFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-white">Feedback Details</h2>
              <button
                onClick={() => setViewingFeedback(null)}
                className="text-white hover:text-gray-200"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">
                    {viewingFeedback.title}
                  </h3>
                  <div
                    className={`mt-1 px-2 py-1 rounded-full text-xs inline-block ${
                      viewingFeedback.feedback_type === "app_features"
                        ? "bg-blue-100 text-blue-800"
                        : viewingFeedback.feedback_type ===
                          "content_improvements"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {viewingFeedback.feedback_type === "app_features"
                      ? "App Feature"
                      : viewingFeedback.feedback_type === "content_improvements"
                      ? "Content Improvement"
                      : "SDG Challenge Idea"}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Description
                  </h4>
                  <p className="whitespace-pre-line">
                    {viewingFeedback.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Submitted By
                    </h4>
                    <p>{viewingFeedback.submittedBy}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Submitted Date
                    </h4>
                    <p>{viewingFeedback.submittedDate}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingFeedback(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Feedback</h1>
          <p className="text-gray-600">Review user-submitted feedback</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Feedback"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              table.getColumn("title")?.setFilterValue(e.target.value)
            }
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {table.getRowModel().rows.length} of {data.length} feedback
          items
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`px-3 py-1 border rounded-md flex items-center ${
              !table.getCanPreviousPage()
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
          >
            <FiChevronLeft className="mr-1" /> Prev
          </button>

          {Array.from({ length: table.getPageCount() }).map((_, i) => (
            <button
              key={i}
              onClick={() => table.setPageIndex(i)}
              className={`px-3 py-1 border rounded-md ${
                pagination.pageIndex === i
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`px-3 py-1 border rounded-md flex items-center ${
              !table.getCanNextPage()
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
          >
            Next <FiChevronRight className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
