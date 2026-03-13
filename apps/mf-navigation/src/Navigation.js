import { jsx as _jsx } from "react/jsx-runtime";
import { SidebarMenu } from "@design-system/navigation/SidebarMenu";
import { Monitor, Users, BarChart, Settings } from "lucide-react";
const menuItems = [
    {
        label: "Monitor Emergencia",
        path: "/home",
        icon: _jsx(Monitor, { size: 18 })
    },
    {
        label: "Pacientes",
        path: "/patients",
        icon: _jsx(Users, { size: 18 })
    },
    {
        label: "Reportes",
        path: "/reports",
        icon: _jsx(BarChart, { size: 18 })
    },
    {
        label: "Configuración",
        path: "/settings",
        icon: _jsx(Settings, { size: 18 })
    }
];
export default function Navigation({ onNavigate, collapsed }) {
    return (_jsx(SidebarMenu, { items: menuItems, collapsed: collapsed, onNavigate: onNavigate }));
}
