import { checkIfSimulationIsAccessible } from '@windmill/a11y';

const thing = document.createElement('div');
thing.textContent = 'HEY';
document.body.appendChild(thing);

const simulationsJson = window.localStorage.getItem('simulations') as string;
const simulationPaths = JSON.parse(simulationsJson);
console.log('simulations:', simulationPaths);

const test = async () => {
    const results = [];

    for (const simulationPath of simulationPaths) {
        const simulation = await (window as any).modules[simulationPath]();
        const result = await checkIfSimulationIsAccessible(simulation.default);
        results.push(result.violations);
    }

    console.log('results:', results);
};

test()
    .then(res => console.log(res))
    .catch(err => console.error(err));
