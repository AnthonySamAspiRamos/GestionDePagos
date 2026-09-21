/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // agrega aquí más variables VITE_* si las tienes
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css';