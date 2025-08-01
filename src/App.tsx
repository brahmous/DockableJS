import { useEffect, useRef, useState } from 'react';
import './App.css';
import { SplitType, UITree, type Point, type UIBlock } from './Float';

// const uitree: UITree = new UITree(400, 400);
// uitree.Split(SplitType.HORIZONTAL, { x: 100, y: 100 });
// uitree.Split(SplitType.VERTICAL, { x: 200, y: 300 });
// uitree.Split(SplitType.VERTICAL, { x: 275, y: 300 });

enum Edges {
  LEFT,
  RIGHT,
  TOP,
  BOTTOM,
}

let newUiTree = new UITree(400, 400);
newUiTree.Split(SplitType.HORIZONTAL, { x: 100, y: 200 });
newUiTree.Split(SplitType.VERTICAL, { x: 200, y: 100 });
newUiTree.Split(SplitType.VERTICAL, { x: 200, y: 300 });
newUiTree.Split(SplitType.VERTICAL, { x: 250, y: 300 }, 3);
newUiTree.Delete({ x: 100, y: 300 });
newUiTree.Split(SplitType.VERTICAL, { x: 300, y: 300 }, 3);
newUiTree.Delete({ x: 100, y: 300 });
// newUiTree.Split(SplitType.VERTICAL, { x: 300, y: 300 }, 3);
// newUiTree.Delete({ x: 100, y: 300 });
// newUiTree.Split(SplitType.HORIZONTAL, { x: 326, y: 214 }, 8);

const dragController: {
  showHTML5DragFeedback?: (
    feedbackData: string,
    e: React.DragEvent<HTMLDivElement>
  ) => void;
  hideHTML5DragFeedback?: (e: React.DragEvent<HTMLDivElement>) => void;
} = {};

function FloatComponent() {
  const animationDuration = 0.5;
  // const animationDuration = 5;
  const [state, setState] = useState<'loading' | 'page'>('loading');
  const [blocks, setBlocks] = useState<UIBlock[]>([]);

  const ref = useRef<HTMLDivElement>(null);

  const dragFeedbackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<boolean>(false);

  const dragStartPoint = useRef<{ x: number; y: number }>(null);

  useEffect(() => {
    // newUiTree = new UITree(ref.current!.clientWidth, ref.current!.clientHeight);
    // newUiTree.Split(SplitType.HORIZONTAL, { x: 200, y: 200 });
    // newUiTree.Split(SplitType.VERTICAL, { x: 200, y: 300 });
    // newUiTree.Split(SplitType.VERTICAL, { x: 275, y: 300 });
    const initialBlocks = newUiTree.RenderLayout();
    setBlocks(initialBlocks);
    setState('page');
  }, []);

  useEffect(() => {
    if (!dragFeedbackRef.current) return;

    function handleDragOver(e: DragEvent) {
      if (drag.current) {
        e.preventDefault();
        dragFeedbackRef.current!.style.left = `${e.clientX + 10}px`;
        dragFeedbackRef.current!.style.top = `${e.clientY + 10}px`;
      }
    }

    document.addEventListener('dragover', handleDragOver);
    dragController.showHTML5DragFeedback = (
      feedbackData: string,
      e: React.DragEvent<HTMLDivElement>
    ) => {
      drag.current = true;
      dragFeedbackRef.current!.innerHTML = `<span class="dragFeedbackElement">${feedbackData}</span>`;
      dragFeedbackRef.current!.style.left = `${e.clientX + 10}px`;
      dragFeedbackRef.current!.style.top = `${e.clientY + 10}px`;
      dragFeedbackRef.current!.style.display = 'block';
    };

    dragController.hideHTML5DragFeedback = () =>
      // e: React.DragEvent<HTMLDivElement>
      {
        drag.current = false;
        dragFeedbackRef.current!.style.display = 'none';
      };

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      delete dragController.showHTML5DragFeedback;
      delete dragController.hideHTML5DragFeedback;
    };
  }, []);
  const colors = [
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#800000',
    '#808000',
    '#008000',
    '#800080',
    '#FFA500',
    '#A52A2A',
  ];

  return (
    <div
      style={{
        // background: 'green',
        position: 'relative',
        flexGrow: 1,
      }}
      ref={ref}
      onDragStart={(e) => {
        ref.current?.getBoundingClientRect().y;
        if (!ref.current) return;
        const bbox = ref.current.getBoundingClientRect();
        e.dataTransfer.setDragImage(new Image(), 0, 0);
        e.dataTransfer.setData(
          'id',
          newUiTree
            .find({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
            .id.toString()
        );
        // Call function to get information
        dragController.showHTML5DragFeedback!('hello', e);
        dragStartPoint.current = {
          x: e.clientX - bbox.x,
          y: e.clientY - bbox.y,
        };
        console.log('drag start point: ', dragStartPoint.current);
      }}
      onDragEnd={(e) => {
        dragController.hideHTML5DragFeedback!(e);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        const deletePoint = dragStartPoint.current;

        if (!deletePoint) return;

        const bbox = ref.current?.getBoundingClientRect();

        const dropPoint: Point = {
          x: e.clientX - bbox!.x,
          y: e.clientY - bbox!.y,
        };

        const movedPane = newUiTree.find(deletePoint);
        const dropPane = newUiTree.find(dropPoint);

        // You can't drop a pane onto itself
        if (movedPane.ref == dropPane.ref) return;

        let distances: number[] = [];
        distances[Edges.LEFT] = e.clientX - dropPane.x - bbox!.x;
        distances[Edges.RIGHT] = dropPane.width - distances[Edges.LEFT];
        distances[Edges.TOP] = e.clientY - dropPane.y - bbox!.y;
        distances[Edges.BOTTOM] = dropPane.height - distances[Edges.TOP];

        const min_d = Math.min(...distances);
        const splitType =
          min_d == distances[Edges.LEFT] || min_d == distances[Edges.RIGHT]
            ? SplitType.VERTICAL
            : SplitType.HORIZONTAL;

        // if (movedPane.ref.parent) {
        //   if (movedPane.ref.parent.splitType == SplitType.HORIZONTAL) {
        //     // if i'm top then if the bottom is drop pain return
        //     if (
        //       movedPane.ref.parent.top == movedPane.ref &&
        //       movedPane.ref.parent.bottom == dropPane.ref &&
        //       splitType == SplitType.HORIZONTAL &&
        //       movedPane.ref.parent.splitPosition < dropPoint.y
        //     )
        //       return;
        //     // if i'm bottom then if the top is drop pain return
        //     if (
        //       movedPane.ref.parent.bottom == movedPane.ref &&
        //       movedPane.ref.parent.top == dropPane.ref &&
        //       splitType == SplitType.HORIZONTAL &&
        //       movedPane.ref.parent.splitPosition >= dropPane.y
        //     )
        //       return;
        //   } else {
        //     // if i'm left then if the right is drop pain return
        //     if (
        //       movedPane.ref.parent.left == movedPane.ref &&
        //       movedPane.ref.parent.right == dropPane.ref &&
        //       splitType == SplitType.VERTICAL &&
        //       dropPoint.x <
        //         movedPane.ref.parent.splitPosition + dropPane.width / 2
        //     )
        //       return;
        //     // if i'm right then if the left is drop pain return
        //     if (
        //       movedPane.ref.parent.right == movedPane.ref &&
        //       movedPane.ref.parent.left == dropPane.ref &&
        //       splitType == SplitType.VERTICAL &&
        //       dropPoint.x >=
        //         movedPane.ref.parent.splitPosition - dropPane.width / 2
        //     )
        //       return;
        //   }
        // } else {
        //   throw 'inconsistent tree every node must have a parent except the root!';
        // }
        const id = movedPane.id;
        newUiTree.Split(splitType, dropPoint, id, newUiTree);
        newUiTree.Delete(deletePoint);
        setBlocks(newUiTree.RenderLayout());
        dragController.hideHTML5DragFeedback!(e);
      }}
    >
      <div
        ref={dragFeedbackRef}
        style={{
          position: 'fixed',
          display: 'none',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
      {state == 'loading' && <div>Loading</div>}
      {state == 'page' && (
        <>
          {blocks.map(
            (block, index) =>
              block && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '26px',
                    color: 'black',
                    border: '2px solid black',
                    width: `${block.w}px`,
                    height: `${block.h}px`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `translate(${block.x}px, ${block.y}px)`,
                    // transitionProperty: 'transform',
                    transitionDuration: `${animationDuration}s`,
                    // transformOrigin: block.anchor.toLowerCase(),
                    // transitionDelay: !block.delete ? '0.1s' : '0s',
                    background: colors[block.id],
                  }}
                  key={index}
                  draggable={true}
                >
                  {block.id}
                </div>
              )
          )}
        </>
      )}
    </div>
  );
}

function App() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        maxWidth: '100vw',
        maxHeight: '100vh',
        padding: '20px',
        width: '100vw',
        height: '100vh',
      }}
      ref={ref}
    >
      <FloatComponent />
    </div>
  );
}

export default App;
