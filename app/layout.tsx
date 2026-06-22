import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "./providers";
import { AutoUpdater } from "@/components/AutoUpdater";

// Auto-recuperação: quando um arquivo de código (chunk) falha ao carregar —
// internet instável OU página antiga aberta depois de um deploy novo — o app
// recarrega sozinho UMA vez para buscar a versão atual, em vez de tela branca.
// Registrado bem cedo (antes dos scripts do Next) para pegar até a falha inicial.
const CHUNK_RECOVERY = `(function(){
  var KEY='np-chunk-reload';
  function isChunkErr(m){return /Loading chunk|ChunkLoadError|Loading CSS chunk|dynamically imported module|Importing a module script failed|error loading dynamically imported|Failed to fetch/i.test(m||'');}
  function recover(m){
    if(!isChunkErr(m))return;
    try{var last=+sessionStorage.getItem(KEY)||0;if(Date.now()-last<15000)return;sessionStorage.setItem(KEY,String(Date.now()));}catch(e){}
    location.reload();
  }
  window.addEventListener('error',function(e){
    var t=e&&e.target;
    if(t&&(t.tagName==='SCRIPT'||t.tagName==='LINK')){recover((t.src||t.href||'')+' chunk load error');return;}
    recover((e&&e.message)||(e&&e.error&&e.error.message)||'');
  },true);
  window.addEventListener('unhandledrejection',function(e){
    var r=e&&e.reason;recover((r&&r.message)||(typeof r==='string'?r:''));
  });
})();`;

export const metadata: Metadata = {
  title: "NeuroPeak - Treino Cognitivo",
  description: "Plataforma clínica de reabilitação e treinamento cognitivo para neuropsicólogos",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NeuroPeak",
  },
};

export const viewport: Viewport = {
  themeColor: "#07162D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: CHUNK_RECOVERY }} />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <AutoUpdater />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
