import {
  useEffect,
  useMemo,
  useRef,
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
  getMenuIconLabel,
  MENU_ICON_OPTIONS,
  MenuIcon,
} from "../../../utils/menuIcons";

const API_URL = import.meta.env.VITE_API_URL;


/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type Permission = {
  id: number;
  name: string;
  slug: string;
};

type MenuRow = {
  id: number;

  parent_id: number | null;
  parent_name: string | null;

  name: string;
  path: string | null;
  icon: string | null;

  sort_order: number;

  permission_id: number | null;
  permission_name: string | null;
  permission_slug: string | null;

  badge_key: string | null;

  is_active: boolean;
  is_hidden: boolean;

  level: number;

  created_at: string;
  updated_at: string;
};

type MenuResponse = {
  menus: MenuRow[];
  permissions: Permission[];
};

type MenuForm = {
  name: string;
  parent_id: string;
  path: string;
  icon: string;
  sort_order: string;
  permission_id: string;
  badge_key: string;
  is_active: boolean;
  is_hidden: boolean;
};

type SortKey =
  | "id"
  | "name"
  | "level"
  | "sort_order";

const emptyForm: MenuForm = {
  name: "",
  parent_id: "",
  path: "",
  icon: "",
  sort_order: "1",
  permission_id: "",
  badge_key: "",
  is_active: true,
  is_hidden: false,
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function Menus() {
  const navigate = useNavigate();


  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const [menus, setMenus] =
    useState<MenuRow[]>([]);

  const [permissions, setPermissions] =
    useState<Permission[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | DATATABLE
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] =
    useState("");

  const [pageSize, setPageSize] =
    useState(10);

  const [page, setPage] =
    useState(1);

  const [sortKey, setSortKey] =
    useState<SortKey>("sort_order");

  const [sortDirection, setSortDirection] =
    useState<"asc" | "desc">("asc");


  /*
  |--------------------------------------------------------------------------
  | FORM MODAL
  |--------------------------------------------------------------------------
  */

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingMenu, setEditingMenu] =
    useState<MenuRow | null>(null);

  const [form, setForm] =
    useState<MenuForm>({
      ...emptyForm,
    });

  const [formError, setFormError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | ICON DROPDOWN
  |--------------------------------------------------------------------------
  */

  const [
    iconDropdownOpen,
    setIconDropdownOpen,
  ] = useState(false);

  const iconDropdownRef =
    useRef<HTMLDivElement | null>(null);


  /*
  |--------------------------------------------------------------------------
  | DELETE MODAL
  |--------------------------------------------------------------------------
  */

  const [deleteTarget, setDeleteTarget] =
    useState<MenuRow | null>(null);


  /*
  |--------------------------------------------------------------------------
  | ICON DROPDOWN OUTSIDE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleOutside = (
      event: MouseEvent
    ) => {
      if (
        iconDropdownRef.current &&
        !iconDropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIconDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);


  /*
  |--------------------------------------------------------------------------
  | API
  |--------------------------------------------------------------------------
  */

  const apiRequest = async <T,>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const token = getToken();

    if (!token) {
      clearAuth();

      navigate("/login", {
        replace: true,
      });

      throw new Error(
        "Session login tidak ditemukan."
      );
    }

    const response = await fetch(
      `${API_URL}${path}`,
      {
        ...options,

        headers: {
          Accept: "application/json",

          ...(options.body
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),

          Authorization:
            `Bearer ${token}`,

          ...(options.headers ?? {}),
        },
      }
    );

    let data: any = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 401) {
      clearAuth();

      navigate("/login", {
        replace: true,
      });

      throw new Error(
        "Session telah berakhir."
      );
    }

    if (!response.ok) {
      if (
        data?.errors &&
        typeof data.errors === "object"
      ) {
        const first =
          Object.values(
            data.errors
          )[0];

        if (
          Array.isArray(first) &&
          first.length > 0
        ) {
          throw new Error(
            String(first[0])
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
  | LOAD MENU
  |--------------------------------------------------------------------------
  */

  const loadMenus = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await apiRequest<MenuResponse>(
          "/auth/menus"
        );

      setMenus(
        data.menus ?? []
      );

      setPermissions(
        data.permissions ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data menu."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);


  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const filteredMenus =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return menus;
      }

      return menus.filter(
        (menu) => {
          const text = [
            menu.id,
            menu.name,
            menu.parent_name,
            menu.path,
            menu.icon,
            menu.permission_name,
            menu.permission_slug,
            menu.level,
            menu.sort_order,
          ]
            .filter(
              (value) =>
                value !== null &&
                value !== undefined
            )
            .join(" ")
            .toLowerCase();

          return text.includes(
            keyword
          );
        }
      );
    }, [
      menus,
      search,
    ]);


  /*
  |--------------------------------------------------------------------------
  | SORT
  |--------------------------------------------------------------------------
  */

  const sortedMenus =
    useMemo(() => {
      const result = [
        ...filteredMenus,
      ];

      result.sort((a, b) => {
        const valueA =
          a[sortKey];

        const valueB =
          b[sortKey];

        if (
          typeof valueA === "number" &&
          typeof valueB === "number"
        ) {
          return sortDirection === "asc"
            ? valueA - valueB
            : valueB - valueA;
        }

        const stringA =
          String(
            valueA ?? ""
          );

        const stringB =
          String(
            valueB ?? ""
          );

        return sortDirection === "asc"
          ? stringA.localeCompare(
              stringB
            )
          : stringB.localeCompare(
              stringA
            );
      });

      return result;
    }, [
      filteredMenus,
      sortKey,
      sortDirection,
    ]);


  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedMenus.length /
        pageSize
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedMenus =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        pageSize;

      return sortedMenus.slice(
        start,
        start + pageSize
      );
    }, [
      sortedMenus,
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
    if (sortKey === key) {
      setSortDirection(
        (previous) =>
          previous === "asc"
            ? "desc"
            : "asc"
      );

      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };


  /*
  |--------------------------------------------------------------------------
  | INVALID PARENT
  |--------------------------------------------------------------------------
  */

  const invalidParentIds =
    useMemo(() => {
      const ids =
        new Set<number>();

      if (!editingMenu) {
        return ids;
      }

      ids.add(
        editingMenu.id
      );

      let changed = true;

      while (changed) {
        changed = false;

        menus.forEach(
          (menu) => {
            if (
              menu.parent_id !== null &&
              ids.has(
                menu.parent_id
              ) &&
              !ids.has(
                menu.id
              )
            ) {
              ids.add(
                menu.id
              );

              changed = true;
            }
          }
        );
      }

      return ids;
    }, [
      editingMenu,
      menus,
    ]);

  const parentOptions =
    useMemo(() => {
      return menus.filter(
        (menu) =>
          menu.level < 3 &&
          !invalidParentIds.has(
            menu.id
          )
      );
    }, [
      menus,
      invalidParentIds,
    ]);


  /*
  |--------------------------------------------------------------------------
  | TAMBAH MODAL
  |--------------------------------------------------------------------------
  */

  const openCreateModal = () => {
    setEditingMenu(null);

    setForm({
      ...emptyForm,

      sort_order: String(
        menus.length + 1
      ),
    });

    setFormError("");
    setSuccess("");
    setError("");
    setIconDropdownOpen(false);

    setModalOpen(true);
  };


  /*
  |--------------------------------------------------------------------------
  | EDIT MODAL
  |--------------------------------------------------------------------------
  */

  const openEditModal = (
    menu: MenuRow
  ) => {
    setEditingMenu(menu);

    setForm({
      name:
        menu.name,

      parent_id:
        menu.parent_id !== null
          ? String(
              menu.parent_id
            )
          : "",

      path:
        menu.path ?? "",

      icon:
        menu.icon ?? "",

      sort_order:
        String(
          menu.sort_order
        ),

      permission_id:
        menu.permission_id !== null
          ? String(
              menu.permission_id
            )
          : "",

      badge_key:
        menu.badge_key ?? "",

      is_active:
        menu.is_active,

      is_hidden:
        menu.is_hidden,
    });

    setFormError("");
    setSuccess("");
    setError("");
    setIconDropdownOpen(false);

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingMenu(null);
    setFormError("");
    setIconDropdownOpen(false);
  };


  /*
  |--------------------------------------------------------------------------
  | SAVE CREATE / UPDATE
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
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

        parent_id:
          form.parent_id
            ? Number(
                form.parent_id
              )
            : null,

        path:
          form.path.trim()
            ? form.path.trim()
            : null,

        icon:
          form.icon || null,

        sort_order:
          Number(
            form.sort_order
          ),

        permission_id:
          form.permission_id
            ? Number(
                form.permission_id
              )
            : null,

        badge_key:
          form.badge_key.trim()
            ? form.badge_key.trim()
            : null,

        is_active:
          form.is_active,

        is_hidden:
          form.is_hidden,
      };

      if (editingMenu) {
        await apiRequest(
          `/auth/menus/${editingMenu.id}`,
          {
            method: "PUT",

            body:
              JSON.stringify(
                payload
              ),
          }
        );

        setSuccess(
          "Menu berhasil diperbarui."
        );
      } else {
        await apiRequest(
          "/auth/menus",
          {
            method: "POST",

            body:
              JSON.stringify(
                payload
              ),
          }
        );

        setSuccess(
          "Menu berhasil ditambahkan."
        );
      }

      setModalOpen(false);
      setEditingMenu(null);
      setIconDropdownOpen(false);

      await loadMenus();

    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan menu."
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

  const handleDelete = async () => {
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
        `/auth/menus/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      setSuccess(
        "Menu berhasil dihapus."
      );

      setDeleteTarget(null);

      await loadMenus();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus menu."
      );
    } finally {
      setDeletingId(null);
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
        title="Menu Management"
        description="Menu Management"
      />


      <div className="space-y-6">

        {/* PAGE HEADER */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Menu Management
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
              Menu Management
            </span>

          </div>

        </div>


        {/* CARD */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">


          {/* CARD HEADER */}

          <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Menu Management
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Kelola menu aplikasi, permission, icon, badge, dan struktur menu.
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

              Tambah Menu

            </button>

          </div>


          {/* ALERT */}

          {success && (
            <div className="mx-6 mt-5 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400">
              {success}
            </div>
          )}

          {error && (
            <div className="mx-6 mt-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          )}


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
                placeholder="Cari menu..."
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
                        handleSort("id")
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
                        handleSort("name")
                      }
                      className="flex w-full items-center gap-1 text-left"
                    >
                      Menu

                      <span className="text-[10px] text-gray-400">
                        ↕
                      </span>
                    </button>
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Parent
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Path
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Icon
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Permission
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleSort("level")
                      }
                      className="flex w-full items-center gap-1 text-left"
                    >
                      Level

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
                          "sort_order"
                        )
                      }
                      className="flex w-full items-center gap-1 text-left"
                    >
                      Urutan

                      <span className="text-[10px] text-gray-400">
                        ↕
                      </span>
                    </button>
                  </TableCell>


                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Status
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

                {paginatedMenus.map(
                  (menu) => (
                    <TableRow
                      key={
                        menu.id
                      }
                    >

                      <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {menu.id}
                      </TableCell>


                      <TableCell className="px-6 py-4">

                        <div className="font-medium text-gray-800 dark:text-white/90">

                          <span className="text-gray-400">
                            {"— ".repeat(
                              Math.max(
                                menu.level - 1,
                                0
                              )
                            )}
                          </span>

                          {menu.name}

                        </div>

                      </TableCell>


                      <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {menu.parent_name ?? "-"}
                      </TableCell>


                      <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">

                        {menu.path ? (
                          <span className="whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {menu.path}
                          </span>
                        ) : (
                          "-"
                        )}

                      </TableCell>


                      <TableCell className="px-6 py-4">

                        {menu.icon ? (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">

                            <div className="flex size-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">

                              <MenuIcon
                                name={
                                  menu.icon
                                }
                                className="size-4"
                              />

                            </div>

                            <span className="whitespace-nowrap text-xs">
                              {getMenuIconLabel(
                                menu.icon
                              )}
                            </span>

                          </div>
                        ) : (
                          <span className="text-gray-400">
                            -
                          </span>
                        )}

                      </TableCell>


                      <TableCell className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">

                        {menu.permission_name ? (
                          <div className="min-w-40">

                            <div className="font-medium text-gray-700 dark:text-gray-300">
                              {menu.permission_name}
                            </div>

                            <div className="mt-0.5 text-gray-400">
                              {menu.permission_slug}
                            </div>

                          </div>
                        ) : (
                          <span className="text-gray-400">
                            -
                          </span>
                        )}

                      </TableCell>


                      <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {menu.level}
                      </TableCell>


                      <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {menu.sort_order}
                      </TableCell>


                      <TableCell className="px-6 py-4">

                        <Badge
                          size="sm"
                          color={
                            menu.is_active
                              ? "success"
                              : "error"
                          }
                        >
                          {menu.is_active
                            ? "Aktif"
                            : "Nonaktif"}
                        </Badge>

                      </TableCell>


                      <TableCell className="px-6 py-4">

                        <div className="flex items-center justify-center gap-2">

                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              openEditModal(
                                menu
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
                                menu
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
              Memuat data menu...
            </div>
          )}


          {!loading &&
          paginatedMenus.length === 0 && (
            <div className="border-t border-gray-100 px-6 py-12 text-center dark:border-gray-800">

              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Belum ada data menu.
              </div>

              <div className="mt-1 text-xs text-gray-400">
                Tambahkan menu baru untuk mulai mengelola sidebar.
              </div>

            </div>
          )}


          {/* PAGINATION */}

          <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/30 px-6 py-5 dark:border-gray-800 dark:bg-white/[0.01] sm:flex-row sm:items-center sm:justify-between">

            <div className="text-sm text-gray-500 dark:text-gray-400">

              Menampilkan{" "}

              {sortedMenus.length === 0
                ? 0
                : (currentPage - 1) *
                    pageSize +
                  1}

              {" - "}

              {Math.min(
                currentPage *
                  pageSize,
                sortedMenus.length
              )}

              {" dari "}

              {sortedMenus.length}

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
                    currentPage - 1
                  )
                }
                className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Sebelumnya
              </button>


              <span className="min-w-12 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>


              <button
                type="button"
                disabled={
                  currentPage >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    currentPage + 1
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


          <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-theme-xl dark:bg-gray-900">

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">

              <div>

                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {editingMenu
                    ? "Edit Menu"
                    : "Tambah Menu"}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {editingMenu
                    ? "Perbarui data menu."
                    : "Tambahkan menu baru."}
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

              <div className="space-y-6 p-6">

                {formError && (
                  <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400">
                    {formError}
                  </div>
                )}


                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                  {/* NAMA */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nama Menu *
                    </label>

                    <input
                      required
                      value={
                        form.name
                      }
                      onChange={
                        (event) =>
                          setForm(
                            (previous) => ({
                              ...previous,

                              name:
                                event.target.value,
                            })
                          )
                      }
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                    />

                  </div>


                  {/* PARENT */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Parent Menu
                    </label>

                    <select
                      value={
                        form.parent_id
                      }
                      onChange={
                        (event) =>
                          setForm(
                            (previous) => ({
                              ...previous,

                              parent_id:
                                event.target.value,
                            })
                          )
                      }
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >
                      <option value="">
                        Root / Tidak Ada Parent
                      </option>

                      {parentOptions.map(
                        (menu) => (
                          <option
                            key={
                              menu.id
                            }
                            value={
                              menu.id
                            }
                          >
                            {"— ".repeat(
                              Math.max(
                                menu.level -
                                  1,
                                0
                              )
                            )}

                            {menu.name}
                          </option>
                        )
                      )}

                    </select>

                    <p className="mt-1 text-xs text-gray-400">
                      Maksimal struktur 3 level.
                    </p>

                  </div>


                  {/* PATH */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Path
                    </label>

                    <input
                      value={
                        form.path
                      }
                      onChange={
                        (event) =>
                          setForm(
                            (previous) => ({
                              ...previous,

                              path:
                                event.target.value,
                            })
                          )
                      }
                      placeholder="/superadmin/contoh"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                    />

                    <p className="mt-1 text-xs text-gray-400">
                      Kosongkan kalau hanya sebagai parent/dropdown.
                    </p>

                  </div>


                  {/* SORT ORDER */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Urutan *
                    </label>

                    <input
                      type="number"
                      min="0"
                      required
                      value={
                        form.sort_order
                      }
                      onChange={
                        (event) =>
                          setForm(
                            (previous) => ({
                              ...previous,

                              sort_order:
                                event.target.value,
                            })
                          )
                      }
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                    />

                  </div>


                  {/* PERMISSION */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Permission
                    </label>

                    <select
                      value={
                        form.permission_id
                      }
                      onChange={
                        (event) =>
                          setForm(
                            (previous) => ({
                              ...previous,

                              permission_id:
                                event.target.value,
                            })
                          )
                      }
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >
                      <option value="">
                        Tanpa Permission
                      </option>

                      {permissions.map(
                        (permission) => (
                          <option
                            key={
                              permission.id
                            }
                            value={
                              permission.id
                            }
                          >
                            {permission.name}
                            {" — "}
                            {permission.slug}
                          </option>
                        )
                      )}

                    </select>

                  </div>


                  {/* BADGE */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Badge Key
                    </label>

                    <input
                      value={
                        form.badge_key
                      }
                      onChange={
                        (event) =>
                          setForm(
                            (previous) => ({
                              ...previous,

                              badge_key:
                                event.target.value,
                            })
                          )
                      }
                      placeholder="Opsional"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                    />

                  </div>


                  {/* ICON */}

                  <div
                    ref={
                      iconDropdownRef
                    }
                    className="relative md:col-span-2"
                  >

                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Icon
                    </label>


                    <button
                      type="button"
                      onClick={() =>
                        setIconDropdownOpen(
                          (previous) =>
                            !previous
                        )
                      }
                      className="flex h-11 w-full items-center rounded-lg border border-gray-300 bg-transparent px-4 text-left text-sm text-gray-700 outline-none transition hover:border-gray-400 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >

                      {form.icon ? (
                        <>
                          <MenuIcon
                            name={
                              form.icon
                            }
                            className="mr-3 size-5"
                          />

                          <span>
                            {getMenuIconLabel(
                              form.icon
                            )}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400">
                          Pilih Icon
                        </span>
                      )}


                      <svg
                        className={`ml-auto size-4 transition-transform ${
                          iconDropdownOpen
                            ? "rotate-180"
                            : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                    </button>


                    {iconDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-700 dark:bg-gray-900">

                        <div className="max-h-64 overflow-y-auto p-1">

                          <button
                            type="button"
                            onClick={() => {
                              setForm(
                                (previous) => ({
                                  ...previous,

                                  icon: "",
                                })
                              );

                              setIconDropdownOpen(
                                false
                              );
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                              form.icon === ""
                                ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                            }`}
                          >

                            <span className="flex size-5 items-center justify-center text-gray-400">
                              —
                            </span>

                            Tanpa Icon

                          </button>


                          {MENU_ICON_OPTIONS.map(
                            (icon) => (
                              <button
                                key={
                                  icon.value
                                }
                                type="button"
                                onClick={() => {
                                  setForm(
                                    (previous) => ({
                                      ...previous,

                                      icon:
                                        icon.value,
                                    })
                                  );

                                  setIconDropdownOpen(
                                    false
                                  );
                                }}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                  form.icon ===
                                  icon.value
                                    ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                                }`}
                              >

                                <MenuIcon
                                  name={
                                    icon.value
                                  }
                                  className="size-5"
                                />

                                <span>
                                  {icon.label}
                                </span>

                              </button>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  </div>

                </div>


                {/* ACTIVE / HIDDEN */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-700">

                    <div>

                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Aktif
                      </div>

                      <div className="text-xs text-gray-400">
                        Menu dapat digunakan.
                      </div>

                    </div>


                    <input
                      type="checkbox"
                      checked={
                        form.is_active
                      }
                      onChange={
                        (event) =>
                          setForm(
                            (previous) => ({
                              ...previous,

                              is_active:
                                event.target.checked,
                            })
                          )
                      }
                      className="size-5 accent-brand-500"
                    />

                  </label>


                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-700">

                    <div>

                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hidden
                      </div>

                      <div className="text-xs text-gray-400">
                        Sembunyikan dari sidebar.
                      </div>

                    </div>


                    <input
                      type="checkbox"
                      checked={
                        form.is_hidden
                      }
                      onChange={
                        (event) =>
                          setForm(
                            (previous) => ({
                              ...previous,

                              is_hidden:
                                event.target.checked,
                            })
                          )
                      }
                      className="size-5 accent-brand-500"
                    />

                  </label>

                </div>

              </div>


              {/* FOOTER */}

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
                    : editingMenu
                    ? "Simpan Perubahan"
                    : "Tambah Menu"}
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
              Hapus Menu
            </h2>


            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">

              Yakin ingin menghapus menu{" "}

              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {deleteTarget.name}
              </span>

              ?

            </p>


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