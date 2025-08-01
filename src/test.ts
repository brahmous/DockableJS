import { SplitType, UITree } from './Float';

let ui = new UITree(400, 400);
ui.Split(SplitType.HORIZONTAL, { x: 100, y: 200 });
ui.Split(SplitType.VERTICAL, { x: 200, y: 100 });
ui.Split(SplitType.VERTICAL, { x: 200, y: 300 });
///
ui.Split(SplitType.VERTICAL, { x: 250, y: 300 }, 3);
ui.Delete({ x: 100, y: 300 });
///
ui.Split(SplitType.VERTICAL, { x: 300, y: 300 }, 3);
ui.Delete({ x: 100, y: 300 });
