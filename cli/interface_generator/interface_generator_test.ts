import { execSync } from 'child_process';
import { TestCase, runTests } from '../../test_base';
import { generateFromFile } from './interface_generator';

class GenerateInterfaceWithinSameFile implements TestCase {
  public name = 'GenerateInterfaceWithinSameFile';

  public async execute() {
    // Prepare
    let filePath = './test_data/test_interface';

    // Execute
    generateFromFile(filePath + '.itf');

    // Verify
    execSync(`tsc ${filePath}`);
  }
}

class GenerateInterfaceWithImports implements TestCase {
  public name = 'GenerateInterfaceWithImports';

  public async execute() {
    // Prepare
    let filePath1 = './test_data/test_interface';
    let filePath2 = './test_data/test_interface_another';

    // Execute
    generateFromFile(filePath1 + '.itf');
    generateFromFile(filePath2 + '.itf');

    // Verify
    execSync(`tsc ${filePath1}`);
    execSync(`tsc ${filePath2}`);
  }
}

runTests('InterfaceGeneratorTest', [
  new GenerateInterfaceWithinSameFile(),
  new GenerateInterfaceWithImports(),
]);
