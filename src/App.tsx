import { useEffect, useRef, useState } from 'react';
import './App.css';
import { SplitType, UITree, type UIBlock } from './Float';

// const uitree: UITree = new UITree(500, 500);
// uitree.Split(SplitType.HORIZONTAL, { x: 200, y: 200 });
// uitree.Split(SplitType.VERTICAL, { x: 200, y: 300 });
// uitree.Split(SplitType.VERTICAL, { x: 275, y: 300 });

let newUiTree = new UITree(0, 0);

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
    newUiTree = new UITree(ref.current!.clientWidth, ref.current!.clientHeight);
    newUiTree.Split(SplitType.HORIZONTAL, { x: 200, y: 200 });
    newUiTree.Split(SplitType.VERTICAL, { x: 200, y: 300 });
    newUiTree.Split(SplitType.VERTICAL, { x: 275, y: 300 });
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

    dragController.hideHTML5DragFeedback = (
      e: React.DragEvent<HTMLDivElement>
    ) => {
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
        e.dataTransfer.setDragImage(new Image(), 0, 0);
        dragController.showHTML5DragFeedback!('hello', e);
        dragStartPoint.current = { x: e.clientX, y: e.clientY };
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
        if (deletePoint) {
          newUiTree.Delete(deletePoint);
          setBlocks(newUiTree.RenderLayout());
          requestAnimationFrame(() => {
            newUiTree.Split(SplitType.VERTICAL, { x: e.clientX, y: e.clientY });
            setBlocks(newUiTree.RenderLayout());
          });

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
                    background: colors[index],
                  }}
                  key={index}
                  draggable={true}
                >
                  {block.id}
                </div>
              )
          )}
          <button
            style={{ zIndex: 1000, position: 'absolute', top: 250, left: 250 }}
            onClick={() => {
              // newUiTree.Split(SplitType.VERTICAL, { x: 600, y: 400 });
              // const newBlocks = newUiTree.RenderLayout();
              // const animationBlocks = getSplitAnimationState(
              //   blocks,
              //   newBlocks
              // );
              // console.log({animationBlocks});
              // setBlocks(animationBlocks);
              // requestAnimationFrame(()=>{
              //    setBlocks(newBlocks);
              // })
              requestAnimationFrame(() => {
                newUiTree.Delete({ x: 250, y: 500 });
                setBlocks([...newUiTree.RenderLayout()]);
              });

              requestAnimationFrame(() => {
                newUiTree.Split(SplitType.VERTICAL, { x: 275, y: 300 });
                setBlocks(newUiTree.RenderLayout());
              });
            }}
          >
            Split
          </button>
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
