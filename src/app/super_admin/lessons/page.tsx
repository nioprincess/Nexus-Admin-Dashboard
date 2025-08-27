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
  FiSave,
  FiImage,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { db } from "@/lib/firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Static SDG data
const SDGS = [
  { id: "1", name: "No Poverty", image: "/sdg1.jpeg", color: "#e5243b" },
  { id: "2", name: "Zero Hunger", image: "/sdg2.jpeg", color: "#DDA63A" },
  { id: "3", name: "Good Health", image: "/sdg3.jpeg", color: "#4C9F38" },
  { id: "4", name: "Quality Education", image: "/sdg4.png", color: "#C5192D" },
  { id: "5", name: "Gender Equality", image: "/sdg5.webp", color: "#FF3A21" },
  {
    id: "6",
    name: "Clean Water and Sanitation",
    image: "/sdg6.webp",
    color: "#e5243b",
  },
  {
    id: "7",
    name: "Affordable and clean energy",
    image: "/sdg7.png",
    color: "#DDA63A",
  },
  {
    id: "8",
    name: "Decent work and Economic growth",
    image: "/sdg8.webp",
    color: "#4C9F38",
  },
  {
    id: "9",
    name: "Industry innovation and infrastructure",
    image: "/sdg9.webp",
    color: "#C5192D",
  },
  {
    id: "10",
    name: "Reduced Inequalities",
    image: "/sdg10.webp",
    color: "#FF3A21",
  },
  {
    id: "11",
    name: "Sustainable Cities and Communities",
    image: "/sdg11.webp",
    color: "#C5192D",
  },
  {
    id: "12",
    name: "Responsible Consumption and Production",
    image: "/sdg12.webp",
    color: "#FF3A21",
  },
  { id: "13", name: "Climate Action", image: "/sdg13.webp", color: "#e5243b" },
  {
    id: "14",
    name: "Life below water",
    image: "/sdg14.webp",
    color: "#DDA63A",
  },
  { id: "15", name: "Life on Land", image: "/sdg15.webp", color: "#4C9F38" },
  {
    id: "16",
    name: "Peace, Justice and Strong Institutions",
    image: "/sdg16.png",
    color: "#C5192D",
  },
  {
    id: "17",
    name: "Partnerships for the Goals",
    image: "/sdg17.webp",
    color: "#FF3A21",
  },
  // Add all 17 SDGs here...
];

type Lesson = {
  id: string;
  sdgId: string;
  image: string;
  title: string;
  description: string;
  activities: string[];
  interactiveQuestion: string;
  answer: String;
  status: "Published" | "Draft";
  lastUpdated: string;
};

export default function ManageLessons() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedSdg, setSelectedSdg] = useState<(typeof SDGS)[0] | null>(null);
  const [formStep, setFormStep] = useState<"select" | "form">("select");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 4,
  });

  const [formData, setFormData] = useState<Omit<Lesson, "id" | "lastUpdated">>({
    sdgId: "",
    title: "",
    image: "",
    description: "",
    activities: [""],
    interactiveQuestion: "",
    answer: "",
    status: "Draft",
  });

  const [data, setData] = useState<Lesson[]>([]);

  const columns: ColumnDef<Lesson>[] = [
    {
      accessorKey: "sdgId",
      header: "SDG",
      cell: ({ row }) => {
        const sdg = SDGS.find((s) => s.id === row.original.sdgId);
        return (
          <div className="flex items-center">
            {sdg && (
              <>
                <img
                  src={sdg.image}
                  alt={sdg.name}
                  className="w-8 h-8 object-contain mr-2"
                />
                <span>SDG {sdg.id}</span>
              </>
            )}
          </div>
        );
      },
      size: 100,
    },
    { accessorKey: "title", header: "Lesson Title", size: 150 },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="line-clamp-2">{row.original.description}</div>
      ),
      size: 200,
    },
    {
      accessorKey: "activities",
      header: "Activities",
      cell: ({ row }) => (
        <ul className="list-disc list-inside">
          {row.original.activities.map((activity, i) => (
            <li key={i} className="text-sm line-clamp-1">
              {activity}
            </li>
          ))}
        </ul>
      ),
      size: 150,
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
          <button
            onClick={() => handleEdit(row.original)}
            className="text-blue-600 hover:text-blue-800"
          >
            <FiEdit2 />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="text-red-600 hover:text-red-800"
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
      pagination, // Add this
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination, // Add this
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Add this
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleActivityChange = (index: number, value: string) => {
    const newActivities = [...formData.activities];
    newActivities[index] = value;
    setFormData((prev) => ({ ...prev, activities: newActivities }));
  };

  const addActivity = () => {
    setFormData((prev) => ({ ...prev, activities: [...prev.activities, ""] }));
  };

  const removeActivity = (index: number) => {
    if (formData.activities.length > 1) {
      const newActivities = formData.activities.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, activities: newActivities }));
    }
  };

  const handleSelectSdg = (sdg: (typeof SDGS)[0]) => {
    setSelectedSdg(sdg);
    setFormData((prev) => ({ ...prev, sdgId: sdg.id }));
    setFormStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSdg) return;

    const currentDate = new Date().toISOString().split("T")[0];

    if (editingLesson) {
      const lessonRef = doc(db, "lessons", editingLesson.id);
      await updateDoc(lessonRef, { ...formData, lastUpdated: currentDate });
      setData(
        data.map((lesson) =>
          lesson.id === editingLesson.id
            ? { ...formData, id: editingLesson.id, lastUpdated: currentDate }
            : lesson
        )
      );
    } else {
      const docRef = await addDoc(collection(db, "lessons"), {
        ...formData,
        lastUpdated: currentDate,
      });
      setData([
        ...data,
        { ...formData, id: docRef.id, lastUpdated: currentDate },
      ]);
    }

    resetForm();
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setSelectedSdg(SDGS.find((sdg) => sdg.id === lesson.sdgId) || null);
    setFormData({
      sdgId: lesson.sdgId,
      image: lesson.image,
      title: lesson.title,
      description: lesson.description,
      activities: [...lesson.activities],
      interactiveQuestion: lesson.interactiveQuestion,
      answer: "",
      status: lesson.status,
    });
    setFormStep("form");
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      await deleteDoc(doc(db, "lessons", id));
      setData(data.filter((lesson) => lesson.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      sdgId: "",
      image: "",
      title: "",
      description: "",
      activities: [""],
      interactiveQuestion: "",
      answer: "",
      status: "Draft",
    });
    setSelectedSdg(null);
    setEditingLesson(null);
    setIsFormOpen(false);
    setFormStep("select");
  };

  const BackButton = () => (
    <button
      onClick={() => setFormStep("select")}
      className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
    >
      <FiChevronLeft className="mr-1" /> Back to SDG Selection
    </button>
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    const fetchLessons = async () => {
      const querySnapshot = await getDocs(collection(db, "lessons"));
      const lessonsData: Lesson[] = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Lesson, "id">),
      }));
      setData(lessonsData);
    };

    fetchLessons();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Lesson Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-blueColor px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-white">
                {formStep === "select"
                  ? "Select SDG"
                  : editingLesson
                  ? "Edit Lesson"
                  : "Add New Lesson"}
              </h2>
              <button
                onClick={resetForm}
                className="text-white hover:text-gray-200"
              >
                <FiX size={24} />
              </button>
            </div>

            {formStep === "select" ? (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Select Sustainable Development Goal
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {SDGS.map((sdg) => (
                    <div
                      key={sdg.id}
                      onClick={() => handleSelectSdg(sdg)}
                      className="border rounded-lg p-3 flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderColor: sdg.color }}
                    >
                      <img
                        src={sdg.image}
                        alt={sdg.name}
                        className="w-16 h-16 object-contain mb-2"
                      />
                      <span className="text-sm font-medium text-center">
                        SDG {sdg.id}
                        <br />
                        {sdg.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <BackButton />

                {selectedSdg && (
                  <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={selectedSdg.image}
                      alt={selectedSdg.name}
                      className="w-12 h-12 object-contain mr-3"
                    />
                    <div>
                      <h4 className="font-medium">Selected SDG</h4>
                      <p className="text-sm">
                        SDG {selectedSdg.id}: {selectedSdg.name}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Image Upload */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lesson Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-300 flex items-center justify-center">
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiImage className="text-gray-400 text-2xl" />
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="image"
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm cursor-pointer"
                          >
                            Choose Image
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="mb-4">
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Lesson Title*
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
                          htmlFor="status"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Status*
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="Draft">Draft</option>
                          <option value="Published">Published</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
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

                    <div className="mb-4">
                      <label
                        htmlFor="interactiveQuestion"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Interactive Question*
                      </label>
                      <input
                        type="text"
                        id="interactiveQuestion"
                        name="interactiveQuestion"
                        value={formData.interactiveQuestion}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activities*
                  </label>
                  <div className="space-y-2">
                    {formData.activities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) =>
                            handleActivityChange(index, e.target.value)
                          }
                          className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        {formData.activities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeActivity(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addActivity}
                      className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <FiPlus className="mr-1" /> Add Activity
                    </button>
                  </div>
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
                    className="px-4 py-2 bg-blueColor text-white rounded-md hover:bg-blue-600 flex items-center"
                  >
                    <FiSave className="mr-2" />
                    {editingLesson ? "Update Lesson" : "Save Lesson"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Lessons</h1>
          <p className="text-gray-600">
            Create, update, and manage SDG lessons
          </p>
        </div>
        <button
          onClick={() => {
            setIsFormOpen(true);
            setFormStep("select");
          }}
          className="flex items-center px-4 py-2 bg-blueColor text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <FiPlus className="mr-2" />
          Add New Lesson
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Lessons"
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
      {/* next page or previous page buttons*/}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {table.getRowModel().rows.length} of {data.length} lessons
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
