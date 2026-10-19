import type { LedgerConfig, LedgerTypeSlug } from '../../config/ledgers';
import type { LedgerEntry } from '../../types';

export interface LedgerDataGridProps {
  type: LedgerTypeSlug;
  config: LedgerConfig;
  entries: LedgerEntry[];
  /** Whether the signed-in user may edit / delete rows (drives inline editing + actions). */
  canManage: boolean;
}
