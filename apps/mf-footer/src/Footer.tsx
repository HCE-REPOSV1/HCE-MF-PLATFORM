import {  Footer as HceFooter } from "@hce/design-system";
export default function Footer(){
     const copyright = `© ${new Date().getFullYear()} Clínica San Felipe · Todos los derechos reservados · Sistema HCE v2.0`;
    return(
        <HceFooter copyright={copyright} />
    )
}