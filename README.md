<img src="assets/logo.png">

<br />

[![Build Status](https://github.com/wixplosives/windmill/workflows/tests/badge.svg)](https://github.com/wixplosives/windmill/actions)

**Windmill** is a set of tools designed to automate how you test your components, by using **simulations**.

The benefit of windmill is two-fold: one, you don't need to do any extra work to add tests to your components -- just use the simulations you've already created for them. Two, every time you add a simulation you're increasing the test coverage of your project.

To get started, first install `@wixc3/windmill-a11y` and `@wixc3/windmill-sanity` in your project. Don't forget to check the peer-dependencies. Next, you'll have to configure any hooks you'll need for requiring your components in node (covered below in **configuration**).

That's it! You should now be able to use two commands: `windmill-a11y`, which helps you check whether your components are accessible; and `windmill-sanity`, which helps you check your components for general best-practices and server-side compatibility.

These tools consume simulation files in the project, which are described [here](https://github.com/wixplosives/wcs-core/blob/d91a792a52b916fb6dc55b7a4f7c49715a010168/src/types.ts#L40).

### The Tools

- `sanity` - component sanity test suite, asserts that:
  - the component can render to string (for ssr compatibility)
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

Windmill's tools will also accept a list of simulation files passed as arguments.

For example:

```shell
yarn windmill-sanity non-ssr-comp.sim.ts
```

By default windmill will search your project for simulation files which match the pattern `*.sim.ts` or `*.sim.tsx`.

### Configuration via config file

Windmill configuration files can be written in Typescript or Javacript, must export a named export `windmillConfig`, and can contain the following properties:

```ts
// Test-specific configuration
/** axe-core a11y violation impact level. Defaults to 'minor'. */
a11yImpactLevel: axe.ImpactValue;
/** Should a11y tests be run? Defaults to true */
accessible: boolean;
/** Should windmill-sanity check for ssr compatibility? Defaults to true */
ssrCompatible: boolean;
/** Should windmill-sanity render simulations in React strict mode? Defaults to true */
reactStrictModeCompatible: boolean;
/** Should windmill-sanity error when simulations console log or console error? Defaults to true */
errorOnConsole: boolean;

// Windmill configuration
/** The base path for the project. Default is process.cwd() */
projectPath: string;
/** Path to a webpack config file. By default, windmill looks in the root
 * of the project for a webpack.config.js file.
 */
webpackConfigPath: string;
/** functions that will be called before requiring your simulations in node.
 * **You will probably need to configure this for your project**. */
hooks: [() => void];
/** An array of file patterns to match against in case you've decided to
 * follow a pattern other than the default `*.sim.ts` or `*.sim.tsx`. */
simulationFilePattern: string[];
/** An array of globs for simulations that should be ignored completely from windmill tests.  */
ignorePaths: string[];
/** Configuration at the component level.  */
simulationConfigs: SimulationConfig[];
```

Simulation configs contain all the test-specific configuration from above, along with a glob for matching simulation files.

```ts
/**
 * A glob for matching simulations. Can be specific, for matching a
 * single simulation. i.e. '_wcs/simulations/my-comp.sim.ts'. Or can be more
 * general, for matching all simulations of a certain component i.e. '**\/Image/*.sim.ts'. */
simulationGlob: string;

// Test-specific configuration
/** axe-core a11y violation impact level */
a11yImpactLevel: axe.ImpactValue;
/** Should a11y tests be run? Defaults to true */
accessible: boolean;
/** Should windmill-sanity check for ssr compatibility? Defaults to true */
ssrCompatible: boolean;
/** Should windmill-sanity render simulations in React strict mode? Defaults to true */
reactStrictModeCompatible: boolean;
/** Should windmill-sanity error when simulations console log or console error? Defaults to true */
errorOnConsole: boolean;
```

Simulation configs take priority based on their order in the array. i.e. if you have two simulation configs which both match a simulation, the config that comes later in the `simulationConfigs` array will override the first one.

To give a small example, in the case when you'd like to skip a11y tests for a certain simulation, the config file would look like this:

```ts
import type { WindmillConfig } from '@wixc3/windmill-utils';

export const windmillConfig: WindmillConfig = {
  simulationConfigs: [
    {
      simulationGlob: '_wcs/simulations/Image/image-without-alt.ts',
      accessible: false,
    },
  ],
};
```

#### Hooks

`hooks` let you specify functions that will be called before calling `require` on your simulations. **You will probably need to configure this for your project**.

In the simplest case (Typescript + React) your hooks will look something like this:

```js
hooks: [() => require('@ts-tools/node/r')];
```

For another example, if you're using [Stylable](stylable.io) you'll have to add a hook to support loading `.st.css` files in node, like so:

```js
hooks: [() => require('@stylable/node/require')];
```

Hooks must be configured on a per-project basis. Currently, there is no way to opt-out of requiring simulations in node. If you'd like to request a feature or make a suggestion on how we can improve windmill, please don't hesitate to open an issue or pull request.

### Programmatic API

Windmill also exposes programmatic API to be used in test files, or wherever else you'd like to use them.

`@wixc3/windmill-a11y` exports the function `checkIfSimulationIsAccessible` which has the following signature:

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
