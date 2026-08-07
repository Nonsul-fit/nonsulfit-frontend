export {};

declare global {
  interface Window {
    Supademo?: {
      open: (demoId: string) => void;
    };
  }
}
