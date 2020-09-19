import { Ref, assignRef } from "../ref";

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
    return assignRef(ref, this.div(attributeStr, ...childElements));
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
    return assignRef(ref, this.image(attributeStr));
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
    return assignRef(ref, this.input(attributeStr));
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
    return assignRef(ref, this.button(attributeStr));
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
    return assignRef(ref, this.a(attributeStr));
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
    return assignRef(ref, this.svg(attributeStr, svgPath));
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
    return assignRef(ref, this.path(attributeStr));
  }
}

// Use abbreviation only to boost productivity.
export let E = new ElementFactory();
