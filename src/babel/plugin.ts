import { NodePath, PluginObj, types } from '@babel/core';
import generate from '@babel/generator';
import {
  ArrowFunctionExpression,
  BlockStatement,
  FunctionDeclaration,
  FunctionExpression,
  SwitchCase,
  VariableDeclarator,
} from '@babel/types';
import { highlight } from 'cli-highlight';

type BabelTypes = typeof types;

interface PluginOptions {
  opts: {
    localPath: string;
    unusedRanges: { start: number; end: number }[];
  };
}

export default function ({
  types: t,
}: {
  types: BabelTypes;
}): PluginObj<PluginOptions> {
  return {
    name: 'babel-plugin-doei',
    visitor: {
      BlockStatement(path, state) {
        if (
          isUnused(path, state.opts.unusedRanges) &&
          !path.findParent((p) => p.isFor())
        ) {
          logNode(path, state.opts.localPath);
          path.replaceWith(emptyBody(t));
        }
      },
      ArrowFunctionExpression(path, state) {
        if (isUnused(path, state.opts.unusedRanges)) {
          logNode(path, state.opts.localPath);
          path.node.params = [];
          path.node.body = emptyBody(t);
        }
      },
      FunctionExpression(path, state) {
        if (isUnused(path, state.opts.unusedRanges)) {
          logNode(path, state.opts.localPath);
          path.node.params = [];
          path.node.body = emptyBody(t);
        }
      },
      FunctionDeclaration(path, state) {
        if (isUnused(path, state.opts.unusedRanges)) {
          logNode(path, state.opts.localPath);
          path.node.params = [];
          path.node.body = emptyBody(t);
        }
      },
      SwitchCase(path, state) {
        if (isUnused(path, state.opts.unusedRanges)) {
          logNode(path, state.opts.localPath);
          path.remove();
        }
      },
      Program: {
        exit() {},
      },
    },
  };
}

function emptyBody(t: BabelTypes): types.BlockStatement {
  return t.blockStatement([
    t.expressionStatement(
      t.callExpression(
        t.memberExpression(t.identifier('console'), t.identifier('log'), false),
        [t.stringLiteral('"unused" code called')],
      ),
    ),
  ]);
}

function isUnused(
  path: NodePath<
    | ArrowFunctionExpression
    | BlockStatement
    | FunctionDeclaration
    | FunctionExpression
    | SwitchCase
    | VariableDeclarator
  >,
  unusedRanges: PluginOptions['opts']['unusedRanges'],
): boolean {
  const { start, end } = path.node;
  return (
    typeof start === 'number' &&
    typeof end === 'number' &&
    unusedRanges.some((range) => start >= range.start && end <= range.end)
  );
}

function logCode(code: string): void {
  console.log(
    highlight(code, { language: 'javascript', ignoreIllegals: true }),
  );
}

function logNode(path: NodePath<any>, localPath: string): void {
  const { node, type } = path;
  const { start, end } = node;
  const name = (node as any).id?.name;
  const bytes = end - start;
  console.log(
    'Removed %s byte %s "%s" at %s-%s in %s',
    bytes,
    type,
    name,
    start,
    end,
    localPath,
  );
  logCode(generate(node).code);
}
