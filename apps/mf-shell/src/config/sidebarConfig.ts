import type { OpcionMAC } from "@hce/design-system";
import { useTranslation } from "@hce/i18n-core";
import { useEffect, useMemo } from "react";
import { registerShellNamespace } from "../i18n";

type SidebarItem = {
  idMenu: number;
  titulo: string;
  vista: string;
  icono: string;
  permission: string;
  children?: SidebarItem[];
};

function toOpcionMAC(
  item: SidebarItem,
  parentId: number,
  hasPermission: (c: string) => boolean
): OpcionMAC | null {
  const visibleChildren = (item.children ?? [])
    .map((c) => toOpcionMAC(c, item.idMenu, hasPermission))
    .filter((c): c is OpcionMAC => c !== null);

  if (!item.children && !hasPermission(item.permission)) return null;
  if (item.children && (!hasPermission(item.permission) || visibleChildren.length === 0)) return null;

  return {
    idMenu: item.idMenu,
    titulo: item.titulo,
    idMenuPadre: parentId,
    vista: item.vista,
    icono: item.icono,
    codigo: item.permission,
    indicador: "E",
    opciones: visibleChildren,
  };
}

export function useSidebarOpciones(
  hasPermission: (codigo: string) => boolean
): OpcionMAC[] {
  const { t } = useTranslation("shell");

  useEffect(() => {
    registerShellNamespace();
  }, []);

  return useMemo(() => {
    const SIDEBAR_TREE: SidebarItem[] = [
      {
        idMenu: 7777,
        titulo: t("sidebarOptions.title"),
        vista: "",
        icono: "HceMenuIcon",
        permission: "hce:root",
        children: [
          { idMenu: 7778, titulo: t("sidebarOptions.optEmergency"), vista: "/home/emergencia", icono: "", permission: "emergency:module" },
          { idMenu: 7779, titulo: t("sidebarOptions.optAmbulatory"), vista: "/home/ambulatorio", icono: "", permission: "ambulatorio:module" },
          { idMenu: 7780, titulo: t("sidebarOptions.optHospital"), vista: "/home/hospital", icono: "", permission: "hospital:module" },
          { idMenu: 7781, titulo: t("sidebarOptions.optAudit"), vista: "/home/auditoria", icono: "", permission: "auditoria:module" },
        ],
      },
    ];

    return SIDEBAR_TREE
      .map((item) => toOpcionMAC(item, 0, hasPermission))
      .filter((item): item is OpcionMAC => item !== null);
  }, [t, hasPermission]);
}