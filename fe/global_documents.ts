class GlobalDcouments {
  public constructor(private documents: Document[]) {}

  public hideWhenMousedown(hide: (event: Event) => void): void {
    for (let document of this.documents) {
      document.addEventListener("mousedown", hide);
    }
  }
}
