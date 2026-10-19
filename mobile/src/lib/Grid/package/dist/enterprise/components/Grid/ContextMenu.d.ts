import { default as React } from 'react';
import { ContextMenuState } from '../../hooks/useContextMenu';
export interface ContextMenuAction {
    label: string;
    icon: string;
    shortcut?: string;
    danger?: boolean;
    separator?: boolean;
    onClick: () => void;
}
interface ContextMenuProps {
    menu: ContextMenuState;
    onClose: () => void;
    headerActions: ContextMenuAction[];
    bodyActions: ContextMenuAction[];
}
export declare function ContextMenu({ menu, onClose, headerActions, bodyActions }: ContextMenuProps): React.JSX.Element;
export {};
