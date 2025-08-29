"use client";

import { useEffect, useState } from "react";
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
} from "react-icons/fi";
import { db } from "@/lib/firebase/firebaseConfig";
import {
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

type Notification = {
  id: string;
  notification_type:
    | "tips"
    | "new_updates"
    | "success_stories"
    | "reminders"
    | "system_updates";
  title: string;
  description: string;
  url: string;
  status: "Published" | "Draft";
  createdAt: string;
  publishedAt?: string;
};

export default function ManageNotifications() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const [formData, setFormData] = useState<
    Omit<Notification, "id" | "createdAt" | "publishedAt">
  >({
    notification_type: "tips",
    title: "",
    description: "",
    status: "Draft",
    url: "",
  });

  const [data, setData] = useState<Notification[]>([]);

  // ✅ Correctly fetch data from "notifications"
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "notifications"));
      const notifications: Notification[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Notification, "id">),
      }));
      setData(notifications);
    };

    fetchData();
  }, []);

  const columns: ColumnDef<Notification>[] = [
    {
      accessorKey: "notification_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.notification_type;
        const typeMap = {
          tips: { label: "Tip", color: "bg-blue-100 text-blue-800" },
          system_updates: {
            label: "System Update",
            color: "bg-indigo-100 text-indigo-800",
          },
          new_updates: {
            label: "Update",
            color: "bg-purple-100 text-purple-800",
          },
          success_stories: {
            label: "Success Story",
            color: "bg-green-100 text-green-800",
          },
          reminders: {
            label: "Reminder",
            color: "bg-yellow-100 text-yellow-800",
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
      size: 100,
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
      accessorKey: "url",
      header: "Link",
      cell: ({ row }) => {
        const url = row.original.url;
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {url.length > 30 ? url.substring(0, 30) + "..." : url}
          </a>
        ) : (
          <span className="text-gray-400">—</span>
        );
      },
      size: 200,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      size: 120,
    },
    {
      accessorKey: "publishedAt",
      header: "Published At",
      cell: ({ row }) =>
        row.original.publishedAt ? row.original.publishedAt : "Not published",
      size: 120,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.original.status === "Published"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.original.status}
        </span>
      ),
      size: 100,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {row.original.status === "Draft" && (
            <button
              onClick={() => handlePublish(row.original.id)}
              className="text-green-600 hover:text-green-800"
              title="Publish"
            >
              <FiSend />
            </button>
          )}
          <button
            onClick={() => handleEdit(row.original)}
            className="text-blueColor hover:text-blue-500"
            title="Edit"
          >
            <FiEdit2 />
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
      size: 120,
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingNotification) {
      const docRef = doc(db, "notifications", editingNotification.id);
      await updateDoc(docRef, {
        ...formData,
      });
      setData((prev) =>
        prev.map((n) =>
          n.id === editingNotification.id ? { ...n, ...formData } : n
        )
      );
    } else {
      const docRef = await addDoc(collection(db, "notifications"), {
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
        timestamp: serverTimestamp(),
      });

      setData([
        ...data,
        {
          ...formData,
          id: docRef.id,
          createdAt: new Date().toISOString().split("T")[0],
          status: "Draft",
        },
      ]);
    }

    resetForm();
  };

  const handlePublish = async (id: string) => {
    if (
      confirm("Are you sure you want to publish this notification to users?")
    ) {
      const docRef = doc(db, "notifications", id);
      const currentDate = new Date().toISOString().split("T")[0];
      await updateDoc(docRef, {
        status: "Published",
        publishedAt: currentDate,
      });

      setData((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, status: "Published", publishedAt: currentDate }
            : n
        )
      );
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      notification_type: notification.notification_type,
      title: notification.title,
      description: notification.description,
      status: notification.status,
      url: notification.url,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      await deleteDoc(doc(db, "notifications", id));
      setData((prev) => prev.filter((notification) => notification.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      notification_type: "tips",
      title: "",
      description: "",
      status: "Draft",
      url: "",
    });
    setEditingNotification(null);
    setIsFormOpen(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Notification Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-blueColor px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-white">
                {editingNotification
                  ? "Edit Notification"
                  : "Create Notification"}
              </h2>
              <button
                onClick={resetForm}
                className="text-white hover:text-gray-200"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="mb-4">
                  <label
                    htmlFor="notification_type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notification Type*
                  </label>
                  <select
                    id="notification_type"
                    name="notification_type"
                    value={formData.notification_type || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="tips">Tips</option>
                    <option value="new_updates">New Updates</option>
                    <option value="system_updates">System Updates</option>
                    <option value="reminders">Reminders</option>
                    <option value="success_stories">Success Stories</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  URL*
                </label>
                <input
                  type="text"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blueColor text-white rounded-md hover:bg-blue-500 flex items-center"
                >
                  {editingNotification ? "Update Draft" : "Save as Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manage Notifications
          </h1>
          <p className="text-gray-600">
            Create draft notifications and publish when ready
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center px-4 py-2 bg-blueColor text-white rounded-md hover:bg-blue-500 transition-colors"
        >
          <FiPlus className="mr-2" />
          Create Notification
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Notifications"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              table.getColumn("title")?.setFilterValue(e.target.value)
            }
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <FiFilter className="text-gray-500" />
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              table
                .getColumn("status")
                ?.setFilterValue(
                  e.target.value === "All" ? undefined : e.target.value
                );
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
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
          Showing {table.getRowModel().rows.length} of {data.length}{" "}
          notifications
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
    </div>
  );
}
