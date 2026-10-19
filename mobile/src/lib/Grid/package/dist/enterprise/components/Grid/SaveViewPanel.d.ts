import { SavedView } from '../../hooks/useSaveView';
interface SaveViewPanelProps {
    views: SavedView[];
    onSave: (name: string) => void;
    onLoad: (view: SavedView) => void;
    onDelete: (name: string) => void;
    /** Toggle the default flag on the named view. */
    onSetDefault: (name: string) => void;
    onClose: () => void;
}
export declare function SaveViewPanel({ views, onSave, onLoad, onDelete, onSetDefault, onClose, }: SaveViewPanelProps): import("react").JSX.Element;
export {};
