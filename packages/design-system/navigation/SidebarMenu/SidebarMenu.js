import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./SidebarMenu.css";
export const SidebarMenu = ({ items, onNavigate }) => {
    return (_jsx("nav", { className: "jarvis-sidebar-menu", children: _jsx("ul", { className: "jarvis-menu-list", children: items.map((item) => (_jsxs("li", { className: "jarvis-menu-item", onClick: () => onNavigate(item.path), children: [item.icon && (_jsx("span", { className: "jarvis-menu-icon", children: item.icon })), _jsx("span", { className: "jarvis-menu-label", children: item.label })] }, item.path))) }) }));
};
