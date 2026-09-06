import { memo, useEffect, useRef, useState } from 'react';

import { appConfig } from '@/core/config';
import { TextField } from '@/core/integrations/ui';

import { useDebouncedValue } from '../hooks/useDebouncedValue';

type WorkOrderSearchBarProps = {
  resetNonce: number;
  onQueryChange: (q: string) => void;
  onSearchPendingChange: (isPending: boolean) => void;
};

/**
 * Owns search draft locally so typing does not re-render filter chips or the list.
 * Parent only receives the debounced query string (and pending flag while debounce waits).
 */
export const WorkOrderSearchBar = memo(function WorkOrderSearchBar({
  resetNonce,
  onQueryChange,
  onSearchPendingChange,
}: WorkOrderSearchBarProps) {
  const [draft, setDraft] = useState('');
  const debounced = useDebouncedValue(draft, appConfig.searchDebounceMs);
  const lastSentRef = useRef<string | null>(null);

  useEffect(() => {
    setDraft('');
  }, [resetNonce]);

  // Notify parent while draft has not settled — drives list body "fetching" chrome.
  useEffect(() => {
    onSearchPendingChange(draft !== debounced);
  }, [draft, debounced, onSearchPendingChange]);

  // Only push settled query when it actually changes (skip mount duplicate '').
  useEffect(() => {
    if (lastSentRef.current === debounced) {
      return;
    }
    lastSentRef.current = debounced;
    onQueryChange(debounced);
  }, [debounced, onQueryChange]);

  return (
    <TextField
      label="Search"
      value={draft}
      onChangeText={setDraft}
      placeholder="Title, site, or reference"
      accessibilityLabel="Search work orders"
    />
  );
});
