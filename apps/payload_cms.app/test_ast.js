import ts from 'typescript';

const source = `
/**
 * @alias CMS:Collection:action
 * @alias Plural:actions
 */
export class ActionModel extends Model {
    static UI = {
        $singular: 'Action',
        $plural: 'Actions'
    }

    static title = {
        type: 'string',
        hint: 'text',
        localized: true
    }
}
`;

const sourceFile = ts.createSourceFile('test.ts', source, 99, true);
ts.forEachChild(sourceFile, node => {
    if (ts.isClassDeclaration(node)) {
        console.log("Found class:", node.name.text);
        
        // Extract JSDoc
        const tags = ts.getJSDocTags(node);
        tags.forEach(tag => {
            const comment = typeof tag.comment === 'string' ? tag.comment : (tag.comment?.[0]?.text || '')
            console.log("JSDoc tag:", tag.tagName.text, comment);
        });

        // Extract static members
        node.members.forEach(member => {
            if (ts.isPropertyDeclaration(member) && member.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword)) {
                console.log("Static member:", member.name.getText(sourceFile));
                if (member.initializer && ts.isObjectLiteralExpression(member.initializer)) {
                    member.initializer.properties.forEach(prop => {
                        if (ts.isPropertyAssignment(prop)) {
                            const key = prop.name.getText(sourceFile);
                            let val = prop.initializer.getText(sourceFile);
                            if (ts.isStringLiteral(prop.initializer)) {
                                val = prop.initializer.text;
                            } else if (prop.initializer.kind === ts.SyntaxKind.TrueKeyword) {
                                val = true;
                            } else if (prop.initializer.kind === ts.SyntaxKind.FalseKeyword) {
                                val = false;
                            }
                            console.log(`  ${key}:`, val);
                        }
                    });
                }
            }
        });
    }
});
