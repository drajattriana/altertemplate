import {
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Modal,
} from "../ui/modal";

import {
  clearAuth,
  getAuthUser,
  getToken,
} from "../../../utils/auth";


const API_URL =
  import.meta.env.VITE_API_URL;


type PasswordForm = {
  current_password: string;
  password: string;
  password_confirmation: string;
};


const emptyForm: PasswordForm = {
  current_password: "",
  password: "",
  password_confirmation: "",
};


export default function UserInfoCard() {
  const navigate =
    useNavigate();

  const user =
    getAuthUser();

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState<PasswordForm>({
    ...emptyForm,
  });

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
  | MODAL
  |--------------------------------------------------------------------------
  */

  const openModal =
    () => {
      setForm({
        ...emptyForm,
      });

      setError("");
      setSuccess("");

      setModalOpen(
        true
      );
    };


  const closeModal =
    () => {
      if (saving) {
        return;
      }

      setModalOpen(
        false
      );

      setForm({
        ...emptyForm,
      });

      setError("");
    };


  /*
  |--------------------------------------------------------------------------
  | CHANGE PASSWORD
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (
      event: FormEvent
    ) => {
      event.preventDefault();

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

      if (
        form.password !==
        form.password_confirmation
      ) {
        setError(
          "Konfirmasi password baru tidak sesuai."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const response =
          await fetch(
            `${API_URL}/auth/password`,
            {
              method:
                "PUT",

              credentials:
                "omit",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  form
                ),
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

          return;
        }

        if (!response.ok) {
          if (
            data?.errors &&
            typeof data.errors ===
              "object"
          ) {
            const firstError =
              Object.values(
                data.errors
              )[0];

            if (
              Array.isArray(
                firstError
              ) &&
              firstError.length >
                0
            ) {
              throw new Error(
                String(
                  firstError[0]
                )
              );
            }
          }

          throw new Error(
            data?.message ??
              "Gagal memperbarui password."
          );
        }

        setModalOpen(
          false
        );

        setForm({
          ...emptyForm,
        });

        setSuccess(
          "Password berhasil diperbarui."
        );

        window.setTimeout(
          () => {
            setSuccess("");
          },
          4000
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memperbarui password."
        );
      } finally {
        setSaving(false);
      }
    };


  /*
  |--------------------------------------------------------------------------
  | VIEW
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div className="w-full">

            <div className="mb-6">

              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Data Akun
              </h4>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Informasi akun yang digunakan untuk login ke aplikasi.
              </p>

            </div>


            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7">

              <div>

                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Username
                </p>

                <div className="flex items-center gap-2">

                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {user?.username ??
                      "-"}
                  </p>

                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Tidak dapat diubah
                  </span>

                </div>

              </div>


              <div>

                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Email
                </p>

                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.email ??
                    "-"}
                </p>

              </div>


              <div>

                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Role
                </p>

                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.role.name ??
                    "-"}
                </p>

              </div>


              <div>

                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Password
                </p>

                <div className="flex items-center gap-3">

                  <p className="text-sm font-medium tracking-[0.18em] text-gray-800 dark:text-white/90">
                    ••••••••••
                  </p>

                  <button
                    type="button"
                    onClick={
                      openModal
                    }
                    className="text-xs font-medium text-brand-500 transition hover:text-brand-600"
                  >
                    Ganti Password
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* TOAST */}

      {success && (
        <div className="fixed bottom-5 right-5 z-[100002] w-[calc(100%-2rem)] max-w-sm">

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
              onClick={() =>
                setSuccess("")
              }
              className="inline-flex size-7 items-center justify-center rounded-md text-success-600 hover:bg-success-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              ✕
            </button>

          </div>

        </div>
      )}


      {/* PASSWORD MODAL */}

      <Modal
        isOpen={
          modalOpen
        }
        onClose={
          closeModal
        }
        className="max-w-[600px] m-4"
      >

        <div className="relative w-full overflow-y-auto rounded-3xl bg-white p-5 dark:bg-gray-900 lg:p-8">

          <div className="mb-6 pr-10">

            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Ganti Password
            </h4>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Masukkan password saat ini dan password baru.
            </p>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >

            {error && (
              <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400">
                {error}
              </div>
            )}


            <div>

              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password Saat Ini *
              </label>

              <input
                type="password"
                required
                autoComplete="current-password"
                value={
                  form.current_password
                }
                onChange={
                  (event) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        current_password:
                          event.target.value,
                      })
                    )
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
              />

            </div>


            <div>

              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password Baru *
              </label>

              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={
                  form.password
                }
                onChange={
                  (event) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        password:
                          event.target.value,
                      })
                    )
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Minimal 8 karakter.
              </p>

            </div>


            <div>

              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Konfirmasi Password Baru *
              </label>

              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={
                  form.password_confirmation
                }
                onChange={
                  (event) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        password_confirmation:
                          event.target.value,
                      })
                    )
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
              />

            </div>


            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  saving
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
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                {saving
                  ? "Menyimpan..."
                  : "Simpan Password"}
              </button>

            </div>

          </form>

        </div>

      </Modal>
    </>
  );
}