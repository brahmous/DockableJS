import { useEffect, useRef, useState, version } from 'react';
import './App.css';
import {
  getSplitAnimationState,
  SplitType,
  UITree,
  type UIBlock,
} from './Float';

// const uitree: UITree = new UITree(500, 500);
// uitree.Split(SplitType.HORIZONTAL, { x: 200, y: 200 });
// uitree.Split(SplitType.VERTICAL, { x: 200, y: 300 });
// uitree.Split(SplitType.VERTICAL, { x: 275, y: 300 });

let newUiTree = new UITree(0, 0);

function FloatComponent() {
  const animationDuration = 0.5;
  // const animationDuration = 5;
  const [state, setState] = useState<'loading' | 'page'>('loading');
  const [blocks, setBlocks] = useState<UIBlock[]>([]);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    newUiTree = new UITree(ref.current!.clientWidth, ref.current!.clientHeight);
    newUiTree.Split(SplitType.HORIZONTAL, { x: 200, y: 200 });
    newUiTree.Split(SplitType.VERTICAL, { x: 200, y: 300 });
    newUiTree.Split(SplitType.VERTICAL, { x: 275, y: 300 });
    const initialBlocks = newUiTree.RenderLayout();
    setBlocks(initialBlocks);
    setState('page');
  }, []);

  return (
    <div
      style={{
        // background: 'green',
        position: 'relative',
        flexGrow: 1,
      }}
      ref={ref}
    >
      <div
        style={{
          position: 'absolute',
          width: 100,
          height: 100,
          border: '2px solid red',
        }}
      ></div>
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
