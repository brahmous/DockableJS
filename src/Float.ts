export enum SplitType {
  VERTICAL,
  HORIZONTAL,
}

export interface VerticalSplitPane {
  splitPosition: number;
  splitType: SplitType.VERTICAL;
  parent: SplitPane | null;
  left: Pane;
  right: Pane;
}

export interface HorizontalSplitPane {
  splitPosition: number;
  splitType: SplitType.HORIZONTAL;
  parent: SplitPane | null;
  top: Pane;
  bottom: Pane;
}

export interface SolidPane {
  id: number;
}

export type Pane = VerticalSplitPane | HorizontalSplitPane | SolidPane;

export interface UIBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  id: number;
  anchor: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' | 'CENTER';
  delete: boolean;
}

export interface Dimensions {
  l: number;
  r: number;
  t: number;
  b: number;
}

interface Point {
  x: number;
  y: number;
}

export function isSplitPane(
  pane: Pane
): pane is VerticalSplitPane | HorizontalSplitPane {
  return 'splitPosition' in pane;
}

type SplitPane = VerticalSplitPane | HorizontalSplitPane;

export class UITree {
  id: number;
  root: Pane;
  screenWidth: number;
  screenHeight: number;

  constructor(screenWidth: number, screenHeight: number) {
    this.id = 0;
    this.root = { id: this.id++ };
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  Delete(point: Point) {
    let current: Pane = this.root;

    while (isSplitPane(current)) {
      if (current.splitType == SplitType.VERTICAL) {
        if (current.splitPosition < point.x) {
          if (isSplitPane(current.right)) {
            current = current.right;
          } else {
            const parent = current.parent;
            if (parent) {
              if (parent.splitType == SplitType.HORIZONTAL) {
                if (parent.top == current) {
                  parent.top = current.left;
                } else {
                  // (parent.bottom == current)
                  parent.bottom = current.left;
                }
              } else {
                if (parent.left == current) {
                  parent.left = current.left;
                } else {
                  // (parent.right == current)
                  parent.right = current.left;
                }
              }
            } else {
              this.root = current.left;
            }
            break;
          }
        } else {
          if (isSplitPane(current.left)) {
            current = current.left;
          } else {
            const parent = current.parent;
            if (parent) {
              if (parent.splitType == SplitType.HORIZONTAL) {
                if (parent.top == current) {
                  parent.top = current.right;
                } else {
                  // (parent.bottom == current)
                  parent.bottom = current.right;
                }
              } else {
                if (parent.left == current) {
                  parent.left = current.right;
                } else {
                  // (parent.right == current)
                  parent.right = current.right;
                }
              }
            } else {
              this.root = current.right;
            }
            break;
          }
        }
      } else {
        if (current.splitPosition < point.y) {
          if (isSplitPane(current.bottom)) {
            current = current.bottom;
          } else {
            const parent = current.parent;
            if (parent) {
              if (parent.splitType == SplitType.HORIZONTAL) {
                if (parent.top == current) {
                  parent.top = current.top;
                } else {
                  parent.bottom = current.top;
                }
              } else {
                if (parent.left == current) {
                  parent.left = current.top;
                } else {
                  parent.right = current.top;
                }
              }
            } else {
              this.root = current.top;
            }
            break;
          }
        } else {
          if (isSplitPane(current.top)) {
            current = current.top;
          } else {
            const parent = current.parent;
            if (parent) {
              if (parent.splitType == SplitType.HORIZONTAL) {
                if (parent.top == current) {
                  parent.top = current.bottom;
                } else {
                  parent.bottom = current.bottom;
                }
              } else {
                if (parent.left == current) {
                  parent.left = current.bottom;
                } else {
                  parent.right = current.bottom;
                }
              }
            } else {
              this.root = current.bottom;
            }
            break;
          }
        }
      }
    }
  }

  Split(splitType: SplitType, point: Point) {
    let current: Pane = this.root;
    let dimensions: Dimensions = {
      l: 0,
      r: this.screenWidth,
      t: 0,
      b: this.screenHeight,
    };

    if (!isSplitPane(current)) {
      this.root =
        splitType == SplitType.HORIZONTAL
          ? {
              splitType,
              splitPosition: point.y,
              parent: null,
              top: {
                id: this.screenHeight / 2 < point.y ? current.id : this.id++,
              },
              bottom: {
                id: this.screenHeight / 2 >= point.y ? current.id : this.id++,
              },
            }
          : {
              splitType,
              splitPosition: point.x,
              parent: null,
              left: {
                id: this.screenWidth / 2 < point.x ? current.id : this.id++,
              },
              right: {
                id: this.screenWidth / 2 >= point.x ? current.id : this.id++,
              },
            };
      return;
    }

    while (isSplitPane(current)) {
      if (current.splitType == SplitType.VERTICAL) {
        if (current.splitPosition < point.x) {
          if (isSplitPane(current.right)) {
            current = current.right;
            dimensions.l = current.splitPosition;
          } else {
            const width = dimensions.r - current.splitPosition;
            const height = dimensions.b - dimensions.t;
            current.right =
              splitType == SplitType.HORIZONTAL
                ? {
                    splitType,
                    splitPosition: point.y,
                    parent: current,
                    top: {
                      id: height / 2 < point.y ? current.right.id : this.id++,
                    },
                    bottom: {
                      id: height / 2 >= point.y ? current.right.id : this.id++,
                    },
                  }
                : {
                    splitType,
                    splitPosition: point.x,
                    parent: current,
                    left: {
                      id: width / 2 < point.x ? current.right.id : this.id++,
                    },
                    right: {
                      id: width / 2 >= point.x ? current.right.id : this.id++,
                    },
                  };
            break;
          }
        } else {
          if (isSplitPane(current.left)) {
            current = current.left;
            dimensions.r = current.splitPosition;
          } else {
            const width = current.splitPosition - dimensions.l;
            const height = dimensions.b - dimensions.t;
            current.left =
              splitType == SplitType.HORIZONTAL
                ? {
                    splitType,
                    splitPosition: point.y,
                    parent: current,
                    top: {
                      id: height / 2 < point.y ? current.left.id : this.id++,
                    },
                    bottom: {
                      id: height / 2 >= point.y ? current.left.id : this.id++,
                    },
                  }
                : {
                    splitType,
                    splitPosition: point.x,
                    parent: current,
                    left: {
                      id: width / 2 < point.x ? current.left.id : this.id++,
                    },
                    right: {
                      id: width / 2 >= point.x ? current.left.id : this.id++,
                    },
                  };
            break;
          }
        }
      } else {
        if (current.splitPosition < point.y) {
          if (isSplitPane(current.bottom)) {
            current = current.bottom;
            dimensions.t = current.splitPosition;
          } else {
            const width = dimensions.r - dimensions.l;
            const height = dimensions.b - current.splitPosition;
            current.bottom =
              splitType == SplitType.HORIZONTAL
                ? {
                    splitType,
                    splitPosition: point.y,
                    parent: current,
                    top: {
                      id: height / 2 < point.y ? current.bottom.id : this.id++,
                    },
                    bottom: {
                      id: height / 2 >= point.y ? current.bottom.id : this.id++,
                    },
                  }
                : {
                    splitType,
                    splitPosition: point.x,
                    parent: current,
                    left: {
                      id: width / 2 < point.x ? current.bottom.id : this.id++,
                    },
                    right: {
                      id: width / 2 >= point.x ? current.bottom.id : this.id++,
                    },
                  };
            break;
          }
        } else {
          if (isSplitPane(current.top)) {
            current = current.top;
            dimensions.b = current.splitPosition;
          } else {
            const width = dimensions.r - dimensions.l;
            const height = current.splitPosition - dimensions.t;
            current.top =
              splitType == SplitType.HORIZONTAL
                ? {
                    splitType,
                    splitPosition: point.y,
                    parent: current,
                    top: {
                      id: height / 2 < point.y ? current.top.id : this.id++,
                    },
                    bottom: {
                      id: height / 2 >= point.y ? current.top.id : this.id++,
                    },
                  }
                : {
                    splitType,
                    splitPosition: point.x,
                    parent: current,
                    left: {
                      id: width / 2 < point.x ? current.top.id : this.id++,
                    },
                    right: {
                      id: width / 2 >= point.x ? current.top.id : this.id++,
                    },
                  };
            break;
          }
        }
      }
    }
  }

  RenderLayout(): UIBlock[] {
    const uiBlocks: UIBlock[] = [];

    this.traverse(
      this.root,
      {
        l: 0,
        r: this.screenWidth,
        t: 0,
        b: this.screenHeight,
      },
      uiBlocks
    );

    return uiBlocks;
  }

  // Left and write and height and with and split position not just height and width
  traverse(root: Pane, { l, r, t, b }: Dimensions, blocks: UIBlock[]) {
    if (isSplitPane(root)) {
      if (root.splitType == SplitType.HORIZONTAL) {
        this.traverse(root.top, { l, r, t, b: root.splitPosition }, blocks);
        this.traverse(root.bottom, { l, r, t: root.splitPosition, b }, blocks);
      } else {
        this.traverse(root.left, { l, r: root.splitPosition, t, b }, blocks);
        this.traverse(root.right, { l: root.splitPosition, r, t, b }, blocks);
      }
    } else {
      blocks[root.id] = {
        x: l,
        y: t,
        w: r - l,
        h: b - t,
        id: root.id,
        anchor: 'CENTER',
        delete: false,
      };
    }
  }
}

function intersects(a: [number, number], b: [number, number]): boolean {
  return a[0] < b[1] && a[1] > b[0];
}

export function getDeleteAnimationState(
  oldState: UIBlock[],
  newState: UIBlock[]
) {
  for (let i = 0; i < oldState.length; ++i) {
    if (!oldState[i] || newState[i]) continue;

    const removedXInterval: [number, number] = [
      oldState[i].x,
      oldState[i].x + oldState[i].w,
    ];
    const removedYInterval: [number, number] = [
      oldState[i].y,
      oldState[i].y + oldState[i].h,
    ];

    newState[i] = oldState[i];
    newState[i].delete = true;

    for (let j = 0; j < newState.length; ++j) {
      if (!newState[j]) continue;

      const newXInterval: [number, number] = [
        newState[j].x,
        newState[j].x + newState[j].w,
      ];
      const newYInterval: [number, number] = [
        newState[j].y,
        newState[j].y + newState[j].h,
      ];

      if (
        intersects(removedXInterval, newXInterval) &&
        intersects(removedYInterval, newYInterval)
      ) {
        const oldXInterval: [number, number] = [
          oldState[j].x,
          oldState[j].x + oldState[j].w,
        ];
        const oldYInterval: [number, number] = [
          oldState[j].y,
          oldState[j].y + oldState[j].h,
        ];

        if (
          newXInterval[0] != oldXInterval[0] ||
          newXInterval[1] != oldXInterval[1]
        ) {
          if (newXInterval[0] == oldXInterval[0]) {
            newState[i].anchor = 'RIGHT';
            newState[i].w = 0;
          } else {
            // oldXInterval[1] == newXInterval[1]
            newState[i].anchor = 'LEFT';
            newState[i].w = 0;
          }
        } else {
          // if (
          //   newYInterval[0] != oldYInterval[0] ||
          //   newYInterval[1] != oldYInterval[1]
          // ) {
          if (oldYInterval[0] == newYInterval[0]) {
            newState[i].anchor = 'TOP';
            newState[i].h = 0;
          } else {
            // oldYInterval[1] == newYInterval[1]
            newState[i].anchor = 'BOTTOM';
            newState[i].h = 0;
          }
        }
        return newState;
      }
    }
  }

  return newState;
}

export function getSplitAnimationState(
  oldState: UIBlock[],
  newState: UIBlock[]
) {
  for (let i = 0; i < newState.length; ++i) {
    if (!newState[i] || oldState[i]) continue;
    console.log({ i });
    oldState[i] = {...newState[i]};
    console.log('obj: ', newState[i]);

    if (oldState[i] == newState[i]) {
      alert("The same");
    }

    const addedXInterval: [number, number] = [
      newState[i].x,
      newState[i].x + newState[i].w,
    ];
    const addedYInterval: [number, number] = [
      newState[i].y,
      newState[i].y + newState[i].h,
    ];

    for (let j = 0; j < oldState.length; ++j) {
      if (!oldState[j]) continue;

      const oldXInterval: [number, number] = [
        oldState[j].x,
        oldState[j].x + oldState[j].w,
      ];
      const oldYInterval: [number, number] = [
        oldState[j].y,
        oldState[j].y + oldState[j].h,
      ];

      if (
        !intersects(addedXInterval, oldXInterval) ||
        !intersects(addedYInterval, oldYInterval)
      )
        continue;

      const newXInterval: [number, number] = [
        newState[j].x,
        newState[j].x + oldState[j].w,
      ];
      const newYInterval: [number, number] = [
        newState[j].y,
        newState[j].y + oldState[j].h,
      ];

      if (
        (newXInterval[0] == oldXInterval[0] &&
          newXInterval[1] != oldXInterval[1]) ||
        (newXInterval[0] != oldXInterval[0] &&
          newXInterval[1] == oldXInterval[1])
      ) {
        oldState[i].h = 0;
      } else {
        oldState[i].w = 0;
      }
      return oldState;
    }
  }
  return oldState;
}
