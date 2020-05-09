import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { TestCase, TestEnvironment, runTests } from '../test_base';
import { MessageGenerator } from './message_generator';

class SelfLinkPackages implements TestEnvironment {
  public constructor() {
    execSync(`sudo npm link ../selfage`, {encoding: 'utf-8'});
  }

  public destroy() {
    execSync(`sudo npm unlink; rm node_modules/selfage`, {encoding: 'utf-8'});
  }
}

class GenerateMessageWithinSameFile implements TestCase {
  public name = 'GenerateMessagesWithinSameFile';

  public async execute() {
    // Prepare
    let filePath = './test_data/test_interface.ts';
    let originalContent = readFileSync(filePath);

    // Execute
    new MessageGenerator(filePath).generate();

    // Verify
    try {
      execSync(`tsc ${filePath}`, {encoding: 'utf-8'});
    } finally {
      writeFileSync(filePath, originalContent);
    }
  }
}

class GenerateMessageWithNestedField implements TestCase {
  public name = 'GenerateMessageWithNestedField';

  public async execute() {
    // Prepare
    let filePath = './test_data/test_interface.ts';
    let originalContent = readFileSync(filePath);
    new MessageGenerator(filePath).generate();
    let filePathAnother = './test_data/test_interface_another.ts';
    let originalContentAnother = readFileSync(filePathAnother);

    // Execute
    new MessageGenerator(filePathAnother).generate();

    // Verify
    try {
      execSync(`tsc ${filePathAnother}`, {encoding: 'utf-8'});
    } finally {
      writeFileSync(filePath, originalContent);
      writeFileSync(filePathAnother, originalContentAnother);
    }
  }
}

runTests('MessageGeneratorTest', [
  new GenerateMessageWithinSameFile(),
  new GenerateMessageWithNestedField(),
], new SelfLinkPackages());

