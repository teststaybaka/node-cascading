import { readFileSync } from 'fs';
import { NamedImports, StringLiteral, ImportDeclaration, forEachChild, createSourceFile, ScriptTarget, Node as TsNode, SyntaxKind } from 'typescript';

export class Formatter {
  private static LINE_LIMIT = 80;
  private static INDENT_STEP = '  ';

  private importNodes: ImportDeclaration[] = [];
  private currentIndent = 0;
  private content = '';
  private line = '';
  private hasNewLine = false;

  public constructor(private fileName: string) {}

  public format(): void {
    let sourceFile = createSourceFile(this.fileName,
      readFileSync(this.fileName).toString(), ScriptTarget.ES5, false);
    for (let node of sourceFile.statements) {
      if (node.kind === SyntaxKind.ImportDeclaration) {
        this.importNodes.push(node as ImportDeclaration);
      }
    }
    this.importNodes.sort(
      (a, b): number => {
        return (a.moduleSpecifier as StringLiteral).text.localeCompare(
          (b.moduleSpecifier as StringLiteral).text
        );
      }
    );
    for (let importNode of this.importNodes) {
      this.visitImportNode(importNode);
    }
    this.flushLineAndNewLine();
    console.log(this.content);
  }

  private flushLineAndNewLine(textInNewLine = ''): void {
    this.content += this.line + '\n';
    this.hasNewLine = true;
    this.line = Formatter.INDENT_STEP.repeat(this.currentIndent)
      + textInNewLine;
  }

  private flushLineIfOverLineLimit(textToBeAppended: string
    , needsToPadSpaceBefore = false
  ): void {
    if (needsToPadSpaceBefore) {
      if (this.line.length + textToBeAppended.length + 1
        > Formatter.LINE_LIMIT
      ) {
        this.flushLineAndNewLine(textToBeAppended);
      } else {
        this.line += ' ' + textToBeAppended;
      }
    } else {
      if (this.line.length + textToBeAppended.length > Formatter.LINE_LIMIT) {
        this.flushLineAndNewLine(textToBeAppended);
      } else {
        this.line += textToBeAppended;
      }
    }
  }

  private flushLineIfOverLineLimitOrPrevHasNewLine(
    textToBeAppended: string, prevHasNewLine: boolean
    , needsToPadSpaceBefore = false
  ): void {
    if (prevHasNewLine) {
      this.flushLineAndNewLine(textToBeAppended);
    } else {
      this.flushLineIfOverLineLimit(textToBeAppended, needsToPadSpaceBefore);
    }
  }

  private indentOne(leadingTextAfterIndent: string, visitBlock
    : () => void
  ): boolean {
    this.flushLineAndNewLine(leadingTextAfterIndent);
 
    this.currentIndent++;
    this.hasNewLine = false;
    visitBlock();
    let prevHasNewLine = this.hasNewLine;
    this.currentIndent--;

    this.hasNewLine = true;
    return prevHasNewLine;
  }

  private visitImportNode(importNode: ImportDeclaration): void {
    if (!importNode.importClause || !importNode.importClause.namedBindings
      || importNode.importClause.namedBindings.kind !== SyntaxKind.NamedImports
    ) {
      console.warn(`Please use "import {} from '';" syntax. Ignoring the `
        + `following import statement: ${importNode.getText()}`);
      return;
    }

    let importNames: string[] = [];
    for (let importSpecifier of
      (importNode.importClause.namedBindings as NamedImports).elements
    ) {
      let name = importSpecifier.name.text;
      if (importSpecifier.propertyName) {
        importNames.push(importSpecifier.propertyName.text + ' as ' + name);
      } else {
        importNames.push(name);
      }
    }
    if (importNames.length === 0) {
      return;
    }
    importNames.sort();

    let prevHasNewLine = this.indentOne('import {',
      (): void => {
        let firstName = importNames[0];
        this.flushLineIfOverLineLimit(firstName, true);
        for (let i = 1; i < importNames.length; i++) {
          let importName = importNames[i];
          let text = ', ' + importName;
          this.flushLineIfOverLineLimit(text);;
        }
      },
    );

    let importPath = (importNode.moduleSpecifier as StringLiteral).text;
    let importFrom = `} from '${importPath}';`;
    this.flushLineIfOverLineLimitOrPrevHasNewLine(importFrom, prevHasNewLine
      , true
    );
  }
}

