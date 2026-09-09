import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Dropdown,
} from "../ui/dropdown/Dropdown";

import {
  DropdownItem,
} from "../ui/dropdown/DropdownItem";

import {
  getAuthUser,
} from "../../../utils/auth";

import {
  MenuIcon,
} from "../../../utils/menuIcons";


export default function UserDropdown() {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const user =
    getAuthUser();

  const navigate =
    useNavigate();


  /*
  |--------------------------------------------------------------------------
  | DROPDOWN
  |--------------------------------------------------------------------------
  */

  function toggleDropdown() {
    setIsOpen(
      !isOpen
    );
  }


  function closeDropdown() {
    setIsOpen(
      false
    );
  }


  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  function handleSignOut() {
    closeDropdown();

    navigate(
      "/logout"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | VIEW
  |--------------------------------------------------------------------------
  */

  return (
    <div className="relative">

      <button
        type="button"
        onClick={
          toggleDropdown
        }
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >

        <span className="mr-3 h-11 w-11 overflow-hidden rounded-full">
          <img
            src="/images/user/owner.jpg"
            alt="User"
          />
        </span>

        <span className="mr-1 block font-medium text-theme-sm">
          {user?.username ??
            "Administrator"}
        </span>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
            isOpen
              ? "rotate-180"
              : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

      </button>


      <Dropdown
        isOpen={
          isOpen
        }
        onClose={
          closeDropdown
        }
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >

        <div className="px-1">

          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-300">
            {user?.username ??
              "Administrator"}
          </span>

          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {user?.email ??
              user?.role.name ??
              "Administrator"}
          </span>

        </div>


        <ul className="mt-4 flex flex-col gap-1 border-t border-gray-200 pt-3 dark:border-gray-800">

          <li>

            <DropdownItem
              onItemClick={
                closeDropdown
              }
              tag="a"
              to="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >

              <MenuIcon
                name="user-circle"
                className="size-5"
              />

              Edit Profile

            </DropdownItem>

          </li>


          <li>

            <DropdownItem
              onItemClick={
                closeDropdown
              }
              tag="a"
              to="/documentation"
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >

              <MenuIcon
                name="docs"
                className="size-5"
              />

              API Documentation

            </DropdownItem>

          </li>

        </ul>


        <button
          type="button"
          onClick={
            handleSignOut
          }
          className="mt-3 flex items-center gap-3 rounded-lg border-t border-gray-200 px-3 pt-3 pb-2 font-medium text-gray-700 group text-theme-sm hover:text-error-500 dark:border-gray-800 dark:text-gray-400 dark:hover:text-error-400"
        >

          <MenuIcon
            name="arrow-right"
            className="size-5"
          />

          Sign out

        </button>

      </Dropdown>

    </div>
  );
}