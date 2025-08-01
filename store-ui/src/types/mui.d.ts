import type {} from '@mui/material';

declare module '@mui/material/Grid' {
  interface GridProps {
    item?: boolean;
    container?: boolean;
    xs?: GridSize;
    md?: GridSize;
    sm?: GridSize;
    lg?: GridSize;
    xl?: GridSize;
  }
}

type GridSize = true | "auto" | number;
