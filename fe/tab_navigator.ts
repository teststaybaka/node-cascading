import { NamedTypeDescriptor } from "../named_type_descriptor";
import { parseNamedType } from "../named_type_util";

export interface TabDescriptor<Params> {
  name: string;
  paramsDescriptor?: NamedTypeDescriptor<Params>;
}

export interface TabContainer<Params> {
  tabDescriptor: TabDescriptor<Params>;
  show: (params?: Params) => Promise<void> | void;
  hide: () => Promise<void> | void;
}

export class TabNavigator {
  private lastShownTab: TabContainer<any>;
  private tabContainers: TabContainer<any>[] = [];

  public addTabs(...tabs: TabContainer<any>[]): this {
    this.tabContainers.push(...tabs);
    return this;
  }

  public async showByName(name: string, params?: any): Promise<void> {
    await this.show(name, (paramsDescriptor) =>
      parseNamedType(params, paramsDescriptor)
    );
  }

  public async showByDescriptor<Params>(
    tabDescriptor: TabDescriptor<Params>,
    params?: Params
  ): Promise<void> {
    await this.show(tabDescriptor.name, () => params);
  }

  private async show<Params>(
    name: string,
    getParams?: (paramsDescriptor: NamedTypeDescriptor<Params>) => Params
  ): Promise<void> {
    for (let tabContainer of this.tabContainers) {
      if (tabContainer.tabDescriptor.name === name) {
        await Promise.all([
          this.lastShownTab.hide(),
          tabContainer.show(
            getParams(tabContainer.tabDescriptor.paramsDescriptor)
          ),
        ]);
        this.lastShownTab = tabContainer;
        break;
      }
    }
  }
}
