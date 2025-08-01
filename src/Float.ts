export enum SplitType {
  VERTICAL,
  HORIZONTAL,
}

console.log('vertical: ', SplitType.VERTICAL);
console.log('horizontal: ', SplitType.HORIZONTAL);

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
  parent: SplitPane | null;
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

export interface Point {
  x: number;
  y: number;
}

export function isSplitPane(
  pane: Pane
): pane is VerticalSplitPane | HorizontalSplitPane {
  return 'splitPosition' in pane;
}

type SplitPane = VerticalSplitPane | HorizontalSplitPane;

interface PaneDescriptor {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  ref: SolidPane;
}

export class UITree {
  idCounter: number; // Id counter
  root: Pane;
  screenWidth: number;
  screenHeight: number;
  // screenbbox: DOMRect;

  constructor(
    screenWidth: number,
    screenHeight: number
    // domRoot: HTMLDivElement
  ) {
    this.idCounter = 0;
    this.root = { parent: null, id: this.idCounter++ };
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    // this.screenbbox = domRoot.getBoundingClientRect();
  }

  Delete(point: Point) {
    console.log('delete before: ', structuredClone(this));
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
                  parent.top.parent = parent;
                } else {
                  // (parent.bottom == current)
                  parent.bottom = current.left;
                  parent.bottom.parent = parent;
                }
              } else {
                if (parent.left == current) {
                  parent.left = current.left;
                  parent.left.parent = parent;
                } else {
                  // (parent.right == current)
                  parent.right = current.left;
                  parent.right.parent = parent;
                }
              }
            } else {
              if (isSplitPane(current.left)) {
                current.left.parent = null;
              }
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
                  parent.top.parent = parent;
                } else {
                  // (parent.bottom == current)
                  parent.bottom = current.right;
                  parent.bottom.parent = parent;
                }
              } else {
                if (parent.left == current) {
                  parent.left = current.right;
                  parent.left.parent = parent;
                } else {
                  // (parent.right == current)
                  parent.right = current.right;
                  parent.right.parent = parent;
                }
              }
            } else {
              if (isSplitPane(current.right)) {
                current.right.parent = null;
              }
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
            console.log({ current });
            if (parent) {
              if (parent.splitType == SplitType.HORIZONTAL) {
                if (parent.top == current) {
                  parent.top = current.top;
                  parent.top.parent = parent;
                } else {
                  parent.bottom = current.top;
                  parent.bottom.parent = parent;
                }
              } else {
                if (parent.left == current) {
                  parent.left = current.top;
                  parent.left.parent = parent;
                } else {
                  parent.right = current.top;
                  parent.right.parent = parent;
                }
              }
            } else {
              if (isSplitPane(current.top)) {
                current.top.parent = null;
              }
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
                  parent.top.parent = parent;
                } else {
                  parent.bottom = current.bottom;
                  parent.bottom.parent = parent;
                }
              } else {
                if (parent.left == current) {
                  parent.left = current.bottom;
                  parent.left.parent = parent;
                } else {
                  parent.right = current.bottom;
                  parent.right.parent = parent;
                }
              }
            } else {
              if (isSplitPane(current.bottom)) {
                current.bottom.parent = null;
              }
              this.root = current.bottom;
            }
            break;
          }
        }
      }
    }
    console.log('delete after: ', this);
  }

  Split(splitType: SplitType, point: Point, pane_id?: number, uiTree?: UITree) {
    // console.log(pane_id);

    let current: Pane = this.root;

    let dimensions: Dimensions = {
      l: 0,
      r: this.screenWidth,
      t: 0,
      b: this.screenHeight,
    };

    if (!isSplitPane(current)) {
      if (splitType == SplitType.HORIZONTAL) {
        this.root = {
          splitType,
          splitPosition: point.y,
          parent: null,
          top: {
            parent: null,
            id:
              this.screenHeight / 2 < point.y
                ? current.id
                : pane_id != undefined
                ? pane_id
                : this.idCounter++,
          },
          bottom: {
            parent: null,
            id:
              this.screenHeight / 2 >= point.y
                ? current.id
                : pane_id != undefined
                ? pane_id
                : this.idCounter++,
          },
        };
        this.root.top.parent = this.root.bottom.parent = this.root;
      } else {
        this.root = {
          splitType,
          splitPosition: point.x,
          parent: null,
          left: {
            parent: null,
            id:
              this.screenWidth / 2 < point.x
                ? current.id
                : pane_id != undefined
                ? pane_id
                : this.idCounter++,
          },
          right: {
            parent: null,
            id:
              this.screenWidth / 2 >= point.x
                ? current.id
                : pane_id != undefined
                ? pane_id
                : this.idCounter++,
          },
        };
        this.root.left.parent = this.root.right.parent = this.root;
      }
      return;
    }

    // Current node is split
    while (isSplitPane(current)) {
      // Current node is split vertically, so we have left and right sides
      if (current.splitType == SplitType.VERTICAL) {
        // The split position is to the left of x, so we must go to the right
        if (current.splitPosition < point.x) {
          // The right side is split we recurse
          if (isSplitPane(current.right)) {
            current = current.right;
            dimensions.l = current.splitPosition;
          } else {
            // The right side isn't split so we split it
            const mid_x =
              current.splitPosition +
              (dimensions.r - current.splitPosition) / 2;
            const mid_y = dimensions.t + (dimensions.b - dimensions.t) / 2;

            if (splitType == SplitType.HORIZONTAL) {
              current.right = {
                splitType,
                splitPosition: point.y,
                parent: current,
                top: {
                  parent: null,
                  id:
                    mid_y < point.y /* not the heigh the middle */
                      ? current.right.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
                bottom: {
                  parent: null,
                  id:
                    mid_y >= point.y
                      ? current.right.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
              };
              current.right.top.parent = current.right.bottom.parent =
                current.right;
            } else {
              current.right = {
                splitType,
                splitPosition: point.x,
                parent: current,
                left: {
                  parent: null,
                  id:
                    mid_x < point.x
                      ? current.right.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
                right: {
                  parent: null,
                  id:
                    mid_x >= point.x
                      ? current.right.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
              };
              current.right.left.parent = current.right.right.parent =
                current.right;
            }
            break;
          }
        } else {
          // The split position is to the right of x, so we go left
          if (isSplitPane(current.left)) {
            // The left child is split so we recurse left
            current = current.left;
            dimensions.r = current.splitPosition;
          } else {
            // The left child is not split, we split it.
            const mid_x =
              dimensions.l + (current.splitPosition - dimensions.l) / 2;
            const mid_y = dimensions.t + (dimensions.b - dimensions.t) / 2;
            if (splitType == SplitType.HORIZONTAL) {
              current.left = {
                splitType,
                splitPosition: point.y,
                parent: current,
                top: {
                  parent: null,
                  id:
                    mid_y < point.y
                      ? current.left.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
                bottom: {
                  parent: null,
                  id:
                    mid_y >= point.y
                      ? current.left.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
              };
              current.left.top.parent = current.left.bottom.parent =
                current.left;
            } else {
              current.left = {
                splitType,
                splitPosition: point.x,
                parent: current,
                left: {
                  parent: null,
                  id:
                    mid_x < point.x
                      ? current.left.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
                right: {
                  parent: null,
                  id:
                    mid_x >= point.x
                      ? current.left.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
              };
              current.left.left.parent = current.left.right.parent =
                current.left;
            }
            break;
          }
        }
      } else {
        // Horizontal Split
        if (current.splitPosition < point.y) {
          if (isSplitPane(current.bottom)) {
            current = current.bottom;
            dimensions.t = current.splitPosition;
          } else {
            const mid_x = dimensions.l + (dimensions.r - dimensions.l) / 2;
            const mid_y =
              dimensions.t + (dimensions.b - current.splitPosition) / 2;
            if (splitType == SplitType.HORIZONTAL) {
              current.bottom = {
                splitType,
                splitPosition: point.y,
                parent: current,
                top: {
                  parent: null,
                  id:
                    mid_y < point.y
                      ? current.bottom.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
                bottom: {
                  parent: null,
                  id:
                    mid_y >= point.y
                      ? current.bottom.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
              };
              current.bottom.top.parent = current.bottom.bottom.parent =
                current.bottom;
            } else {
              current.bottom = {
                splitType,
                splitPosition: point.x,
                parent: current,
                left: {
                  parent: null,
                  id:
                    mid_x < point.x
                      ? current.bottom.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
                right: {
                  parent: null,
                  id:
                    mid_x >= point.x
                      ? current.bottom.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
              };
              current.bottom.left.parent = current.bottom.right.parent =
                current.bottom;
            }
            break;
          }
        } else {
          if (isSplitPane(current.top)) {
            current = current.top;
            dimensions.b = current.splitPosition;
          } else {
            const mid_x = dimensions.l + (dimensions.r - dimensions.l) / 2;
            const mid_y =
              dimensions.t + (current.splitPosition - dimensions.t) / 2;
            if (splitType == SplitType.HORIZONTAL) {
              current.top = {
                splitType,
                splitPosition: point.y,
                parent: current,
                top: {
                  parent: null,
                  id:
                    mid_y < point.y
                      ? current.top.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
                bottom: {
                  parent: null,
                  id:
                    mid_y >= point.y
                      ? current.top.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
              };
              current.top.top.parent = current.top.bottom.parent = current.top;
            } else {
              current.top = {
                splitType,
                splitPosition: point.x,
                parent: current,
                left: {
                  parent: null,
                  id:
                    mid_x < point.x
                      ? current.top.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
                right: {
                  parent: null,
                  id:
                    mid_x >= point.x
                      ? current.top.id
                      : pane_id != undefined
                      ? pane_id
                      : this.idCounter++,
                },
              };
              current.top.left.parent = current.top.right.parent = current.top;
            }
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

  find(target: Point) {
    return this.getEnclosingRect(
      this.root,
      {
        l: 0,
        r: this.screenWidth,
        t: 0,
        b: this.screenHeight,
      },
      target
    );
  }

  getEnclosingRect(
    root: Pane,
    { l, r, t, b }: { l: number; r: number; t: number; b: number },
    target: Point
  ): PaneDescriptor {
    const paneWidth = r - l;
    const paneHeight = b - t;
    if (isSplitPane(root)) {
      if (root.splitType == SplitType.HORIZONTAL) {
        return root.splitPosition >= target.y
          ? this.getEnclosingRect(
              root.top,
              { l, r, b: root.splitPosition, t },
              target
            )
          : this.getEnclosingRect(
              root.bottom,
              { l, r, b, t: root.splitPosition },
              target
            );
      }
      return root.splitPosition >= target.x
        ? this.getEnclosingRect(
            root.left,
            { l, r: root.splitPosition, b, t },
            target
          )
        : this.getEnclosingRect(
            root.right,
            { l: root.splitPosition, r, b, t },
            target
          );
    }
    return {
      id: root.id,
      x: l,
      y: t,
      height: paneHeight,
      width: paneWidth,
      ref: root,
    };
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
    oldState[i] = { ...newState[i] };
    console.log('obj: ', newState[i]);

    if (oldState[i] == newState[i]) {
      alert('The same');
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
      // const newYInterval: [number, number] = [
      //   newState[j].y,
      //   newState[j].y + oldState[j].h,
      // ];

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

/*
TODO:
- Fix drag a box into neighbouring box on the same side (do nothing)
- Fix drag a box in itself (do nothing)
- Add Half Splits
- Add drop regions including drop a box in the center
- Make it bigger with some content inside
- refactor
- Create API
*/
