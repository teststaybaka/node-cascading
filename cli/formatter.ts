import { readFileSync } from 'fs';
import { ImportSpecifier, NamedImports, StringLiteral, ImportDeclaration, ImportEqualsDeclaration, forEachChild, createSourceFile, ScriptTarget, Node as TsNode, SyntaxKind } from 'typescript';

export class Formatter {
  private static LINE_LIMIT = 80;
  private static INDENT_STEP = '  ';

  private importEqualsNode: ImportEqualsDeclaration[] = [];
  private importNodes: ImportDeclaration[] = [];
  private currentIndent = 0;
  private content = '';
  private remainingLimit: number;

  public constructor(private fileName: string) {}

  public format(): void {
    let sourceFile = createSourceFile(this.fileName,
      readFileSync(this.fileName).toString(), ScriptTarget.ES5, false);
    forEachChild(sourceFile, (node): void => this.visitTopDeclarations(node));
    this.formatImports();
    console.log(this.content);
  }

  private writeLine(line: string): void {
    this.content += line + '\n';
  }

  private indentOne(visitBlock: () => void): void {
    this.currentIndent++;
    visitBlock();
    this.currentIndent--;
  }

  private newLine(): string {
    return Formatter.INDENT_STEP.repeat(this.currentIndent);
  }

  private visitTopDeclarations(node: TsNode): void {
    if (node.kind === SyntaxKind.ImportEqualsDeclaration) {
      this.importEqualsNode.push(node as ImportEqualsDeclaration);
    }

    if (node.kind === SyntaxKind.ImportDeclaration) {
      this.importNodes.push(node as ImportDeclaration);
    }
  }

  private formatImports(): void {
    // this.importNodes.sort((a, b): number => {
        // (a.moduleSpecifier as StringLiteral).text;
    //  });
    let leadingLine = 'import { ';
    for (let importNode of this.importNodes) {
      this.visitImport(leadingLine, importNode);
    }
  }

  private visitImport(line: string, importNode: ImportDeclaration): void {
    console.log('visitImport:' + this.currentIndent);
    this.indentOne(
      (): void => {
        console.log('visitImport:' + this.currentIndent);
        let importSpecifiers = (importNode.importClause.namedBindings as NamedImports).elements;
        if (importSpecifiers.length === 0) {
          return;
        }

        let firstName = this.getImportName(importSpecifiers[0]);
        if (line.length + firstName.length <= Formatter.LINE_LIMIT) {
          line += firstName;
        } else {
          this.writeLine(line);
          line = this.newLine() + firstName;
        }
        for (let i = 1; i < importSpecifiers.length; i++) {
          let importSpecifier = importSpecifiers[i];
          let text = ', ' + this.getImportName(importSpecifier);
          if (line.length + text.length <= Formatter.LINE_LIMIT) {
            line += text;
          } else {
            this.writeLine(line);
            line = this.newLine() + text;
          }
        }
        let importPath = (importNode.moduleSpecifier as StringLiteral).text;
        let importFrom = `} from '${importPath}';`;
        if (line.length + importFrom.length + 1 <= Formatter.LINE_LIMIT) {
          this.writeLine(line + ' ' + importFrom);
        } else {
          this.writeLine(line);
          this.writeLine(this.newLine() + importFrom);
        }
      },
    );
  }

  private getImportName(importSpecifier: ImportSpecifier): string {
    let name = importSpecifier.name.text;
    if (importSpecifier.propertyName) {
      return importSpecifier.propertyName.text + ' as ' + name;
    } else {
      return name;
    }
  }
}

