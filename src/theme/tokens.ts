export interface ThemeTokens {
  // Page
  pageBg: string;
  pageText: string;

  // Board SVG
  boardCanvasBg: string;
  boardFill: string;
  boardStroke: string;
  boardBorder: string;

  // Axis labels
  axisText: string;

  // Holes
  holeEmpty: string;
  holeEmptyStroke: string;
  holeHoverStroke: string;
  holeEraseStroke: string;

  // Components — general
  compFill: string;
  compFillDrag: string;
  compSelectStroke: string;
  compBorderDefault: string;
  compBorderRibbon: string;
  compBorderPower: string;

  // Components — TMC module
  tmcBodyFill: string;
  tmcBodyStroke: string;
  tmcHeatsinkFill: string;
  tmcHeatsinkStroke: string;
  tmcFinStroke: string;
  tmcChipFill: string;
  tmcChipStroke: string;
  tmcChipDot: string;
  tmcLabelBright: string;
  tmcLabelDim: string;
  tmcPinLabel: string;

  // UI chrome
  btnBg: string;
  btnText: string;
  btnBorder: string;
  btnAccentText: string;
  btnAccentBorder: string;

  // Panel
  panelBg: string;
  panelBorder: string;
  panelItemBg: string;

  // Palette bar
  paletteInactiveBg: string;
  paletteInactiveText: string;
  paletteInactiveBorder: string;

  // Text hierarchy
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDim: string;
  textAccent: string;
  textWarn: string;
  textDanger: string;
}

export const darkTokens: ThemeTokens = {
  pageBg: "#0c1015",
  pageText: "#ccd",

  boardCanvasBg: "#080c10",
  boardFill: "#1a2e1a",
  boardStroke: "#2e4a2e",
  boardBorder: "#1a2030",

  axisText: "#3a5a3a",

  holeEmpty: "#0a140a",
  holeEmptyStroke: "#3a5a3a",
  holeHoverStroke: "#5a8aaa",
  holeEraseStroke: "#e53935",

  compFill: "#0a0e14",
  compFillDrag: "#1a1a2a",
  compSelectStroke: "#4fc3f7",
  compBorderDefault: "#3a3a4a",
  compBorderRibbon: "#3a6a6a",
  compBorderPower: "#5a3030",

  tmcBodyFill: "#111",
  tmcBodyStroke: "#2a2a2a",
  tmcHeatsinkFill: "#1a1a1a",
  tmcHeatsinkStroke: "#333",
  tmcFinStroke: "#282828",
  tmcChipFill: "#0a0a0a",
  tmcChipStroke: "#2a2a2a",
  tmcChipDot: "#333",
  tmcLabelBright: "#3a3a3a",
  tmcLabelDim: "#2a2a2a",
  tmcPinLabel: "#4a5a4a",

  btnBg: "#14181e",
  btnText: "#889",
  btnBorder: "#2a3040",
  btnAccentText: "#7ec8e3",
  btnAccentBorder: "#2a4a5a",

  panelBg: "#0e1218",
  panelBorder: "#1a2030",
  panelItemBg: "#12161c",

  paletteInactiveBg: "#10141a",
  paletteInactiveText: "#556",
  paletteInactiveBorder: "#1e1e1e",

  textPrimary: "#ccd",
  textSecondary: "#889",
  textTertiary: "#556",
  textDim: "#445",
  textAccent: "#7ec8e3",
  textWarn: "#ffa726",
  textDanger: "#e53935",
};

export const lightTokens: ThemeTokens = {
  pageBg: "#f0f2f5",
  pageText: "#1a1a2a",

  boardCanvasBg: "#dce2dc",
  boardFill: "#a8c8a8",
  boardStroke: "#7a9a7a",
  boardBorder: "#b0b8c0",

  axisText: "#5a7a5a",

  holeEmpty: "#f0f4f0",
  holeEmptyStroke: "#6a8a6a",
  holeHoverStroke: "#2070a0",
  holeEraseStroke: "#d32f2f",

  compFill: "#f5f7fa",
  compFillDrag: "#e8eaf0",
  compSelectStroke: "#0288d1",
  compBorderDefault: "#90909a",
  compBorderRibbon: "#508080",
  compBorderPower: "#a05050",

  tmcBodyFill: "#e0e0e0",
  tmcBodyStroke: "#999",
  tmcHeatsinkFill: "#ccc",
  tmcHeatsinkStroke: "#999",
  tmcFinStroke: "#b0b0b0",
  tmcChipFill: "#555",
  tmcChipStroke: "#999",
  tmcChipDot: "#888",
  tmcLabelBright: "#666",
  tmcLabelDim: "#888",
  tmcPinLabel: "#5a6a5a",

  btnBg: "#e4e8ee",
  btnText: "#556",
  btnBorder: "#c0c8d0",
  btnAccentText: "#0277bd",
  btnAccentBorder: "#90c0d8",

  panelBg: "#f5f7fa",
  panelBorder: "#c0c8d0",
  panelItemBg: "#eaecf0",

  paletteInactiveBg: "#e8ecf0",
  paletteInactiveText: "#667",
  paletteInactiveBorder: "#d0d4d8",

  textPrimary: "#1a1a2a",
  textSecondary: "#445",
  textTertiary: "#667",
  textDim: "#889",
  textAccent: "#0277bd",
  textWarn: "#e65100",
  textDanger: "#c62828",
};
