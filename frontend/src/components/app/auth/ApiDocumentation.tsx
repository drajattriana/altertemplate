import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import PageMeta from "../common/PageMeta";

import {
  clearAuth,
  getToken,
} from "../../../utils/auth";


const API_URL =
  import.meta.env.VITE_API_URL;


type ApiRoute = {
  methods: string[];
  uri: string;
  protected: boolean;
  menu_guard: string | null;
};


type DocumentationResponse = {
  routes: ApiRoute[];
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function ApiDocumentation() {
  const navigate =
    useNavigate();

  const [
    routes,
    setRoutes,
  ] = useState<ApiRoute[]>(
    []
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

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
  | TOAST
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!success) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          setSuccess("");
        },
        3000
      );

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
      window.setTimeout(
        () => {
          setError("");
        },
        5000
      );

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
  | LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadRoutes =
      async () => {
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

          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_URL}/auth/documentation`,
              {
                method:
                  "GET",

                credentials:
                  "omit",

                headers: {
                  Accept:
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

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

            return;
          }

          if (!response.ok) {
            throw new Error(
              "Gagal mengambil dokumentasi API."
            );
          }

          const data =
            await response.json() as DocumentationResponse;

          setRoutes(
            data.routes ??
              []
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal mengambil dokumentasi API."
          );
        } finally {
          setLoading(false);
        }
      };

    loadRoutes();
  }, [
    navigate,
  ]);


  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredRoutes =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return routes;
      }

      return routes.filter(
        (route) =>
          [
            route.uri,
            route.methods.join(
              " "
            ),
            route.menu_guard,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(
              keyword
            )
      );
    }, [
      routes,
      search,
    ]);


  /*
  |--------------------------------------------------------------------------
  | COPY
  |--------------------------------------------------------------------------
  */

  const fallbackCopy =
    (
      value: string
    ): boolean => {
      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value =
        value;

      textarea.setAttribute(
        "readonly",
        ""
      );

      textarea.style.position =
        "fixed";

      textarea.style.left =
        "-9999px";

      textarea.style.top =
        "-9999px";

      document.body.appendChild(
        textarea
      );

      textarea.focus();
      textarea.select();

      let copied =
        false;

      try {
        copied =
          document.execCommand(
            "copy"
          );
      } catch {
        copied =
          false;
      }

      document.body.removeChild(
        textarea
      );

      return copied;
    };


  const copyText =
    async (
      value: string,
      message: string
    ) => {
      try {
        setError("");

        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {
          await navigator.clipboard.writeText(
            value
          );

          setSuccess(
            message
          );

          return;
        }

        const copied =
          fallbackCopy(
            value
          );

        if (!copied) {
          throw new Error(
            "Copy gagal."
          );
        }

        setSuccess(
          message
        );
      } catch {
        setError(
          "Tidak dapat menyalin ke clipboard."
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | CURL
  |--------------------------------------------------------------------------
  */

  const buildCurl = (
    route: ApiRoute,
    method: string
  ) => {
    const body =
      [
        "POST",
        "PUT",
        "PATCH",
      ].includes(method)
        ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '{}'`
        : "";

    const auth =
      route.protected
        ? ` \\\n  -H "Authorization: Bearer <token>"`
        : "";

    return `curl -X ${method} "${API_URL}${route.uri}" \\
  -H "Accept: application/json"${auth}${body}`;
  };


  /*
  |--------------------------------------------------------------------------
  | POSTMAN
  |--------------------------------------------------------------------------
  */

  const buildPostmanCollection =
    () => {
      const items =
        routes.flatMap(
          (route) =>
            route.methods.map(
              (method) => ({
                name:
                  `${method} ${route.uri}`,

                request: {
                  method,

                  header: [
                    {
                      key:
                        "Accept",

                      value:
                        "application/json",
                    },
                  ],

                  auth:
                    route.protected
                      ? {
                          type:
                            "bearer",

                          bearer: [
                            {
                              key:
                                "token",

                              value:
                                "{{token}}",

                              type:
                                "string",
                            },
                          ],
                        }
                      : {
                          type:
                            "noauth",
                        },

                  url:
                    `{{base_url}}${route.uri}`,
                },
              })
            )
        );

      return {
        info: {
          name:
            "Altertemplate API",

          schema:
            "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },

        variable: [
          {
            key:
              "base_url",

            value:
              API_URL,
          },
          {
            key:
              "token",

            value:
              "",
          },
        ],

        item:
          items,
      };
    };


  const copyPostman =
    async () => {
      await copyText(
        JSON.stringify(
          buildPostmanCollection(),
          null,
          2
        ),
        "Postman JSON berhasil disalin."
      );
    };


  const downloadPostman =
    () => {
      const content =
        JSON.stringify(
          buildPostmanCollection(),
          null,
          2
        );

      const blob =
        new Blob(
          [
            content,
          ],
          {
            type:
              "application/json",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        url;

      link.download =
        "altertemplate-api.postman_collection.json";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );

      setSuccess(
        "Postman Collection berhasil diunduh."
      );
    };


  /*
  |--------------------------------------------------------------------------
  | METHOD STYLE
  |--------------------------------------------------------------------------
  */

  const methodClass = (
    method: string
  ) => {
    switch (method) {
      case "GET":
        return "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400";

      case "POST":
        return "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400";

      case "PUT":
      case "PATCH":
        return "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400";

      case "DELETE":
        return "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400";

      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
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
        title="API Documentation"
        description="Altertemplate API Documentation"
      />


      <div className="space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              API Documentation
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Daftar endpoint API yang tersedia pada backend Altertemplate.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={
                copyPostman
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Copy Postman JSON
            </button>


            <button
              type="button"
              onClick={
                downloadPostman
              }
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Download Postman
            </button>

          </div>

        </div>


        {/* SUMMARY */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Endpoint
            </div>

            <div className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {routes.length}
            </div>

          </div>


          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Protected
            </div>

            <div className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {
                routes.filter(
                  (route) =>
                    route.protected
                ).length
              }
            </div>

          </div>


          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Permission Guard
            </div>

            <div className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {
                routes.filter(
                  (route) =>
                    route.menu_guard !==
                    null
                ).length
              }
            </div>

          </div>

        </div>


        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

          <div className="border-b border-gray-100 p-5 dark:border-gray-800">

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
              placeholder="Cari endpoint..."
              className="h-11 w-full max-w-md rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
            />

          </div>


          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50 dark:bg-white/[0.02]">

                <tr className="border-b border-gray-100 dark:border-gray-800">

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Method
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Endpoint
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                    Access
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

                {filteredRoutes.map(
                  (
                    route,
                    routeIndex
                  ) => (
                    <tr
                      key={`${route.uri}-${routeIndex}`}
                    >

                      <td className="px-5 py-4">

                        <div className="flex flex-wrap gap-1.5">

                          {route.methods.map(
                            (method) => (
                              <span
                                key={
                                  method
                                }
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${methodClass(
                                  method
                                )}`}
                              >
                                {method}
                              </span>
                            )
                          )}

                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <code className="text-sm text-gray-700 dark:text-gray-300">
                          {route.uri}
                        </code>

                        {route.menu_guard && (
                          <div className="mt-1 text-xs text-gray-400">
                            Guard:{" "}
                            {
                              route.menu_guard
                            }
                          </div>
                        )}

                      </td>


                      <td className="px-5 py-4">

                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {route.protected
                            ? "Bearer Token"
                            : "Public"}
                        </span>

                      </td>


                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                `${API_URL}${route.uri}`,
                                "URL berhasil disalin."
                              )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            Copy URL
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                buildCurl(
                                  route,
                                  route.methods[
                                    0
                                  ]
                                ),
                                "cURL berhasil disalin."
                              )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            Copy cURL
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>


          {loading && (
            <div className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              Memuat dokumentasi API...
            </div>
          )}


          {!loading &&
            filteredRoutes.length ===
              0 && (
              <div className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                Endpoint tidak ditemukan.
              </div>
            )}

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
                  {success}
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
                !
              </div>


              <div className="min-w-0 flex-1">

                <div className="text-sm font-semibold text-error-800 dark:text-error-400">
                  Gagal
                </div>

                <div className="mt-0.5 text-sm text-error-700 dark:text-gray-300">
                  {error}
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

    </>
  );
}