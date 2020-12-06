import { parseMessage } from "../message_util";
import { NavigationDescriptor } from "./navigation_descriptor";

export interface NavigationHandlerUntyped {
  pathname: string;
  show: (params?: any) => Promise<void> | void;
  hide: () => void;
}

export interface SubNavigationHandler<Params> {
  show: (params?: Params) => Promise<void> | void;
  hide: () => void;
}

export class NavigationHandler<Params> implements NavigationHandlerUntyped {
  public pathname = this.navigationDescriptor.pathname;

  public constructor(
    private navigationDescriptor: NavigationDescriptor<Params>,
    private subHandler: SubNavigationHandler<Params>
  ) {}

  public async show(params?: any): Promise<void> {
    let paramsTyped = parseMessage(
      params,
      this.navigationDescriptor.paramsDescriptor
    );
    await this.subHandler.show(paramsTyped);
  }

  public hide(): void {
    this.subHandler.hide();
  }
}
