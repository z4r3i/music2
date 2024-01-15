export class List {

	public items: string[] = [];

	public constructor(ids: string[] = []) {
		this.items = ids;
	}

	public getPage(page: number = 0) {
		let start = page * 100;
		return this.items.slice(start, start + 100);
	}

	public get(index: number): string | null {
		return this.items[index] ?? null;
	}

	public size() {
		return this.items.length;
	}

	public shuffle() {
		let i = this.items.length;
		let index;
		while (i--) {
			index = Math.floor((i + 1) * Math.random());
			[this.items[i], this.items[index]] = [this.items[index], this.items[i]];
		}
		return this;
	}

	public random(count: number = 1) {
		this.shuffle();
		this.items = this.items.slice(0, count);
		return this;
	}

	public replace(items: string[]) {
		this.items = items;
	}

	public clear() {
		this.replace([]);
	}

	public add(id: string, mode: ListAddMode = 0): number {
		if (mode) {
			this.items.push(id);
			return this.items.length - 1;
		} else {
			this.items.unshift(id);
			return 0;
		}
	}

	public addMulti(ids: string[], mode: ListAddMode = 0) {
		ids.forEach(id => this.add(id, mode));
	}

	public remove(id: string) {
		let i = this.items.indexOf(id);
		if (i != -1) this.items.splice(i, 1);
	}

	public toggle(id: string) {
		this.has(id) ? this.remove(id) : this.add(id);
	}

	public has(id: string) {
		return this.index(id) != -1;
	}

	public index(id: string) {
		return this.items.indexOf(id);
	}

	public clone(): List {
		return new List([...this.items]);
	}

}

export class SavedList extends List {

	public name: string;
	private static loaded: {[U: string]: SavedList} = {};

	private constructor(name: string, ids: string[] = []) {
		super(ids);
		this.name = name;
		SavedList.loaded[name] = this;
	}

	public save() {
		localStorage.setItem(`list_${this.name}`, this.items.join(","));
	}

	public static load(name: string): SavedList {
		if (this.loaded[name]) return this.loaded[name];
		let ids = localStorage.getItem(`list_${name}`);
		return new SavedList(name, ids ? ids.split(",") : []);
	}

}

export enum ListAddMode {
	Prepend = 0,
	Before = 0,
	Append = 1,
	After = 1
}