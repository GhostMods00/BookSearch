/// <reference types="vite/client" />

declare module 'react-dom/client' {
    import { ReactNode } from 'react';
    
    export interface Root {
      render(children: ReactNode): void;
      unmount(): void;
    }
  
    export function createRoot(container: Element | null): Root;
  }