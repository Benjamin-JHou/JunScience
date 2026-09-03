import React from 'react';
import { render } from 'ink';
import { App } from './ink/App.js';

export async function startInkRepl(): Promise<void> {
  const instance = render(React.createElement(App));
  await instance.waitUntilExit();
}
