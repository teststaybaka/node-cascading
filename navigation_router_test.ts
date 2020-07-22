import { NavigationHandler } from "./navigation_handler";
import { NavigationRouter } from "./navigation_router";
import { TestCase, assert, runTests } from "./test_base";

class MockNavigationHandler implements NavigationHandler {
  public constructor(
    public pathname: string,
    public show: (params?: any) => Promise<void> | void,
    public hide: () => void
  ) {}
}

async function testMatchCurrentUrl(
  currentPathname: string,
  expectedHandledByPath1: boolean,
  expectedHandledByPath2: boolean
) {
  // Prepare
  let navigationRouter = new NavigationRouter({
    location: { pathname: currentPathname, search: "" },
  } as any);

  let handled1 = false;
  navigationRouter.addHandler(
    new MockNavigationHandler(
      "/path1",
      (params) => {
        handled1 = true;
      },
      undefined
    )
  );
  let handled2 = false;
  navigationRouter.addHandler(
    new MockNavigationHandler(
      "/path2",
      (params) => {
        handled2 = true;
      },
      undefined
    )
  );

  // Execute
  await navigationRouter.dispatchFromCurrentUrl();

  // verify
  assert(handled1 === expectedHandledByPath1);
  assert(handled2 === expectedHandledByPath2);
}

class DispatchFromCurrentUrlMatched implements TestCase {
  public name = "DispatchFromCurrentUrlMatched";

  public async execute() {
    await testMatchCurrentUrl("/path1", true, false);
  }
}

class DispatchFromCurrentUrlNoMatch implements TestCase {
  public name = "DispatchFromCurrentUrlNoMatch";

  public async execute() {
    await testMatchCurrentUrl("/path", false, false);
  }
}

async function testParsingParamsFromQueryString(queryString: string) {
  // Prepare
  let navigationRouter = new NavigationRouter({
    location: { pathname: "/path", search: queryString },
  } as any);

  let paramsCaptured: any;
  navigationRouter.addHandler(
    new MockNavigationHandler(
      "/path",
      (params) => {
        paramsCaptured = params;
      },
      undefined
    )
  );

  // Execute
  await navigationRouter.dispatchFromCurrentUrl();

  // Verify
  return paramsCaptured;
}

class DispatchFromCurrentUrlWithoutParams implements TestCase {
  public name = "DispatchForTheFirstTimeWithoutParams";

  public async execute() {
    let params = await testParsingParamsFromQueryString("");

    // Verify
    assert(params === undefined);
  }
}

class DispatchFromCurrentUrlWithEmptyParams implements TestCase {
  public name = "DispatchFromCurrentUrlWithEmptyParams";

  public async execute() {
    let params = await testParsingParamsFromQueryString("?params=");

    // Verify
    assert(params === undefined);
  }
}

class DispatchFromCurrentUrlWithInvalidParams implements TestCase {
  public name = "DispatchFromCurrentUrlWithInvalidParams";

  public async execute() {
    let params = await testParsingParamsFromQueryString("?params=xsdfj");

    // Verify
    assert(params === undefined);
  }
}

class DispatchFromCurrentUrlWithValidParams implements TestCase {
  public name = "DispatchFromCurrentUrlWithValidParams";

  public async execute() {
    let params = await testParsingParamsFromQueryString(
      "?params=%7B%22a%22%3A10%2C%22b%22%3A%2210%22%7D"
    );

    // Verify
    assert(params.a === 10);
    assert(params.b === "10");
  }
}

async function testMatchFromPathname(
  pathname: string,
  expectedHandledByPath1: boolean,
  expectedHandledByPath2: boolean,
  expectedReloaded: boolean
) {
  // Prepare
  let reloaded = false;
  let navigationRouter = new NavigationRouter({
    history: { pushState: () => {} },
    location: {
      reload: () => {
        reloaded = true;
      },
    },
  } as any);

  let handled1 = false;
  navigationRouter.addHandler(
    new MockNavigationHandler(
      "/path1",
      (params) => {
        handled1 = true;
      },
      undefined
    )
  );
  let handled2 = false;
  navigationRouter.addHandler(
    new MockNavigationHandler(
      "/path2",
      (params) => {
        handled2 = true;
      },
      undefined
    )
  );

  // Execute
  await navigationRouter.dispatch(pathname);

  // Verify
  assert(handled1 === expectedHandledByPath1);
  assert(handled2 === expectedHandledByPath2);
  assert(reloaded === expectedReloaded);
}

class DispatchMatched implements TestCase {
  public name = "DispatchMatched";

  public async execute() {
    await testMatchFromPathname("/path1", true, false, false);
  }
}

class DispatchNoMatch implements TestCase {
  public name = "DispatchNoMatch";

  public async execute() {
    await testMatchFromPathname("/path", false, false, true);
  }
}

class DispatchTwiceToHidePreviousHandler implements TestCase {
  public name = "DispatchTwiceToHidePreviousHandler";

  public async execute() {
    // Prepare
    let navigationRouter = new NavigationRouter({
      history: { pushState: () => {} },
    } as any);

    let hidden1 = false;
    navigationRouter.addHandler(
      new MockNavigationHandler(
        "/path1",
        (params) => {},
        () => {
          hidden1 = true;
        }
      )
    );
    let hidden2 = false;
    navigationRouter.addHandler(
      new MockNavigationHandler(
        "/path2",
        (params) => {},
        () => {
          hidden2 = true;
        }
      )
    );
    await navigationRouter.dispatch("/path1");

    // Execute
    await navigationRouter.dispatch("/path2");

    // Verify
    assert(hidden1);
    assert(!hidden2);
  }
}

class DispatchPushHistoryWithoutParams implements TestCase {
  public name = "DispatchPushHistoryWithoutParams";

  public async execute() {
    // Prepare
    let urlCaptured: string;
    let navigationRouter = new NavigationRouter({
      history: {
        pushState: (unused1: any, unused2: any, url: string) => {
          urlCaptured = url;
        },
      },
      location: {
        reload: () => {},
      },
    } as any);

    // Execute
    await navigationRouter.dispatch("/path");

    // Verify
    assert(urlCaptured === "/path");
  }
}

class DispatchPushHistoryWithParams implements TestCase {
  public name = "DispatchPushHistoryWithParams";

  public async execute() {
    // Prepare
    let urlCaptured: string;
    let navigationRouter = new NavigationRouter({
      history: {
        pushState: (unused1: any, unused2: any, url: string) => {
          urlCaptured = url;
        },
      },
      location: {
        reload: () => {},
      },
    } as any);

    // Execute
    await navigationRouter.dispatch("/path", { a: 10, b: "10" });

    // Verify
    assert(
      urlCaptured === "/path?params=%7B%22a%22%3A10%2C%22b%22%3A%2210%22%7D"
    );
  }
}

runTests("NavigationRouterTests", [
  new DispatchFromCurrentUrlMatched(),
  new DispatchFromCurrentUrlNoMatch(),
  new DispatchFromCurrentUrlWithoutParams(),
  new DispatchFromCurrentUrlWithEmptyParams(),
  new DispatchFromCurrentUrlWithInvalidParams(),
  new DispatchFromCurrentUrlWithValidParams(),
  new DispatchMatched(),
  new DispatchNoMatch(),
  new DispatchTwiceToHidePreviousHandler(),
  new DispatchPushHistoryWithoutParams(),
  new DispatchPushHistoryWithParams(),
]);
