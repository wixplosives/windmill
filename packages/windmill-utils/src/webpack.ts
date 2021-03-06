import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { createPreviewConfig, OverrideConfig } from './create-webpack-config';

export class WebpackConfigurator {
    public static load(config: OverrideConfig, path: string): WebpackConfigurator {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const initialConfig = require(path) as webpack.Configuration;
        const mergedConfig = createPreviewConfig(config, initialConfig);
        return new WebpackConfigurator(mergedConfig);
    }

    constructor(private config: webpack.Configuration) {}

    public getConfig(): webpack.Configuration {
        return this.config;
    }

    public setEntry(name: string, entry: string | string[]): this {
        const { config } = this;
        if (!config.entry) {
            config.entry = { [name]: entry };
        } else if (typeof config.entry === 'object' && !Array.isArray(config.entry) && !config.entry[name]) {
            config.entry[name] = entry;
        } else {
            throw new Error(`Error setting entry for ${name}`);
        }
        return this;
    }

    public addEntry(name: string, entry: string | string[]): this {
        const { config } = this;

        if (typeof config.entry !== 'object' || Array.isArray(config.entry) || !config.entry[name]) {
            throw new Error(`Webpack config doesn't contain '${name}' entry`);
        }

        config.entry[name] = ([] as string[]).concat(config.entry[name], entry);
        return this;
    }

    public addPlugin(plugin: webpack.Plugin): this {
        this.config.plugins = this.config.plugins || [];
        this.config.plugins.push(plugin);
        return this;
    }

    public addHtml(html: HtmlWebpackPlugin.Options): this {
        this.addPlugin(new HtmlWebpackPlugin(html));
        return this;
    }

    // Suppress "Download the React DevTools" message which adds noise in
    // headless mode when console output is proxied to stdout.
    public suppressReactDevtoolsSuggestion(): this {
        this.addPlugin(
            new webpack.DefinePlugin({
                __REACT_DEVTOOLS_GLOBAL_HOOK__: '({isDisabled: true})',
            })
        );
        return this;
    }
}
