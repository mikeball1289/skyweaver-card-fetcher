declare module 'node-html-to-image' {
    export interface RenderOptions {
        output?: string;
        html: string
        type?: 'jpeg' | 'png';
        quality?: number;
        content?: any;
        waitUntil?: string | Array<string>;
        puppeteerArgs?: any;
        transparent?: boolean;
        encoding?: 'binary' | 'default';
    }

    function render(options: RenderOptions): Promise<void>;

    export default render;
}