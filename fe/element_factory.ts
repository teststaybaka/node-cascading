import { Ref, assignRef } from "../ref";

class ElementFactory {
  private static appendChildren(parent: Node, childNodes: Node[]): Node {
    for (let childNode of childNodes) {
      parent.appendChild(childNode);
    }
    return parent;
  }

  public div(attributeStr: string, ...childNodes: Node[]): HTMLDivElement {
    let ele = document.createElement("template");
    ele.innerHTML = `<div ${attributeStr}></div>`;
    return ElementFactory.appendChildren(
      ele.content.firstElementChild,
      childNodes
    ) as HTMLDivElement;
  }

  public divRef(
    ref: Ref<HTMLDivElement>,
    attributeStr: string,
    ...childNodes: Node[]
  ): HTMLDivElement {
    return assignRef(ref, this.div(attributeStr, ...childNodes));
  }

  public text(content: string): Text {
    return document.createTextNode(content);
  }

  public textRef(ref: Ref<Text>, content: string): Text {
    return assignRef(ref, this.text(content));
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

  public button(
    attributeStr: string,
    ...childElements: Element[]
  ): HTMLButtonElement {
    let ele = document.createElement("template");
    ele.innerHTML = `<button ${attributeStr}/>`;
    return ElementFactory.appendChildren(
      ele.content.firstElementChild,
      childElements
    ) as HTMLButtonElement;
  }

  public buttonRef(
    ref: Ref<HTMLButtonElement>,
    attributeStr: string,
    ...childElements: Element[]
  ): HTMLButtonElement {
    return assignRef(ref, this.button(attributeStr, ...childElements));
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
