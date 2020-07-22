import { NavigationDescriptor } from "./navigation_descriptor";

export interface NavigationHandler {
  pathname: string;
  show: (params?: any) => Promise<void> | void;
  hide: () => void;
}

export interface SubNavigationHandlerTyped<Params> {
  show: (params: Params) => Promise<void> | void;
  hide: () => void;
}

export class NavigationHandlerTyped<Params> implements NavigationHandler {
  public pathname = this.descriptor.pathname;

  public constructor(
    private descriptor: NavigationDescriptor<Params>,
    private subHandlerTyped: SubNavigationHandlerTyped<Params>
  ) {}

  public async show(params?: any): Promise<void> {
    let paramsTyped = this.descriptor.paramsUtil.from(params);
    await this.subHandlerTyped.show(paramsTyped);
  }

  public hide(): void {
    this.subHandlerTyped.hide();
  }
}
