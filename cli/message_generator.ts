import { readFileSync, writeFileSync } from 'fs';
import { forEachChild, createSourceFile, ScriptTarget, SyntaxKind, Node as TsNode, ImportDeclaration, InterfaceDeclaration, EnumDeclaration, StringLiteral, NamedImports, Identifier, PropertySignature, TypeReferenceNode, NumericLiteral } from 'typescript';

export class MessageGenerator {
  private pathToNamedImports = new Map<string, Set<string>>();
  private namedImportsToPath = new Map<string, string>();
  private content = '';

  public constructor(private fileName: string) {}

  public generate(): void {
    let sourceFile = createSourceFile(this.fileName,
      readFileSync(this.fileName).toString(), ScriptTarget.ES5, false);
    forEachChild(sourceFile, (node) => this.visitTopDeclarations(node));
    this.prependImports();
    writeFileSync(this.fileName, this.content);
  }

  private visitTopDeclarations(node: TsNode): void {
    if (node.kind === SyntaxKind.ImportDeclaration) {
      this.parseImports(node as ImportDeclaration);
    }

    if (node.kind === SyntaxKind.InterfaceDeclaration) {
      this.generateMessageSerializer(node as InterfaceDeclaration);
    }

    if (node.kind === SyntaxKind.EnumDeclaration) {
      this.generateEnumSerializer(node as EnumDeclaration);
    }
  }

  private parseImports(importNode: ImportDeclaration): void {
    let importPath = (importNode.moduleSpecifier as StringLiteral).text;
    let namedImports: string[] = [];
    for (let importSpecifier of (importNode.importClause.namedBindings as NamedImports).elements) {
      let namedImport = importSpecifier.name.text;
      namedImports.push(namedImport);
      this.namedImportsToPath.set(namedImport, importPath);
    }
    this.pathToNamedImports.set(importPath, new Set(namedImports));
  }

  private generateMessageSerializer(interfacceNode: InterfaceDeclaration): void {
    let interfaceName = interfacceNode.name.text;
    this.content += `
export interface ${interfaceName} {`;

    for (let member of interfacceNode.members) {
      let field = member as PropertySignature;
      let fieldName = (field.name as Identifier).text;
      let fieldType = '';
      if (field.type.kind === SyntaxKind.StringKeyword) {
        fieldType = 'string';
      } else if (field.type.kind === SyntaxKind.BooleanKeyword) {
        fieldType = 'boolean';
      } else if (field.type.kind === SyntaxKind.NumberKeyword) {
        fieldType = 'number';
      } else if (field.type.kind === SyntaxKind.TypeReference) {
        fieldType = ((field.type as TypeReferenceNode).typeName as Identifier).text;
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
      let field = member as PropertySignature;
      let fieldName = (field.name as Identifier).text;
      let fieldType = '';
      if (field.type.kind === SyntaxKind.StringKeyword) {
        fieldType = 'string';
      } else if (field.type.kind === SyntaxKind.BooleanKeyword) {
        fieldType = 'boolean';
      } else if (field.type.kind === SyntaxKind.NumberKeyword) {
        fieldType = 'number';
      }
      let nestedFieldType = '';
      if (field.type.kind === SyntaxKind.TypeReference) {
        nestedFieldType = ((field.type as TypeReferenceNode).typeName as Identifier).text;
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

  private generateEnumSerializer(enumNode: EnumDeclaration): void {
    let enumName = enumNode.name.text;
    this.content += `
export enum ${enumName} {`;

    for (let member of enumNode.members) {
      let enumValueName = (member.name as Identifier).text;
      let enumValueValue = (member.initializer as NumericLiteral).text;
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

    let serializerPath = 'selfage/message_serializer';
    if (this.pathToNamedImports.has(serializerPath)) {
      return;
    }
    this.content =
      `import { MessageSerializer } from '${serializerPath}';\n` + this.content;
  }
}

