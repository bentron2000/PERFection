import type { PartDefinition, Pin } from "../types";

// ── TMC5160 pin definitions ──
export const J1_PINS: Pin[] = [
  { label: "EN", sig: "en" },
  { label: "MOSI", sig: "mosi" },
  { label: "SCK", sig: "sck" },
  { label: "CS", sig: "cs1" },
  { label: "MISO", sig: "miso" },
  { label: "CLK", sig: "gnd" },
  { label: "STP", sig: "gnd" },
  { label: "DIR", sig: "gnd" },
];

export const J2_PINS: Pin[] = [
  { label: "VM", sig: "v24" },
  { label: "GND", sig: "gnd" },
  { label: "A2", sig: "mblk" },
  { label: "A1", sig: "mred" },
  { label: "B1", sig: "mgrn" },
  { label: "B2", sig: "mblu" },
  { label: "VIO", sig: "v33" },
  { label: "GND", sig: "gnd" },
];

// ── Built-in part definitions ──
export const BUILTIN_PARTS: PartDefinition[] = [
  {
    id: "tmc5160",
    label: "TMC5160",
    archetype: "module",
    rows: [
      { pins: J1_PINS, offset: [0, 0] },
      { pins: J2_PINS, offset: [5, 0] },
    ],
    rotatable: true,
    builtin: true,
  },
  {
    id: "ribbon-9pin",
    label: "9-pin Ribbon",
    archetype: "strip",
    rows: [
      {
        pins: [
          { label: "GND", sig: "gnd" },
          { label: "SCK", sig: "sck" },
          { label: "MOSI", sig: "mosi" },
          { label: "MISO", sig: "miso" },
          { label: "EN", sig: "en" },
          { label: "CS1", sig: "cs1" },
          { label: "CS2", sig: "cs2" },
          { label: "CS3", sig: "cs3" },
          { label: "3V3", sig: "v33" },
        ],
        offset: [0, 0],
      },
    ],
    rotatable: true,
    builtin: true,
  },
  {
    id: "motor-4pin",
    label: "4-pin Motor",
    archetype: "strip",
    rows: [
      {
        pins: [
          { label: "A2", sig: "mblk", wire: "BLK" },
          { label: "A1", sig: "mred", wire: "RED" },
          { label: "B1", sig: "mgrn", wire: "GRN" },
          { label: "B2", sig: "mblu", wire: "BLU" },
        ],
        offset: [0, 0],
      },
    ],
    rotatable: true,
    builtin: true,
  },
  {
    id: "power-2pin",
    label: "2-pin Power",
    archetype: "strip",
    rows: [
      {
        pins: [
          { label: "V+", sig: "v24" },
          { label: "GND", sig: "gnd" },
        ],
        offset: [0, 0],
      },
    ],
    rotatable: true,
    builtin: true,
  },
  {
    id: "header-2pin",
    label: "2-pin Header",
    archetype: "strip",
    rows: [
      {
        pins: [
          { label: "1", sig: "gnd" },
          { label: "2", sig: "gnd" },
        ],
        offset: [0, 0],
      },
    ],
    rotatable: true,
    builtin: true,
  },
  {
    id: "header-4pin",
    label: "4-pin Header",
    archetype: "strip",
    rows: [
      {
        pins: [
          { label: "1", sig: "gnd" },
          { label: "2", sig: "gnd" },
          { label: "3", sig: "gnd" },
          { label: "4", sig: "gnd" },
        ],
        offset: [0, 0],
      },
    ],
    rotatable: true,
    builtin: true,
  },
  {
    id: "header-8pin",
    label: "8-pin Header",
    archetype: "strip",
    rows: [
      {
        pins: [
          { label: "1", sig: "gnd" },
          { label: "2", sig: "gnd" },
          { label: "3", sig: "gnd" },
          { label: "4", sig: "gnd" },
          { label: "5", sig: "gnd" },
          { label: "6", sig: "gnd" },
          { label: "7", sig: "gnd" },
          { label: "8", sig: "gnd" },
        ],
        offset: [0, 0],
      },
    ],
    rotatable: true,
    builtin: true,
  },
];

let _counter = 0;
export function genPartId(): string {
  return `part_${Date.now()}_${++_counter}`;
}

export function genCompId(): string {
  return `comp_${Date.now()}_${++_counter}`;
}
