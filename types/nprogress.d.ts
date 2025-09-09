declare module "nprogress" {
  export interface NProgressOptions {
    minimum?: number;
    easing?: string;
    speed?: number;
    trickle?: boolean;
    trickleSpeed?: number;
    showSpinner?: boolean;
    parent?: string;
    template?: string;
  }

  export interface NProgressStatic {
    configure(options: NProgressOptions): NProgressStatic;
    start(): NProgressStatic;
    done(force?: boolean): NProgressStatic;
    set(n: number): NProgressStatic;
    inc(amount?: number): NProgressStatic;
    remove(): void;
    isStarted(): boolean | null;
    status?: number | null;
  }

  const NProgress: NProgressStatic;
  export default NProgress;
}
