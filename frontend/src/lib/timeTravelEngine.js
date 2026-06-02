import * as Babel from '@babel/standalone';

/**
 * Instruments and executes JavaScript code to produce a time-travel trace.
 * @param {string} code
 * @returns {{ trace: Array<{line: number, state: Object}>, error: string|null }}
 */
export const runWithTimeTravel = (code) => {
  const trace = [];
  let executionSteps = 0;
  const MAX_STEPS = 1000; // Prevent infinite loops

  // A global function that our instrumented code will call
  window._tr = (line, state) => {
    if (executionSteps > MAX_STEPS) {
      throw new Error("Execution limit exceeded (infinite loop protection).");
    }
    executionSteps++;
    
    // Deep clone the state to cleanly capture values at this exact moment
    try {
      const clonedState = JSON.parse(JSON.stringify(state, (k, v) => {
        // Handle undefined, functions, and errors
        if (v === undefined) return "undefined";
        if (typeof v === "function") return "[Function]";
        if (v instanceof Error) return `[Error: ${v.message}]`;
        return v;
      }));
      trace.push({ line, state: clonedState });
    } catch {
      trace.push({ line, state: { _error: "State not serializable" } });
    }
  };

  const timeTravelPlugin = ({ types: t }) => {
    return {
      visitor: {
        Statement(path) {
          // Skip if we've already instrumented, or if we don't have location data
          if (!path.node.loc || path.node._instrumented) return;
          
          // Skip statements that shouldn't/can't easily be preceded by expressions directly
          if (path.isBlockStatement() || path.isEmptyStatement()) return;
          
          // Only try to insert before if we are inside a block or the main program.
          if (!path.parentPath.isBlockStatement() && !path.parentPath.isProgram()) return;

          const line = path.node.loc.start.line;
          
          // Get all variables currently in scope
          const bindings = path.scope.getAllBindings();
          const varsToCapture = Object.keys(bindings).filter(k => k !== '_tr');

          const props = varsToCapture.map(k => {
            return t.objectProperty(t.identifier(k), t.identifier(k), false, true); // shorthand property
          });

          const stateObj = t.objectExpression(props);

          const trNode = t.expressionStatement(
            t.callExpression(
              t.identifier('_tr'),
              [t.numericLiteral(line), stateObj]
            )
          );
          trNode._instrumented = true;

          try {
             path.insertBefore(trNode);
          } catch {
             // Silently ignore cases where insertion fails dynamically
          }
        }
      }
    };
  };

  try {
    const transformedCode = Babel.transform(code, {
      plugins: [timeTravelPlugin],
      presets: ['env']
    }).code;

    // Execute the transformed code.
    // We run it via a Function instead of eval to isolate scope reasonably,
    // although _tr is injected globally to be caught.
    const runNode = new Function(transformedCode);
    runNode();
    
    // Extract AST for Visualizer using babel traverse / parser?
    // We already have trace.
    return { trace, error: null };
  } catch (error) {
    return { trace, error: error.message };
  } finally {
    delete window._tr; // Cleanup
  }
};
