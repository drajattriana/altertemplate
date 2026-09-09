import {
  useEffect,
  useRef,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  logout,
} from "../../utils/auth";


export default function LogoutPage() {
  const navigate =
    useNavigate();

  const started =
    useRef(false);


  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      started.current
    ) {
      return;
    }

    started.current =
      true;

    const handleLogout =
      async () => {
        await logout();

        navigate(
          "/login",
          {
            replace: true,
          }
        );
      };

    handleLogout();
  }, [
    navigate,
  ]);


  /*
  |--------------------------------------------------------------------------
  | VIEW
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      Keluar dari aplikasi...
    </div>
  );
}