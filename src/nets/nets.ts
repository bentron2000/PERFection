import type { Net } from "../types";

export const DEFAULT_NETS: Net[] = [
  { id: "gnd",  color: "#78909c", label: "GND" },
  { id: "v24",  color: "#ef5350", label: "24V" },
  { id: "v33",  color: "#ec407a", label: "3V3" },
  { id: "sck",  color: "#4fc3f7", label: "SCK" },
  { id: "mosi", color: "#66bb6a", label: "MOSI" },
  { id: "miso", color: "#ffa726", label: "MISO" },
  { id: "en",   color: "#ffee58", label: "EN" },
  { id: "cs1",  color: "#ce93d8", label: "CS1" },
  { id: "cs2",  color: "#ba68c8", label: "CS2" },
  { id: "cs3",  color: "#9c27b0", label: "CS3" },
  { id: "mblk", color: "#757575", label: "A2 BLK" },
  { id: "mred", color: "#e53935", label: "A1 RED" },
  { id: "mgrn", color: "#43a047", label: "B1 GRN" },
  { id: "mblu", color: "#1e88e5", label: "B2 BLU" },
  { id: "misc", color: "#ffffff", label: "Custom" },
];

export const sigColor = (nets: Net[], id: string) =>
  nets.find((n) => n.id === id)?.color || "#777";

export const sigLabel = (nets: Net[], id: string) =>
  nets.find((n) => n.id === id)?.label || id;
