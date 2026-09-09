import PageMeta from "../common/PageMeta";

import UserInfoCard from "./UserInfoCard";
import UserMetaCard from "./UserMetaCard";


export default function Profile() {
  return (
    <>
      <PageMeta
        title="Profile"
        description="User Profile"
      />


      <div className="space-y-6">

        {/* PAGE HEADER */}

        <div>

          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola data akun dan informasi profil pengguna.
          </p>

        </div>


        {/* DATA AKUN */}

        <UserInfoCard />


        {/* DATA PROFIL */}

        <UserMetaCard />

      </div>
    </>
  );
}