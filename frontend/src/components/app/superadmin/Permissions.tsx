import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import PageMeta from "../common/PageMeta";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";

import {
  clearAuth,
  getToken,
} from "../../../utils/auth";

import {
  MenuIcon,
} from "../../../utils/menuIcons";

const API_URL = import.meta.env.VITE_API_URL;


/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type PermissionRow = {
  id: number;
  name: string;
  slug: string;

  menu_count: number;
  role_count: number;

  created_at: string;
  updated_at: string;
};

type PermissionResponse = {
  permissions: PermissionRow[];
};

type PermissionForm = {
  name: string;
  slug: string;
};

type SortKey =
  | "id"
  | "name"
  | "slug"
  | "created_at";

const emptyForm: PermissionForm = {
  name: "",
  slug: "",
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function Permissions() {
  const navigate = useNavigate();


  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const [
    permissions,
    setPermissions,
  ] = useState<PermissionRow[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<number | null>(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | DATATABLE
  |--------------------------------------------------------------------------
  */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    pageSize,
    setPageSize,
  ] = useState(10);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    sortKey,
    setSortKey,
  ] = useState<SortKey>(
    "id"
  );

  const [
    sortDirection,
    setSortDirection,
  ] = useState<
    "asc" | "desc"
  >("asc");


  /*
  |--------------------------------------------------------------------------
  | FORM MODAL
  |--------------------------------------------------------------------------
  */

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingPermission,
    setEditingPermission,
  ] = useState<PermissionRow | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<PermissionForm>({
    ...emptyForm,
  });

  const [
    formError,
    setFormError,
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | DELETE MODAL
  |--------------------------------------------------------------------------
  */

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<PermissionRow | null>(
    null
  );


  /*
  |--------------------------------------------------------------------------
  | TOAST
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!success) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        setSuccess("");
      }, 4000);

    return () => {
      window.clearTimeout(
        timeout
      );
    };
  }, [
    success,
  ]);


  useEffect(() => {
    if (!error) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        setError("");
      }, 5000);

    return () => {
      window.clearTimeout(
        timeout
      );
    };
  }, [
    error,
  ]);


  /*
  |--------------------------------------------------------------------------
  | API
  |--------------------------------------------------------------------------
  */

  const apiRequest = async <T,>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const token =
      getToken();

    if (!token) {
      clearAuth();

      navigate(
        "/login",
        {
          replace: true,
        }
      );

      throw new Error(
        "Session login tidak ditemukan."
      );
    }

    const response =
      await fetch(
        `${API_URL}${path}`,
        {
          ...options,

          headers: {
            Accept:
              "application/json",

            ...(options.body
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}),

            Authorization:
              `Bearer ${token}`,

            ...(options.headers ??
              {}),
          },
        }
      );

    let data: any = {};

    try {
      data =
        await response.json();
    } catch {
      data = {};
    }

    if (
      response.status ===
      401
    ) {
      clearAuth();

      navigate(
        "/login",
        {
          replace: true,
        }
      );

      throw new Error(
        "Session telah berakhir."
      );
    }

    if (!response.ok) {
      if (
        data?.errors &&
        typeof data.errors ===
          "object"
      ) {
        const first =
          Object.values(
            data.errors
          )[0];

        if (
          Array.isArray(
            first
          ) &&
          first.length > 0
        ) {
          throw new Error(
            String(
              first[0]
            )
          );
        }
      }

      throw new Error(
        data?.message ??
          "Terjadi kesalahan."
      );
    }

    return data as T;
  };


  /*
  |--------------------------------------------------------------------------
  | LOAD PERMISSIONS
  |--------------------------------------------------------------------------
  */

  const loadPermissions =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await apiRequest<PermissionResponse>(
            "/auth/permissions"
          );

        setPermissions(
          data.permissions ??
            []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data permission."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadPermissions();
  }, []);


  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const filteredPermissions =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return permissions;
      }

      return permissions.filter(
        (
          permission
        ) => {
          const text = [
            permission.id,
            permission.name,
            permission.slug,
            permission.menu_count,
            permission.role_count,
          ]
            .join(" ")
            .toLowerCase();

          return text.includes(
            keyword
          );
        }
      );
    }, [
      permissions,
      search,
    ]);


  /*
  |--------------------------------------------------------------------------
  | SORT
  |--------------------------------------------------------------------------
  */

  const sortedPermissions =
    useMemo(() => {
      const result = [
        ...filteredPermissions,
      ];

      result.sort(
        (a, b) => {
          const valueA =
            a[sortKey];

          const valueB =
            b[sortKey];

          if (
            typeof valueA ===
              "number" &&
            typeof valueB ===
              "number"
          ) {
            return sortDirection ===
              "asc"
              ? valueA -
                  valueB
              : valueB -
                  valueA;
          }

          const stringA =
            String(
              valueA ?? ""
            );

          const stringB =
            String(
              valueB ?? ""
            );

          return sortDirection ===
            "asc"
            ? stringA.localeCompare(
                stringB
              )
            : stringB.localeCompare(
                stringA
              );
        }
      );

      return result;
    }, [
      filteredPermissions,
      sortKey,
      sortDirection,
    ]);


  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        sortedPermissions.length /
          pageSize
      )
    );

  const currentPage =
    Math.min(
      page,
      totalPages
    );

  const paginatedPermissions =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        pageSize;

      return sortedPermissions.slice(
        start,
        start + pageSize
      );
    }, [
      sortedPermissions,
      currentPage,
      pageSize,
    ]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    pageSize,
  ]);


  /*
  |--------------------------------------------------------------------------
  | SORT HANDLER
  |--------------------------------------------------------------------------
  */

  const handleSort = (
    key: SortKey
  ) => {
    if (
      sortKey === key
    ) {
      setSortDirection(
        (
          previous
        ) =>
          previous === "asc"
            ? "desc"
            : "asc"
      );

      return;
    }

    setSortKey(key);
    setSortDirection(
      "asc"
    );
  };


  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (
    value: string
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(date);
  };


  /*
  |--------------------------------------------------------------------------
  | TAMBAH MODAL
  |--------------------------------------------------------------------------
  */

  const openCreateModal =
    () => {
      setEditingPermission(
        null
      );

      setForm({
        ...emptyForm,
      });

      setFormError("");
      setSuccess("");
      setError("");

      setModalOpen(true);
    };


  /*
  |--------------------------------------------------------------------------
  | EDIT MODAL
  |--------------------------------------------------------------------------
  */

  const openEditModal = (
    permission: PermissionRow
  ) => {
    setEditingPermission(
      permission
    );

    setForm({
      name:
        permission.name,

      slug:
        permission.slug,
    });

    setFormError("");
    setSuccess("");
    setError("");

    setModalOpen(true);
  };


  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setEditingPermission(
      null
    );

    setFormError("");
  };


  /*
  |--------------------------------------------------------------------------
  | SAVE CREATE / UPDATE
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (
      event: FormEvent
    ) => {
      event.preventDefault();

      try {
        setSaving(true);
        setFormError("");
        setSuccess("");
        setError("");

        const payload = {
          name:
            form.name.trim(),

          slug:
            form.slug
              .trim()
              .toLowerCase(),
        };

        if (
          editingPermission
        ) {
          await apiRequest(
            `/auth/permissions/${editingPermission.id}`,
            {
              method: "PUT",

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

          setSuccess(
            "Permission berhasil diperbarui."
          );
        } else {
          await apiRequest(
            "/auth/permissions",
            {
              method: "POST",

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

          setSuccess(
            "Permission berhasil ditambahkan."
          );
        }

        setModalOpen(false);

        setEditingPermission(
          null
        );

        await loadPermissions();

      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : "Gagal menyimpan permission."
        );
      } finally {
        setSaving(false);
      }
    };


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }

      try {
        setDeletingId(
          deleteTarget.id
        );

        setError("");
        setSuccess("");

        await apiRequest(
          `/auth/permissions/${deleteTarget.id}`,
          {
            method:
              "DELETE",
          }
        );

        setSuccess(
          "Permission berhasil dihapus."
        );

        setDeleteTarget(
          null
        );

        await loadPermissions();

      } catch (err) {
        setDeleteTarget(
          null
        );

        setError(
          err instanceof Error
            ? err.message
            : "Gagal menghapus permission."
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | VIEW
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <PageMeta
        title="Permissions"
        description="Permission Management"
      />


      <div className="space-y-6">

        {/* PAGE HEADER */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Permissions
          </h1>


          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">

            <Link
              to="/superadmin/dashboard"
              className="transition hover:text-brand-500"
            >
              Home
            </Link>

            <span className="text-gray-300 dark:text-gray-600">
              ›
            </span>

            <span className="font-medium text-gray-700 dark:text-gray-300">
              Permissions
            </span>

          </div>

        </div>


        {/* CARD */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">


          {/* CARD HEADER */}

          <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Permission Management
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Kelola permission untuk mengatur akses menu dan role aplikasi.
              </p>

            </div>


            <button
              type="button"
              onClick={
                openCreateModal
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
            >

              <MenuIcon
                name="plus"
                className="size-4"
              />

              Tambah Permission

            </button>

          </div>


          {/* DATATABLE CONTROL */}

          <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/50 px-6 py-5 dark:border-gray-800 dark:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between">

            <div className="relative w-full sm:max-w-sm">

              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M20 20L16.65 16.65"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

              </div>

              <input
                type="text"
                value={
                  search
                }
                onChange={
                  (event) =>
                    setSearch(
                      event.target.value
                    )
                }
                placeholder="Cari permission..."
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />

            </div>


            <div className="flex items-center gap-3">

              <span className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                Tampilkan
              </span>

              <select
                value={
                  pageSize
                }
                onChange={
                  (event) =>
                    setPageSize(
                      Number(
                        event.target.value
                      )
                    )
                }
                className="h-11 min-w-20 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value={10}>
                  10
                </option>

                <option value={25}>
                  25
                </option>

                <option value={50}>
                  50
                </option>

                <option value={100}>
                  100
                </option>
              </select>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                data
              </span>

            </div>

          </div>


          {/* TABLE */}

          <div className="max-w-full overflow-x-auto">

            <Table>

              <TableHeader className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-white/[0.02]">

                <TableRow>

                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          "id"
                        )
                      }
                      className="flex w-full items-center gap-1 text-left"
                    >
                      ID

                      <span className="text-[10px] text-gray-400">
                        ↕
                      </span>

                    </button>
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          "name"
                        )
                      }
                      className="flex w-full items-center gap-1 text-left"
                    >
                      Permission

                      <span className="text-[10px] text-gray-400">
                        ↕
                      </span>

                    </button>
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          "slug"
                        )
                      }
                      className="flex w-full items-center gap-1 text-left"
                    >
                      Slug

                      <span className="text-[10px] text-gray-400">
                        ↕
                      </span>

                    </button>
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-center text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Menu
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-center text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Role
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort(
                          "created_at"
                        )
                      }
                      className="flex w-full items-center gap-1 text-left"
                    >
                      Dibuat

                      <span className="text-[10px] text-gray-400">
                        ↕
                      </span>

                    </button>
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-center text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Aksi
                  </TableCell>

                </TableRow>

              </TableHeader>


              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">

                {paginatedPermissions.map(
                  (
                    permission
                  ) => (
                    <TableRow
                      key={
                        permission.id
                      }
                    >

                      <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {
                          permission.id
                        }
                      </TableCell>


                      <TableCell className="px-6 py-4">

                        <div className="font-medium text-gray-800 dark:text-white/90">
                          {
                            permission.name
                          }
                        </div>

                      </TableCell>


                      <TableCell className="px-6 py-4">

                        <span className="whitespace-nowrap rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {
                            permission.slug
                          }
                        </span>

                      </TableCell>


                      <TableCell className="px-6 py-4 text-center">

                        <Badge
                          size="sm"
                          color={
                            permission.menu_count >
                            0
                              ? "primary"
                              : "light"
                          }
                        >
                          {
                            permission.menu_count
                          }
                        </Badge>

                      </TableCell>


                      <TableCell className="px-6 py-4 text-center">

                        <Badge
                          size="sm"
                          color={
                            permission.role_count >
                            0
                              ? "primary"
                              : "light"
                          }
                        >
                          {
                            permission.role_count
                          }
                        </Badge>

                      </TableCell>


                      <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(
                          permission.created_at
                        )}
                      </TableCell>


                      <TableCell className="px-6 py-4">

                        <div className="flex items-center justify-center gap-2">

                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              openEditModal(
                                permission
                              )
                            }
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/10"
                          >

                            <MenuIcon
                              name="pencil"
                              className="size-4"
                            />

                          </button>


                          <button
                            type="button"
                            title="Hapus"
                            onClick={() =>
                              setDeleteTarget(
                                permission
                              )
                            }
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-error-300 hover:bg-error-50 hover:text-error-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-error-500/30 dark:hover:bg-error-500/10"
                          >

                            <MenuIcon
                              name="trash"
                              className="size-4"
                            />

                          </button>

                        </div>

                      </TableCell>

                    </TableRow>
                  )
                )}

              </TableBody>

            </Table>

          </div>


          {loading && (
            <div className="border-t border-gray-100 px-6 py-12 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              Memuat data permission...
            </div>
          )}


          {!loading &&
          paginatedPermissions.length ===
            0 && (
            <div className="border-t border-gray-100 px-6 py-12 text-center dark:border-gray-800">

              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Belum ada data permission.
              </div>

              <div className="mt-1 text-xs text-gray-400">
                Tambahkan permission baru untuk mengatur akses aplikasi.
              </div>

            </div>
          )}


          {/* PAGINATION */}

          <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/30 px-6 py-5 dark:border-gray-800 dark:bg-white/[0.01] sm:flex-row sm:items-center sm:justify-between">

            <div className="text-sm text-gray-500 dark:text-gray-400">

              Menampilkan{" "}

              {sortedPermissions.length ===
              0
                ? 0
                : (currentPage -
                    1) *
                    pageSize +
                  1}

              {" - "}

              {Math.min(
                currentPage *
                  pageSize,
                sortedPermissions.length
              )}

              {" dari "}

              {
                sortedPermissions.length
              }

              {" data"}

            </div>


            <div className="flex items-center gap-3">

              <button
                type="button"
                disabled={
                  currentPage <= 1
                }
                onClick={() =>
                  setPage(
                    currentPage -
                      1
                  )
                }
                className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Sebelumnya
              </button>


              <span className="min-w-12 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                {currentPage} /{" "}
                {totalPages}
              </span>


              <button
                type="button"
                disabled={
                  currentPage >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    currentPage +
                      1
                  )
                }
                className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Berikutnya
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* TOAST */}

      {(success || error) && (
        <div className="fixed bottom-5 right-5 z-[100002] w-[calc(100%-2rem)] max-w-sm">

          {success && (
            <div className="flex items-start gap-3 rounded-xl border border-success-200 bg-success-50 px-4 py-3.5 shadow-theme-lg dark:border-success-500/20 dark:bg-gray-900">

              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-600 dark:bg-success-500/15 dark:text-success-400">

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12.5L9.2 16.5L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>


              <div className="min-w-0 flex-1">

                <div className="text-sm font-semibold text-success-800 dark:text-success-400">
                  Berhasil
                </div>

                <div className="mt-0.5 text-sm text-success-700 dark:text-gray-300">
                  {
                    success
                  }
                </div>

              </div>


              <button
                type="button"
                aria-label="Tutup"
                onClick={() =>
                  setSuccess("")
                }
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-success-600 transition hover:bg-success-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                ✕
              </button>

            </div>
          )}


          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3.5 shadow-theme-lg dark:border-error-500/20 dark:bg-gray-900">

              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-error-100 text-error-600 dark:bg-error-500/15 dark:text-error-400">
                <span className="text-base font-semibold">
                  !
                </span>
              </div>


              <div className="min-w-0 flex-1">

                <div className="text-sm font-semibold text-error-800 dark:text-error-400">
                  Gagal
                </div>

                <div className="mt-0.5 text-sm text-error-700 dark:text-gray-300">
                  {
                    error
                  }
                </div>

              </div>


              <button
                type="button"
                aria-label="Tutup"
                onClick={() =>
                  setError("")
                }
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-error-600 transition hover:bg-error-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                ✕
              </button>

            </div>
          )}

        </div>
      )}


      {/* ================================================================
          CREATE / EDIT MODAL
      ================================================================= */}

      {modalOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Tutup modal"
            onClick={
              closeModal
            }
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px]"
          />


          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-theme-xl dark:bg-gray-900">

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">

              <div>

                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {editingPermission
                    ? "Edit Permission"
                    : "Tambah Permission"}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {editingPermission
                    ? "Perbarui data permission."
                    : "Tambahkan permission baru."}
                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeModal
                }
                className="inline-flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                ✕
              </button>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="space-y-5 p-6">

                {formError && (
                  <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400">
                    {
                      formError
                    }
                  </div>
                )}


                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nama Permission *
                  </label>

                  <input
                    required
                    value={
                      form.name
                    }
                    onChange={
                      (event) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            name:
                              event
                                .target
                                .value,
                          })
                        )
                    }
                    placeholder="Contoh: Menu Management"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                  />

                </div>


                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slug *
                  </label>

                  <input
                    required
                    value={
                      form.slug
                    }
                    onChange={
                      (event) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            slug:
                              event
                                .target
                                .value,
                          })
                        )
                    }
                    placeholder="Contoh: superadmin.menu"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                  />

                  <p className="mt-1.5 text-xs text-gray-400">
                    Gunakan huruf kecil, angka, titik, underscore, atau tanda hubung.
                  </p>

                </div>

              </div>


              <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-5 dark:border-gray-800">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  Batal
                </button>


                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingPermission
                    ? "Simpan Perubahan"
                    : "Tambah Permission"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* ================================================================
          DELETE MODAL
      ================================================================= */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">

          <button
            type="button"
            className="absolute inset-0 bg-gray-900/50"
            onClick={() =>
              setDeleteTarget(
                null
              )
            }
          />


          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-theme-xl dark:bg-gray-900">

            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Hapus Permission
            </h2>


            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">

              Yakin ingin menghapus permission{" "}

              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {
                  deleteTarget.name
                }
              </span>

              ?

            </p>


            {(deleteTarget.menu_count >
              0 ||
              deleteTarget.role_count >
                0) && (
              <div className="mt-4 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:border-warning-500/20 dark:bg-warning-500/10 dark:text-warning-400">

                Permission ini masih digunakan oleh{" "}

                <strong>
                  {
                    deleteTarget.menu_count
                  }
                </strong>

                {" menu dan "}

                <strong>
                  {
                    deleteTarget.role_count
                  }
                </strong>

                {" role."}

              </div>
            )}


            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:text-gray-300"
              >
                Batal
              </button>


              <button
                type="button"
                disabled={
                  deletingId ===
                  deleteTarget.id
                }
                onClick={
                  handleDelete
                }
                className="rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-error-600 disabled:opacity-50"
              >
                {deletingId ===
                deleteTarget.id
                  ? "Menghapus..."
                  : "Hapus"}
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}