import { Ref } from "./ref";

class ElementFactory {
  private static appendChildren(
    parent: Element,
    childElements: Element[]
  ): Element {
    for (let childElement of childElements) {
      parent.appendChild(childElement);
    }
    return parent;
  }

  public div(
    attributeStr: string,
    ...childElements: HTMLElement[]
  ): HTMLDivElement {
    let ele = document.createElement("template");
    ele.innerHTML = `<div ${attributeStr}></div>`;
    return ElementFactory.appendChildren(
      ele.content.firstElementChild,
      childElements
    ) as HTMLDivElement;
  }

  public divRef(
    ref: Ref<HTMLDivElement>,
    attributeStr: string,
    ...childElements: HTMLElement[]
  ): HTMLDivElement {
    ref.value = this.div(attributeStr, ...childElements);
    return ref.value;
  }

  public image(attributeStr: string): HTMLImageElement {
    let ele = document.createElement("template");
    ele.innerHTML = `<img ${attributeStr}/>`;
    return ele.content.firstElementChild as HTMLImageElement;
  }

  public imageRef(
    ref: Ref<HTMLImageElement>,
    attributeStr: string
  ): HTMLImageElement {
    ref.value = this.image(attributeStr);
    return ref.value;
  }

  public input(attributeStr: string): HTMLInputElement {
    let ele = document.createElement("template");
    ele.innerHTML = `<input ${attributeStr}/>`;
    return ele.content.firstElementChild as HTMLInputElement;
  }

  public inputRef(
    ref: Ref<HTMLInputElement>,
    attributeStr: string
  ): HTMLInputElement {
    ref.value = this.input(attributeStr);
    return ref.value;
  }

  public button(attributeStr: string): HTMLButtonElement {
    let ele = document.createElement("template");
    ele.innerHTML = `<button ${attributeStr}/>`;
    return ele.content.firstElementChild as HTMLButtonElement;
  }

  public buttonRef(
    ref: Ref<HTMLButtonElement>,
    attributeStr: string
  ): HTMLButtonElement {
    ref.value = this.button(attributeStr);
    return ref.value;
  }

  public a(attributeStr: string): HTMLAnchorElement {
    let ele = document.createElement("template");
    ele.innerHTML = `<a ${attributeStr}/>`;
    return ele.content.firstElementChild as HTMLAnchorElement;
  }

  public aRef(
    ref: Ref<HTMLAnchorElement>,
    attributeStr: string
  ): HTMLAnchorElement {
    ref.value = this.a(attributeStr);
    return ref.value;
  }

  public svg(attributeStr: string, svgPath: SVGPathElement): SVGSVGElement {
    let ele = document.createElement("template");
    ele.innerHTML = `<svg ${attributeStr}></svg>`;
    return ElementFactory.appendChildren(ele.content.firstElementChild, [
      svgPath,
    ]) as SVGSVGElement;
  }

  public svgRef(
    ref: Ref<SVGSVGElement>,
    attributeStr: string,
    svgPath: SVGPathElement
  ): SVGSVGElement {
    ref.value = this.svg(attributeStr, svgPath);
    return ref.value;
  }

  public path(attributeStr: string): SVGPathElement {
    let ele = document.createElement("template");
    ele.innerHTML = `<path ${attributeStr}/>`;
    return ele.content.firstElementChild as SVGPathElement;
  }

  public pathRef(
    ref: Ref<SVGPathElement>,
    attributeStr: string
  ): SVGPathElement {
    ref.value = this.path(attributeStr);
    return ref.value;
  }
}

// Use abbreviation only to boost productivity.
export let E = new ElementFactory();
