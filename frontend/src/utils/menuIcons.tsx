import type {
  ComponentType,
  SVGProps,
} from "react";


const ICON_NAMES = [
  "alert",
  "alert-hexa",
  "angle-down",
  "angle-left",
  "angle-right",
  "angle-up",
  "arrow-down",
  "arrow-right",
  "arrow-up",
  "audio",
  "bolt",
  "box",
  "box-cube",
  "box-line",
  "calendar",
  "calender-line",
  "chat",
  "check-circle",
  "check-line",
  "chevron-down",
  "chevron-left",
  "chevron-up",
  "close",
  "close-line",
  "copy",
  "docs",
  "dollar-line",
  "download",
  "envelope",
  "eye",
  "eye-close",
  "file",
  "folder",
  "grid",
  "group",
  "horizontal-dots",
  "info",
  "info-error",
  "info-hexa",
  "list",
  "lock",
  "mail-line",
  "moredot",
  "page",
  "paper-plane",
  "pencil",
  "pie-chart",
  "plug-in",
  "plus",
  "shooting-star",
  "table",
  "task-icon",
  "time",
  "trash",
  "user-circle",
  "user-line",
  "videos",
] as const;


const LEGACY_ICON_MAP: Record<string, string> = {
  GridIcon: "grid",
  ListIcon: "list",
  PageIcon: "page",
  UserCircleIcon: "user-circle",
  TableIcon: "table",
  BoxCubeIcon: "box-cube",
  CalenderIcon: "calender-line",
  PieChartIcon: "pie-chart",
  PlugInIcon: "plug-in",
};


type IconComponent =
  ComponentType<
    SVGProps<SVGSVGElement>
  >;


type IconModule = {
  ReactComponent: IconComponent;
};


const ICON_MODULES = import.meta.glob(
  "../icons/*.svg.tsx",
  {
    eager: true,
  }
) as Record<
  string,
  IconModule
>;


/*
|--------------------------------------------------------------------------
| FORMAT LABEL
|--------------------------------------------------------------------------
*/

const formatLabel = (
  value: string
): string => {
  return value
    .split("-")
    .map((word) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
};


/*
|--------------------------------------------------------------------------
| MENU ICON OPTIONS
|--------------------------------------------------------------------------
*/

export const MENU_ICON_OPTIONS =
  ICON_NAMES.map((name) => ({
    value: name,
    label: formatLabel(name),
  }));


/*
|--------------------------------------------------------------------------
| RESOLVE ICON NAME
|--------------------------------------------------------------------------
*/

const resolveIconName = (
  name: string | null | undefined
): string | null => {
  if (!name) {
    return null;
  }

  if (LEGACY_ICON_MAP[name]) {
    return LEGACY_ICON_MAP[name];
  }

  return name;
};


/*
|--------------------------------------------------------------------------
| GET ICON LABEL
|--------------------------------------------------------------------------
*/

export const getMenuIconLabel = (
  name: string | null | undefined
): string => {
  const resolved =
    resolveIconName(name);

  if (!resolved) {
    return "Tanpa Icon";
  }

  return formatLabel(resolved);
};


/*
|--------------------------------------------------------------------------
| GET ICON COMPONENT
|--------------------------------------------------------------------------
*/

const getIconComponent = (
  name: string | null | undefined
): IconComponent | null => {
  const resolved =
    resolveIconName(name);

  if (!resolved) {
    return null;
  }

  const module =
    ICON_MODULES[
      `../icons/${resolved}.svg.tsx`
    ];

  if (!module) {
    return null;
  }

  return module.ReactComponent;
};


/*
|--------------------------------------------------------------------------
| MENU ICON
|--------------------------------------------------------------------------
*/

export function MenuIcon({
  name,
  className = "size-5",
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Icon =
    getIconComponent(name);

  if (!Icon) {
    return null;
  }

  return (
    <Icon
      className={`${className} fill-current`}
    />
  );
}