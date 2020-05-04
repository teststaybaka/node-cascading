import { readFileSync } from "fs";
import * as ts from 'typescript';

export class MessageGenerator {
  private namedImportsToPath = new Map<string, string>();
  private contentToPrepend = '';
  private contentToAppend = '';

  public constructor(private fileName: string) {}

  public generate(): void {  
    let sourceFile = ts.createSourceFile(this.fileName,
      readFileSync(this.fileName).toString(), ts.ScriptTarget.ES5, true);
    ts.forEachChild(sourceFile, (node) => this.visitTopDeclarations(node));
    console.log(this.contentToPrepend);
    console.log(this.contentToAppend);
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
    for (let importSpecifier of (importNode.importClause.namedBindings as ts.NamedImports).elements) {
      this.namedImportsToPath.set(importSpecifier.name.text, importPath);
    }
  }

  private generateMessageSerializer(itfNode: ts.InterfaceDeclaration): void {
    let itfName = itfNode.name.text;
    this.contentToAppend += `
export class ${itfName}Serializer implements MessageSerializer<${itfName}> {
  public fromObj(obj?: any): ${itfName} {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    let ret: ${itfName} = {};`;

    for (let member of itfNode.members) {
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
        this.contentToAppend +=`
    if (typeof obj.${fieldName} === '${fieldType}') {
      ret.${fieldName} = obj.${fieldName};
    }`;
      } else if (nestedFieldType) {
        this.contentToAppend +=`
    ret.${fieldName} = new ${nestedFieldType}Serializer().fromObj(obj.${fieldName});`;

        let importPath = this.namedImportsToPath.get(nestedFieldType);
        this.contentToPrepend +=`
import { ${nestedFieldType}Serializer } from '${importPath}';`;
      }
    }

    this.contentToAppend +=`
    return ret;
  }
}
`;
  }

  private generateEnumSerializer(enumNode: ts.EnumDeclaration): void {
    let enumName = enumNode.name.text;
    this.contentToAppend += `
export class ${enumName}Serializer implements MessageSerializer<${enumName}> {
  public fromObj(obj?: any): ${enumName} {
    if (!obj || typeof obj !== 'number' || !(obj in ${enumName}) {
      return undefined;
    } else {
      return obj;
    }
  }
}
`;
  }
}

