'use client';

import { useEffect } from 'react';
import { installConsoleFilter } from '@/lib/consoleFilter';

export default function SensitiveFiltersInitializer() {
  useEffect(() => {
    installConsoleFilter();
  }, []);

  return null;
}

