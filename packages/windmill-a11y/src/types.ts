import { ImpactValue } from 'axe-core';

export interface WindmillConfig {
    projectPath: string;
    webpackConfigPath: string;
    hooks: [() => void];
    simulationFilePattern: string[];
    a11yImpactLevel: ImpactValue;
}
