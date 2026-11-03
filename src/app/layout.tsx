import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata:Metadata={
 title:"Auto Car Serviços Viseu | Oficina automóvel",
 description:"Mecânica geral, diagnóstico e manutenção automóvel em Viseu. Consulte serviços, peça uma estimativa ou solicite uma marcação.",
 metadataBase:new URL(process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"),
 openGraph:{title:"Auto Car Serviços Viseu",description:"O seu carro em boas mãos. Solicite uma marcação ou orçamento.",type:"website"}
};
export default function RootLayout({children}:{children:ReactNode}) {
 return <html lang="pt-PT"><body>{children}</body></html>;
}