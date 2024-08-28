type Layout = {
  left: number | string;
  top: number | string;
  width: number | string;
  height: number | string;
};

const layouts: Array<Array<Layout>> = [
  // 1 pane
  [
    {
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    },
  ],
  // 2 panes
  [
    {
      left: 0,
      top: 0,
      width: '50%',
      height: '100%',
    },
    {
      left: '50%',
      top: 0,
      width: '50%',
      height: '100%',
    },
  ],
  // 3 panes
  [
    {
      left: 0,
      top: 0,
      width: '33%',
      height: '100%',
    },
    {
      left: '33%',
      top: 0,
      width: '33%',
      height: '100%',
    },
    {
      left: '67%',
      top: 0,
      width: '33%',
      height: '100%',
    },
  ],
  // 4 panes
  [
    {
      left: 0,
      top: 0,
      width: '50%',
      height: '50%',
    },
    {
      left: '50%',
      top: 0,
      width: '50%',
      height: '50%',
    },
    {
      left: 0,
      top: '50%',
      width: '50%',
      height: '50%',
    },
    {
      left: '50%',
      top: '50%',
      width: '50%',
      height: '50%',
    },
  ],
];

export const layoutsByPaneCount: Record<number, Array<Layout>> = {};

for (const [index, layoutArray] of layouts.entries()) {
  const paneCount = index + 1;
  if (layoutArray.length !== paneCount) {
    throw new Error(`Invalid layout definition for pane count ${paneCount}`);
  }
  layoutsByPaneCount[paneCount] = layoutArray;
}
