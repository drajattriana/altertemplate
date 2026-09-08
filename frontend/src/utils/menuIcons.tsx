import {
  BoxCubeIcon,
  CalenderIcon,
  GridIcon,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";


export const MENU_ICON_OPTIONS = [
  {
    value: "GridIcon",
    label: "Grid",
  },
  {
    value: "ListIcon",
    label: "List",
  },
  {
    value: "PageIcon",
    label: "Page",
  },
  {
    value: "UserCircleIcon",
    label: "User Circle",
  },
  {
    value: "TableIcon",
    label: "Table",
  },
  {
    value: "BoxCubeIcon",
    label: "Box Cube",
  },
  {
    value: "CalenderIcon",
    label: "Calendar",
  },
  {
    value: "PieChartIcon",
    label: "Pie Chart",
  },
  {
    value: "PlugInIcon",
    label: "Plugin",
  },
] as const;


type MenuIconProps = {
  name?: string | null;
  className?: string;
};


export function MenuIcon({
  name,
  className = "size-5",
}: MenuIconProps) {
  switch (name) {
    case "GridIcon":
      return <GridIcon className={className} />;

    case "ListIcon":
      return <ListIcon className={className} />;

    case "PageIcon":
      return <PageIcon className={className} />;

    case "UserCircleIcon":
      return <UserCircleIcon className={className} />;

    case "TableIcon":
      return <TableIcon className={className} />;

    case "BoxCubeIcon":
      return <BoxCubeIcon className={className} />;

    case "CalenderIcon":
      return <CalenderIcon className={className} />;

    case "PieChartIcon":
      return <PieChartIcon className={className} />;

    case "PlugInIcon":
      return <PlugInIcon className={className} />;

    default:
      return null;
  }
}