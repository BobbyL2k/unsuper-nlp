type PAEventListener<T> = (array: T[]) => void;

export class PartialArray<T> {
    private eventListeners: Array<PAEventListener<T>> = [];
    constructor(private originalInternalArray: T[], private start: number, private size: number) {
    }
    public onUpdate(eventListener: (array: T[]) => void) {
        this.eventListeners.push(eventListener);
        eventListener(this.getSubArray());
    }
    public updateArray(array: T[]) {
        this.originalInternalArray = array;
    }
    get originalArray(): T[] {
        return this.originalInternalArray;
    }
    public setStart(start: number) {
        this.start = start;
        this.updateAllEventListeners();
    }
    public getStart(): number {
        return this.start;
    }
    public setSize(size: number) {
        this.size = size;
        this.updateAllEventListeners();
    }
    public getSize(): number {
        return this.size;
    }
    private updateAllEventListeners() {
        const subArray = this.getSubArray();
        for (const eventListener of this.eventListeners) {
            eventListener(subArray);
        }
    }
    private getSubArray() {
        const realStartIndex = Math.min(this.start, this.originalInternalArray.length - 1);
        const realEndIndex = Math.min(this.start + this.size, this.originalArray.length - 1);
        return this.originalArray.slice(realStartIndex, realEndIndex);
    }
}
