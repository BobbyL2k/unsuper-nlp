export class Slicer {
    constructor(public start: number, public size: number) {
    }
    public slice<T>(array: T[]) {
        const realStartIndex = Math.min(this.start, array.length - 1);
        const realEndIndex = Math.min(this.start + this.size, array.length);
        return array.slice(realStartIndex, realEndIndex);
    }
}
