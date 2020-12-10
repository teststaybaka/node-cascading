import { MessageDescriptor } from "../message_descriptor";
import { parseMessage } from "../message_util";
import { Observable } from "../observable";

export class BrowsingHistory<T extends Observable> {
  private static URL_PARAM_KEY = "q";

  public constructor(
    private rootObservable: T,
    private observableDescriptor: MessageDescriptor<T>,
    private window: Window
  ) {}

  public static create<T extends Observable>(
    rootObservable: T,
    observableDescriptor: MessageDescriptor<T>
  ): BrowsingHistory<T> {
    let browsingHistory = new BrowsingHistory(
      rootObservable,
      observableDescriptor,
      window
    );
    window.onpopstate = () => browsingHistory.pop();
    return browsingHistory;
  }

  public push(): void {
    // Get the current url params for better compatibility with other libs if
    // they persist some params through url.
    let urlParams = new URLSearchParams(this.window.location.search);
    urlParams.set(
      BrowsingHistory.URL_PARAM_KEY,
      JSON.stringify(this.rootObservable)
    );
    let url = this.window.location.pathname + "?" + urlParams.toString();
    this.window.history.pushState(undefined, "", url);
  }

  private pop(): void {
    let urlParams = new URLSearchParams(this.window.location.search);
    let rawParam = JSON.parse(urlParams.get(BrowsingHistory.URL_PARAM_KEY));
    parseMessage(rawParam, this.observableDescriptor, this.rootObservable);
  }
}
