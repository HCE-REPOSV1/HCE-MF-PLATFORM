import { jsx as _jsx } from "react/jsx-runtime";
/**
 * App del microfrontend navigation
 * (modo standalone para desarrollo)
 */
import Navigation from "./Navigation";
export default function App() {
    const handleNavigate = (path) => {
        console.log("navigate to:", path);
    };
    return (_jsx(Navigation, { onNavigate: handleNavigate }));
}
