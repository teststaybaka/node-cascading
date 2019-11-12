import { spawn } from 'child_process';
import { newInternalError } from '../../errors';
import { TestCase, runTests } from '../../test_base';
import { generateFromFile } from './interface_generator';

class GenerateInterfaceWithinSameFile implements TestCase {
  public name = 'GenerateInterfaceWithinSameFile';

  public async execute() {
    // Prepare
    let filePath = './test_data/test_interface';

    // Execute
    generateFromFile(filePath);

    // Verify
    let compiling = spawn('cmd', ['/s', '/c', 'tsc', filePath]);
    await new Promise<void>((resolve, reject): void => {
      compiling.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      compiling.stderr.on('data', (data) => {
        reject(newInternalError(data.toString()));
      });
      compiling.on('close', (code) => {
        resolve();
      });
    });
  }
}

class GenerateInterfaceWithImports implements TestCase {
  public name = 'GenerateInterfaceWithImports';

  public async execute() {
    // Prepare
    let filePath = './test_data/test_interface_another';

    // Execute
    generateFromFile(filePath);

    // Verify
    let compiling = spawn('cmd', ['/s', '/c', 'tsc', filePath]);
    await new Promise<void>((resolve, reject): void => {
      compiling.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      compiling.stderr.on('data', (data) => {
        reject(newInternalError(data.toString()));
      });
      compiling.on('close', (code) => {
        resolve();
      });
    });
  }
}

runTests('InterfaceGeneratorTest', [
  new GenerateInterfaceWithinSameFile(),
  new GenerateInterfaceWithImports(),
]);
