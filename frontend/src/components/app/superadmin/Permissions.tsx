import PageMeta from "../common/PageMeta";

export default function Permissions() {
  return (
    <>
      <PageMeta
        title="Permissions"
        description="Permission Management"
      />

      <div className="space-y-6">

        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Permissions
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola permission aplikasi.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          Permission management akan dibuat selanjutnya.
        </div>

      </div>
    </>
  );
}