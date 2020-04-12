// Use abbreviation only to boost productivity.
class ElementFactory {
  private static appendChildren(parent: Element, childElements: Element[]): Element {
    for (let childElement of childElements) {
      parent.appendChild(childElement);
    }
    return parent;
  }

  public div(attributeStr: string, ...childElements: HTMLElement[]): HTMLDivElement {
    let ele = document.createElement('template');
    ele.innerHTML = `<div ${attributeStr}></div>`;
    return ElementFactory.appendChildren(ele.content.firstElementChild, childElements) as HTMLDivElement;
  }

  public image(attributeStr: string): HTMLImageElement {
    let ele = document.createElement('template');
    ele.innerHTML = `<img ${attributeStr}/>`;
    return ele.content.firstElementChild as HTMLImageElement;
  }

  public input(attributeStr: string): HTMLInputElement {
    let ele = document.createElement('template');
    ele.innerHTML = `<input ${attributeStr}/>`;
    return ele.content.firstElementChild as HTMLInputElement;
  }

  public button(attributeStr: string): HTMLButtonElement {
    let ele = document.createElement('template');
    ele.innerHTML = `<button ${attributeStr}/>`;
    return ele.content.firstElementChild as HTMLButtonElement;
  }

  public anchor(attributeStr: string): HTMLAnchorElement {
    let ele = document.createElement('template');
    ele.innerHTML = `<a ${attributeStr}/>`;
    return ele.content.firstElementChild as HTMLAnchorElement;
  }

  public svg(attributeStr: string, svgPath: SVGPathElement): SVGSVGElement {
    let ele = document.createElement('template');
    ele.innerHTML = `<svg ${attributeStr}></svg>`;
    return ElementFactory.appendChildren(ele.content.firstElementChild, [svgPath]) as SVGSVGElement;
  }

  public path(attributeStr: string): SVGPathElement {
    let ele = document.createElement('template');
    ele.innerHTML = `<path ${attributeStr}/>`;
    return ele.content.firstElementChild as SVGPathElement;
  }
}

export let E = new ElementFactory();
