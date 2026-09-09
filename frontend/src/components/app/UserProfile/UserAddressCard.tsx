export default function UserAddressCard() {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">

      <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
        Informasi Alamat
      </h4>


      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">

        <div>

          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Negara
          </p>

          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            Indonesia
          </p>

        </div>


        <div>

          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Kota / Kabupaten
          </p>

          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            Kuningan, Jawa Barat
          </p>

        </div>


        <div>

          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Kode Pos
          </p>

          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            45511
          </p>

        </div>


        <div>

          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Perusahaan
          </p>

          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            Altertemplate
          </p>

        </div>

      </div>

    </div>
  );
}