export interface ThemeColors {
    headerBg: string;
    toolbarBg: string;
    accentColor: string;
    rowAltBg: string;
    headerText: string;
    toolbarText: string;
    headerFontSize: number;
}
interface CustomizePanelProps {
    colors: ThemeColors;
    onChange: (colors: ThemeColors) => void;
    onClose: () => void;
}
export declare function CustomizePanel({ colors, onChange, onClose }: CustomizePanelProps): import("react").JSX.Element;
export {};
