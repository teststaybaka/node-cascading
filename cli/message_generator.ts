import { readFileSync } from "fs";
import * as ts from 'typescript';

export class MessageGenerator {
  private contentToAppend = '';

  public constructor(private fileName: string) {}

  public generate(): void {  
    let sourceFile = ts.createSourceFile(this.fileName,
      readFileSync(this.fileName).toString(), ts.ScriptTarget.ES5, true);
    ts.forEachChild(sourceFile, (node) => this.visitTopDeclarations(node));
    console.log(this.contentToAppend);
  }

  private visitTopDeclarations(node: ts.Node): void {
    if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
      let itfName = (node as ts.InterfaceDeclaration).name.text;
      this.contentToAppend += `
export class ${itfName}Serializer implements MessageSerializer<${itfName}> {
  public fromObj(obj?: any): ${itfName} {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    let ret: ${itfName} = {};`;
      ts.forEachChild(node, (node) => this.visitInterfaceFields(node));
      this.contentToAppend +=`
    return ret;
  }
}`;
    }

    if (node.kind === ts.SyntaxKind.EnumDeclaration) {
      let enumName = (node as ts.EnumDeclaration).name.text;
      this.contentToAppend += `
export class ${enumName}Serializer implements MessageSerializer<${enumName}> {
  public fromObj(obj?: any): ${enumName} {
    if (!obj || typeof obj !== 'number' || !(obj in ${enumName}) {
      return undefined;
    } else {
      return obj;
    }
  }
}`;
    }
  }

  private visitInterfaceFields(node: ts.Node): void {
    if (node.kind !== ts.SyntaxKind.PropertySignature) {
      return;
    }

    let ptyNode = node as ts.PropertySignature;
    let fieldName = (ptyNode.name as ts.Identifier).text;
    let fieldType = '';
    if (ptyNode.type.kind === ts.SyntaxKind.StringKeyword) {
      fieldType = 'string';
    } else if (ptyNode.type.kind === ts.SyntaxKind.BooleanKeyword) {
      fieldType = 'boolean';
    } else if (ptyNode.type.kind === ts.SyntaxKind.NumberKeyword) {
      fieldType = 'number';
    }
    let nestedFieldType = '';
    if (ptyNode.type.kind === ts.SyntaxKind.TypeReference) {
      nestedFieldType = ((ptyNode.type as ts.TypeReferenceNode).typeName as ts.Identifier).text;
    }

    if (fieldType) {
      this.contentToAppend +=`
    if (typeof obj.${fieldName} === '${fieldType}') {
      ret.${fieldName} = obj.${fieldName};
    }`;
    } else if (nestedFieldType) {
      this.contentToAppend +=`
    ret.${fieldName} = new ${nestedFieldType}Serializer().fromObj(obj.${fieldName});`;
    }
  }
}

