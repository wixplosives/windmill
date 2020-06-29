<img src="assets/logo.png">

[![Build Status](https://travis-ci.com/wixplosives/windmill.svg?token=JxepjChyzQB66ehAYhtG&branch=master)](https://travis-ci.com/wixplosives/windmill)

**Windmill** is a set of tools designed to automate how you test your components, by using **simulations**.

The benefit of windmill is two-fold: one, you don't need to do any extra work to add tests to your components -- just use the simulations you've already created for them. Two, every time you add a simulation, you're increasing test coverage of your component.

To get started, first install `@wixc3/windmill-a11y` and `@wixc3/windmill-sanity` in your project. You'll have to verify whether or not you're providing the necessary peer-dependencies. Next, you'll have to configure any hooks you'll need for requiring your components in node (covered below in **configuration**).

That's it! You should now be able to use two commands: `windmill-a11y`, which helps you check whether your components are accessible, and `windmill-sanity`, which helps you check your components for general best-practices and server-side compatibility.

These tools consume simulation files in the project, which are described [here](https://github.com/wixplosives/wcs-core/blob/d91a792a52b916fb6dc55b7a4f7c49715a010168/src/types.ts#L40).

### The Tools

- `sanity` - component sanity test suite, asserts that:
  - the component can render to string (for SSR compatibility)
  - hydration in the client works as intended
  - the component has no errors in <React.StrictMode />
  - nothing was printed to the console
  - events were removed after component unmounts
- `a11y` - accessibility test:
  - checks component render result for accessibility using axe-core

### CLI Configuration

Windmill's tools can be configured in two ways: via the command line, or via a configuration file. Configuration specified via the command line will override configuration specified by a configuration file.

The common CLI parameters are listed below:

- `-p, --project <p>` The root project path. Absolute. Defaults to `process.cwd()`.
- `-w, --webpack <w>` The path to a webpack config file (`js`). Absolute. Windmill will search for a `webpack.config.js` file in the root of your project by default.
- `-c, --config <c>` The path to a windmill config file. Windmill will search for a `windmill.config.js` file in the root by default.
- `-d, --debug` - true/false (default: false). Windmill will open puppeteer in non-headless mode, with devtools open, and will not close the browser when the tests are finished running.
- (just for `windmill-a11y`) `-i, --impact <i>` Lets you specify the impact level of `windmill-a11y`, which changes which violations `windmill-a11y` will fail for. There are four levels to choose from: `'minor' | 'moderate' | 'serious' | 'critical'`.

Windmill's tools will also accept a list of simulation files passed as arguments, which it will then search for.

For example:

```shell
yarn windmill-sanity non-ssr-comp.sim.ts
```

By default, windmill will search your project for simulation files which match the pattern `*.sim.ts` or `*.sim.tsx`.

Windmill configuration files can contain the following properties:

```ts
projectPath: string;
webpackConfigPath: string;
a11yImpactLevel: axe.ImpactValue;
simulationFilePattern: string[];
hooks: [() => void];
```

The first three are the same as the CLI parameters above, but the last two are new.

`simulationFilePattern` is an array of file patterns to match against, in case you've decided to follow a pattern other than the default.

`hooks` let you specify functions that will be called before calling `require` on your simulations. **You will probably need to configure this for your project**. In the simplest cast, if you're using Typescript, your hook property will look something like this:

```js
hooks: [() => require('@ts-tools/node/r')];
```

If you're using [Stylable](stylable.io), you'll have to add a hook to support loading `.st.css` files in node. It'll look something like this:

```js
hooks: [() => require('@stylable/node/require')];
```

Hooks must be configured on a per-project basis. Currently, there is no way to opt-out of requiring simulations in node. If you'd like to request a feature, or make a suggestion on how we can improve windmill, please don't hesitate to open an issue or pull request.

### Programmatic API

Windmill also exposes programmatic API to be used in test files, or wherever else you'd like to use them.

`@wixc3/windmill-a11y` exports the function, `checkIfSimulationIsAccessible` which has the following signature:

```ts
checkIfSimulationIsAccessible(simulation: ISimulation<Record<string, unknown>>) => Promise<IA11yTestResult>
```

Where `ISimulation` is the same one referenced [here](https://github.com/wixplosives/wcs-core/blob/d91a792a52b916fb6dc55b7a4f7c49715a010168/src/types.ts#L40) and `IA11yTestResult` is an object that looks like:

```ts
{
    passed: boolean;
    violations?: axe.Result[];
}
```

In the future we plan to include a programmatic API for ssr tests and dangling event-listeners.

<a href="https://icons8.com/icon/122728/windmill">_Windmill icon by Icons8_</a>
