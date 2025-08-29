"use client";

import { useState, useEffect } from "react";
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
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseConfig";

type Feedback = {
  id: string;
  feedbackType: "App Features" | "Content Improvements" | "SDG Challenge Idea";
  description: string;
  createdAt: any; // Firestore timestamp
  userEmail: string;
  userId: string;
  title?: string; // Optional field if you add it later
};

export default function ManageFeedback() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [viewingFeedback, setViewingFeedback] = useState<Feedback | null>(null);
  const [data, setData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch feedback data from Firestore
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const feedbackRef = collection(db, "feedbacks");
        const q = query(feedbackRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const feedbackData: Feedback[] = [];
        querySnapshot.forEach((doc) => {
          feedbackData.push({
            id: doc.id,
            ...doc.data(),
          } as Feedback);
        });

        setData(feedbackData);
        setError(null);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback data");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // Fetch feedback by user ID
  const fetchFeedbackByUserId = async (userId: string) => {
    try {
      setLoading(true);
      const feedbackRef = collection(db, "feedbacks");
      const q = query(
        feedbackRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const feedbackData: Feedback[] = [];
      querySnapshot.forEach((doc) => {
        feedbackData.push({
          id: doc.id,
          ...doc.data(),
        } as Feedback);
      });

      setData(feedbackData);
      setError(null);
    } catch (err) {
      console.error("Error fetching user feedback:", err);
      setError("Failed to load user feedback data");
    } finally {
      setLoading(false);
    }
  };

  // View all feedback
  const viewAllFeedback = async () => {
    try {
      setLoading(true);
      const feedbackRef = collection(db, "feedbacks");
      const q = query(feedbackRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const feedbackData: Feedback[] = [];
      querySnapshot.forEach((doc) => {
        feedbackData.push({
          id: doc.id,
          ...doc.data(),
        } as Feedback);
      });

      setData(feedbackData);
      setError(null);
    } catch (err) {
      console.error("Error fetching all feedback:", err);
      setError("Failed to load all feedback data");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Feedback>[] = [
    {
      accessorKey: "feedbackType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.feedbackType;
        const typeMap = {
          "App Features": {
            label: "App Feature",
            color: "bg-blue-100 text-blue-800",
          },
          "Content Improvements": {
            label: "Content",
            color: "bg-purple-100 text-purple-800",
          },
          "SDG Challenge Idea": {
            label: "Challenge Idea",
            color: "bg-green-100 text-green-800",
          },
        };
        const typeConfig = typeMap[type as keyof typeof typeMap] || {
          label: type,
          color: "bg-gray-100 text-gray-800",
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${typeConfig.color}`}
          >
            {typeConfig.label}
          </span>
        );
      },
      size: 120,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="line-clamp-2 max-w-xs">{row.original.description}</div>
      ),
      size: 200,
    },
    {
      accessorKey: "userEmail",
      header: "Submitted By",
      size: 150,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (date && typeof date.toDate === "function") {
          return date.toDate().toLocaleDateString();
        }
        return "Unknown date";
      },
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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      try {
        await deleteDoc(doc(db, "feedbacks", id));
        setData(data.filter((feedback) => feedback.id !== id));
        alert("Feedback deleted successfully!");
      } catch (error) {
        console.error("Error deleting feedback:", error);
        alert("Failed to delete feedback");
      }
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
                  <h3 className="text-lg font-semibold">Feedback Details</h3>
                  <div
                    className={`mt-1 px-2 py-1 rounded-full text-xs inline-block ${
                      viewingFeedback.feedbackType === "App Features"
                        ? "bg-blue-100 text-blue-800"
                        : viewingFeedback.feedbackType ===
                          "Content Improvements"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {viewingFeedback.feedbackType}
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
                    <p>{viewingFeedback.userEmail}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </h4>
                    <p className="text-xs font-mono">
                      {viewingFeedback.userId}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Submitted Date
                    </h4>
                    <p>
                      {viewingFeedback.createdAt &&
                      typeof viewingFeedback.createdAt.toDate === "function"
                        ? viewingFeedback.createdAt.toDate().toLocaleString()
                        : "Unknown date"}
                    </p>
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

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {/* <button
            onClick={viewAllFeedback}
            className="px-4 py-2 bg-blueColor text-white rounded-md hover:bg-blue-500 text-sm"
          >
            View All Feedback
          </button> */}
          {/* <div className="relative">
            <input
              type="text"
              placeholder="Filter by User ID"
              className="pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    fetchFeedbackByUserId(target.value.trim());
                  }
                }
              }}
            />
          </div> */}
        </div>

        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by description"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              table.getColumn("description")?.setFilterValue(e.target.value)
            }
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <>
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {data.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No feedback found
            </div>
          )}

          {/* Pagination */}
          {data.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {table.getRowModel().rows.length} of {data.length}{" "}
                feedback items
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
                        ? "bg-blueColor text-white"
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
          )}
        </>
      )}
    </div>
  );
}
