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
        // console.log('id: ', id);
        const deletePoint = dragStartPoint.current;
        // console.log('Delete Point: ', deletePoint);
        // console.log(
        //   'delete block: ',
        //   newUiTree.find({ x: deletePoint!.x, y: deletePoint!.y }).id
        // );
        if (deletePoint) {
          const bbox = ref.current?.getBoundingClientRect();
          const dropPoint: Point = {
            x: e.clientX - bbox!.x,
            y: e.clientY - bbox!.y,
          };
          // console.log('delte id: ', newUiTree.find(deletePoint).id);
          // console.log('Drop Point: ', dropPoint);
          const id = newUiTree.find(deletePoint).id;
          const dropSplitBBox = newUiTree.find(dropPoint);
          newUiTree.Delete(deletePoint);

          let distances: number[] = [];
          distances[Edges.LEFT] = e.clientX - dropSplitBBox.x;
          distances[Edges.RIGHT] = dropSplitBBox.width - distances[Edges.LEFT];
          distances[Edges.TOP] = e.clientY - dropSplitBBox.y;
          distances[Edges.BOTTOM] = dropSplitBBox.height - distances[Edges.TOP];

          const min_d = Math.min(...distances);

          console.log({ dropPoint });

          if (
            min_d == distances[Edges.LEFT] ||
            min_d == distances[Edges.RIGHT]
          ) {
            console.log('vertical');
            newUiTree.Split(SplitType.VERTICAL, dropPoint, id, newUiTree);
          } else {
            console.log('horizontal');
            newUiTree.Split(SplitType.HORIZONTAL, dropPoint, id, newUiTree);
          }
          setBlocks(newUiTree.RenderLayout());
          dragController.hideHTML5DragFeedback!(e);
        }
      }}
    >
      {/* <span
        ref={dragFeedbackRef}
        style={{
          position: 'absolute',
          width: 100,
          height: 100,
          background: 'red',
          zIndex: 10000,
          transform: 'translate(0px, 0px)', // Initial position
          userSelect: 'none',
          touchAction: 'none',
          willChange: 'transform',
        }}
      ></span> */}
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
                    transform: `translate(${block.x}px, ${block.y}px) ${
                      // block.delete
                      //   ? block.anchor == 'LEFT' || block.anchor == 'RIGHT'
                      //     ? `scaleX(0)`
                      //     : `scaleY(0)`
                      //   : ''
                      ''
                    }`,
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
          {/*          <button
            style={{ zIndex: 1000, position: 'absolute', top: 250, left: 250 }}
          >
            Split
          </button>
 */}
        </>
      )}
    </div>
  );
}

function App() {
  // const [state, setState] = useState<UIBlock[]>(
  //   buffer.map((block) => ({
  //     h: block.h,
  //     w: block.w,
  //     x: 0,
  //     y: 0,
  //   }))
  // );

  /*
  useEffect(() => {
    setTimeout(() => {
      setState(buffer);
    }, 2000);
  });
 */
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
