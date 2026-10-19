import { GridColumn } from '../../../AppDataGrid';
import { ConditionalRule } from '../../utils/conditionalFormat';
interface ConditionalFormatPanelProps {
    columnDefs: GridColumn[];
    customRules: ConditionalRule[];
    onAddCustomRule: (rule: ConditionalRule) => void;
    onRemoveCustomRule: (ruleId: string) => void;
    onClose: () => void;
}
export declare function ConditionalFormatPanel({ columnDefs, customRules, onAddCustomRule, onRemoveCustomRule, onClose, }: ConditionalFormatPanelProps): import("react").JSX.Element;
export {};
