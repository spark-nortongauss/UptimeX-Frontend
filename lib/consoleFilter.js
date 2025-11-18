'use client';

import { FILTER_FLAG, containsBlockedTermDeep } from './sensitiveFilter';

const METHODS = ['log', 'info', 'warn', 'error', 'debug', 'trace'];
let installed = false;

export function installConsoleFilter(options = {}) {
  if (installed) {
    return;
  }

  const enabled = options.enabled ?? FILTER_FLAG;

  if (!enabled) {
    installed = true;
    return;
  }

  if (typeof window === 'undefined' || typeof console === 'undefined') {
    return;
  }

  installed = true;
  const originals = {};

  METHODS.forEach((method) => {
    const original = console[method]?.bind(console) || console.log.bind(console);
    originals[method] = original;

    console[method] = (...args) => {
      try {
        if (args.some((arg) => containsBlockedTermDeep(arg))) {
          return;
        }
        original(...args);
      } catch (error) {
        originals.error?.('[consoleFilter] Failed to inspect console arguments:', error);
      }
    };
  });

  if (typeof window !== 'undefined') {
    window.__ZABBIX_CONSOLE_FILTER__ = true;
  }
}

