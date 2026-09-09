import {
  useState,
  type FormEvent,
} from "react";

import {
  Modal,
} from "../ui/modal";

import {
  getAuthUser,
} from "../../../utils/auth";


type ProfileForm = {
  full_name: string;
  phone: string;
  bio: string;
  city: string;
  address: string;
};


const initialProfile: ProfileForm = {
  full_name:
    "User Altertemplate",

  phone:
    "+62 812-3456-7890",

  bio:
    "Administrator Sistem",

  city:
    "Kuningan, Jawa Barat",

  address:
    "Jl. Contoh Alamat No. 123",
};


export default function UserMetaCard() {
  const user =
    getAuthUser();

  const [
    profile,
    setProfile,
  ] = useState<ProfileForm>({
    ...initialProfile,
  });

  const [
    form,
    setForm,
  ] = useState<ProfileForm>({
    ...initialProfile,
  });

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

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
        ...profile,
      });

      setModalOpen(
        true
      );
    };


  const closeModal =
    () => {
      setModalOpen(
        false
      );
    };


  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    (
      event: FormEvent
    ) => {
      event.preventDefault();

      setProfile({
        ...form,
      });

      setModalOpen(
        false
      );

      setSuccess(
        "Data profil berhasil diperbarui sementara."
      );

      window.setTimeout(
        () => {
          setSuccess("");
        },
        4000
      );
    };


  /*
  |--------------------------------------------------------------------------
  | VIEW
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          <div className="w-full">

            <div className="mb-6">

              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Data Profil
              </h4>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Informasi profil pengguna. Data sementara masih menggunakan data dummy.
              </p>

            </div>


            <div className="mb-7 flex flex-col items-center gap-4 border-b border-gray-100 pb-6 dark:border-gray-800 sm:flex-row">

              <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">

                <img
                  src="/images/user/owner.jpg"
                  alt="User"
                  className="h-full w-full object-cover"
                />

              </div>


              <div className="text-center sm:text-left">

                <h5 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  {profile.full_name}
                </h5>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {profile.bio}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  @{user?.username ??
                    "user"}
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7">

              <div>

                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Nama Lengkap
                </p>

                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.full_name}
                </p>

              </div>


              <div>

                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Nomor Telepon
                </p>

                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.phone}
                </p>

              </div>


              <div>

                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Kota / Kabupaten
                </p>

                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.city}
                </p>

              </div>


              <div>

                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Bio
                </p>

                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.bio}
                </p>

              </div>


              <div className="lg:col-span-2">

                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Alamat
                </p>

                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {profile.address}
                </p>

              </div>

            </div>

          </div>


          <button
            type="button"
            onClick={
              openModal
            }
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >

            <svg
              width="16"
              height="16"
              viewBox="0 0 18 18"
              fill="none"
              className="fill-current"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              />
            </svg>

            Edit Profil

          </button>

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

          </div>

        </div>
      )}


      {/* PROFILE MODAL */}

      <Modal
        isOpen={
          modalOpen
        }
        onClose={
          closeModal
        }
        className="max-w-[700px] m-4"
      >

        <div className="relative w-full overflow-y-auto rounded-3xl bg-white p-5 dark:bg-gray-900 lg:p-8">

          <div className="mb-6 pr-10">

            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Edit Data Profil
            </h4>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Data ini sementara belum disimpan ke database.
            </p>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  value={
                    form.full_name
                  }
                  onChange={
                    (event) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,

                          full_name:
                            event.target.value,
                        })
                      )
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                />

              </div>


              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nomor Telepon
                </label>

                <input
                  type="text"
                  value={
                    form.phone
                  }
                  onChange={
                    (event) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,

                          phone:
                            event.target.value,
                        })
                      )
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                />

              </div>


              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kota / Kabupaten
                </label>

                <input
                  type="text"
                  value={
                    form.city
                  }
                  onChange={
                    (event) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,

                          city:
                            event.target.value,
                        })
                      )
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                />

              </div>


              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio
                </label>

                <input
                  type="text"
                  value={
                    form.bio
                  }
                  onChange={
                    (event) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,

                          bio:
                            event.target.value,
                        })
                      )
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                />

              </div>


              <div className="lg:col-span-2">

                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alamat
                </label>

                <textarea
                  rows={3}
                  value={
                    form.address
                  }
                  onChange={
                    (event) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,

                          address:
                            event.target.value,
                        })
                      )
                  }
                  className="w-full resize-none rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-gray-300"
                />

              </div>

            </div>


            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">

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
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                Simpan Profil
              </button>

            </div>

          </form>

        </div>

      </Modal>
    </>
  );
}