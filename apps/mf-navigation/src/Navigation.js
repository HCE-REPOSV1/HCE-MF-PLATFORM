import { jsx as _jsx } from "react/jsx-runtime";
import { SidebarMenu } from "@design-system/navigation/SidebarMenu";
const menuItems = [
    {
        label: "Monitor Emergencia",
        path: "/home"
    },
    {
        label: "Pacientes",
        path: "/patients"
    },
    {
        label: "Reportes",
        path: "/reports"
    },
    {
        label: "Configuración",
        path: "/settings"
    }
];
export default function Navigation({ onNavigate }) {
    return (_jsx(SidebarMenu, { items: menuItems, onNavigate: onNavigate }));
}
