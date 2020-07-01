export class Cacher<T> {
    private expires = 0;
    private data: T | null = null;

    constructor(private source: () => Promise<T> | T, private expiryTime: number) { }

    async get(): Promise<T> {
        if (this.expires > Date.now() && this.data != null) {
            return this.data;
        }

        const data = await this.source();
        this.expires = Date.now() + this.expiryTime;
        this.data = data;
        return data;
    }
}