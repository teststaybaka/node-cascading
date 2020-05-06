import { readFileSync, writeFileSync } from "fs";
import * as ts from 'typescript';

export class MessageGenerator {
  private pathToNamedImports = new Map<string, Set<string>>();
  private namedImportsToPath = new Map<string, string>();
  private content = '';

  public constructor(private fileName: string) {}

  public generate(): void {
    let sourceFile = ts.createSourceFile(this.fileName,
      readFileSync(this.fileName).toString(), ts.ScriptTarget.ES5, true);
    ts.forEachChild(sourceFile, (node) => this.visitTopDeclarations(node));
    this.prependImports();
    writeFileSync(this.fileName, this.content);
  }

  private visitTopDeclarations(node: ts.Node): void {
    if (node.kind === ts.SyntaxKind.ImportDeclaration) {
      this.parseImports(node as ts.ImportDeclaration);
    }

    if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
      this.generateMessageSerializer(node as ts.InterfaceDeclaration);
    }

    if (node.kind === ts.SyntaxKind.EnumDeclaration) {
      this.generateEnumSerializer(node as ts.EnumDeclaration);
    }
  }

  private parseImports(importNode: ts.ImportDeclaration): void {
    let importPath = (importNode.moduleSpecifier as ts.StringLiteral).text;
    let namedImports: string[] = [];
    for (let importSpecifier of (importNode.importClause.namedBindings as ts.NamedImports).elements) {
      let namedImport = importSpecifier.name.text;
      namedImports.push(namedImport);
      this.namedImportsToPath.set(namedImport, importPath);
    }
    this.pathToNamedImports.set(importPath, new Set(namedImports));
  }

  private generateMessageSerializer(interfacceNode: ts.InterfaceDeclaration): void {
    let interfaceName = interfacceNode.name.text;
    this.content += `
export interface ${interfaceName} {`;

    for (let member of interfacceNode.members) {
      let field = member as ts.PropertySignature;
      let fieldName = (field.name as ts.Identifier).text;
      let fieldType = '';
      if (field.type.kind === ts.SyntaxKind.StringKeyword) {
        fieldType = 'string';
      } else if (field.type.kind === ts.SyntaxKind.BooleanKeyword) {
        fieldType = 'boolean';
      } else if (field.type.kind === ts.SyntaxKind.NumberKeyword) {
        fieldType = 'number';
      } else if (field.type.kind === ts.SyntaxKind.TypeReference) {
        fieldType = ((field.type as ts.TypeReferenceNode).typeName as ts.Identifier).text;
      }
      this.content += `
  ${fieldName}?: ${fieldType},`;
    }

    this.content += `
}
`;
    
    this.content += `
export class ${interfaceName}Serializer implements MessageSerializer<${interfaceName}> {
  public fromObj(obj?: any): ${interfaceName} {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    let ret: ${interfaceName} = {};`;

    for (let member of interfacceNode.members) {
      let field = member as ts.PropertySignature;
      let fieldName = (field.name as ts.Identifier).text;
      let fieldType = '';
      if (field.type.kind === ts.SyntaxKind.StringKeyword) {
        fieldType = 'string';
      } else if (field.type.kind === ts.SyntaxKind.BooleanKeyword) {
        fieldType = 'boolean';
      } else if (field.type.kind === ts.SyntaxKind.NumberKeyword) {
        fieldType = 'number';
      }
      let nestedFieldType = '';
      if (field.type.kind === ts.SyntaxKind.TypeReference) {
        nestedFieldType = ((field.type as ts.TypeReferenceNode).typeName as ts.Identifier).text;
      }

      if (fieldType) {
        this.content +=`
    if (typeof obj.${fieldName} === '${fieldType}') {
      ret.${fieldName} = obj.${fieldName};
    }`;
      } else if (nestedFieldType) {
        this.content +=`
    ret.${fieldName} = new ${nestedFieldType}Serializer().fromObj(obj.${fieldName});`;

        let importPath = this.namedImportsToPath.get(nestedFieldType);
        if (importPath) {
          this.pathToNamedImports.get(importPath)
            .add(`${nestedFieldType}Serializer`);
        }
      }
    }

    this.content +=`
    return ret;
  }
}
`;
  }

  private generateEnumSerializer(enumNode: ts.EnumDeclaration): void {
    let enumName = enumNode.name.text;
    this.content += `
export enum ${enumName} {`;

    for (let member of enumNode.members) {
      let enumValueName = (member.name as ts.Identifier).text;
      let enumValueValue = (member.initializer as ts.NumericLiteral).text;
      this.content += `
  ${enumValueName} = ${enumValueValue},`;
    }

    this.content += `
}
`;
    
    this.content += `
export class ${enumName}Serializer implements MessageSerializer<${enumName}> {
  public fromObj(obj?: any): ${enumName} {
    if (!obj || typeof obj !== 'number' || !(obj in ${enumName})) {
      return undefined;
    } else {
      return obj;
    }
  }
}
`;
  }

  private prependImports(): void {
    for (let entry of Array.from(this.pathToNamedImports.entries())) {
      let importPath = entry[0];
      let namedImports = Array.from(entry[1]).join(', ');
      this.content =
        `import { ${namedImports} } from '${importPath}';\n` + this.content;
    }
    // TODO: Support imports when install as library.
    this.content =
      `import { MessageSerializer } from '../message_serializer';\n`
      + this.content;
  }
}

