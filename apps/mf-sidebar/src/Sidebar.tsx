import { HceSidebar, type OpcionMAC } from "@hce/design-system";

interface SidebarProps {
    multiLevel?:     boolean,
    collapsed?:      boolean,
    onToggle?:       () => void,
    opciones?:       OpcionMAC[],
    currentPath?:    string,
    onNavigate?:     (vista: any) => void,
    onHome?:         () => void,
    labelHome?:      string,
    titleOptions?:   string
}

export default function Sidebar({
multiLevel = false,
collapsed = false,
onToggle,
opciones,
currentPath,
onNavigate,
onHome,
labelHome,
titleOptions
}:SidebarProps){
    return(
        <HceSidebar
            floating
            multiLevel={multiLevel}
            collapsed={collapsed}
            onToggle={onToggle ?? (() => {})}
            opciones={opciones}
            currentPath={currentPath}
            onNavigate={onNavigate ?? (() => {})}
            onHome={onHome}
            labelHome={labelHome}
            titleOptions={titleOptions}
        />
    )
}