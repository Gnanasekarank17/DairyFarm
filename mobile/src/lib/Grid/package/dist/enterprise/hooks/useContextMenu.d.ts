export interface ContextMenuState {
    x: number;
    y: number;
    target: "header" | "body";
    columnId: string;
    rowIndex?: number;
}
export declare function useContextMenu(): {
    menu: ContextMenuState | null;
    openMenu: (e: React.MouseEvent, target: "header" | "body", columnId: string, rowIndex?: number) => void;
    closeMenu: () => void;
};
