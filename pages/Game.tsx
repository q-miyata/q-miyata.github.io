import {
  useState,
  memo,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from 'react';
import { styles } from './_app.styles';
import Board from './Board';
import {
  boardSizeAtom,
  countTimeAtom,
  currentTurnAtom,
  playerSymbolAtom,
} from './atoms';
import { useAtom } from 'jotai';
import { gameStateAtom, isXNextAtom, socketAtom } from './atoms';

type HistoryObject = {
  squares: ('X' | 'O' | null)[];
  index: number | undefined;
};

const Game = () => {
  const [countTime, setCountTime] = useAtom(countTimeAtom);
  const [winner, setWinner] = useState<'O' | 'X' | null>(null);

  //対戦モード用のAtom
  const [squares, setSquares] = useAtom(gameStateAtom);
  const [socket] = useAtom(socketAtom);

  //ボード選択
  const [boardSize, setBoardSize] = useAtom(boardSizeAtom);

  const [playerSymbol, setPlayerSymbol] = useAtom(playerSymbolAtom);
  const [currentTurn, setCurrentTurn] = useAtom(currentTurnAtom);

  const handleBoardSelection = useCallback(
    (size: number) => {
      if (!socket) {
        return;
      }
      socket.emit('selectboard', { boardSize: size });
    },
    [setBoardSize, socket]
  );

  const [history, setHistory] = useState<HistoryObject[]>([
    {
      //boardSize がnull だった場合　0を返す
      squares: Array(Math.pow(boardSize || 0, 2)).fill(null),
      index: undefined,
    },
  ]);
  const [currentMove, setCurrentMove] = useState<number>(0);

  //これをサーバーに送りたい。currentMoveをサーバで管理しないと正しく反映されない。
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  setSquares(currentSquares);

  useEffect(() => {
    if (!socket) {
      return;
    }
    console.log('useEffect!!!4544');
    // console.log(socket);

    socket.on('setboard', ({ boardSize }) => {
      //undefinedが出たときの対策
      if (setBoardSize) {
        console.log(`setting board size to `, boardSize);
        setBoardSize(boardSize);
      }
    });

    socket.on('setplayer', ({ playerSymbol }) => {
      console.log(99999);
      //undefinedが出たときの対策
      if (setPlayerSymbol) {
        console.log(`setting playerSymbol as `, playerSymbol);
        setPlayerSymbol(playerSymbol);
      }
    });

    socket.on('setturn', ({ turn }) => {
      console.log(99999);
      //undefinedが出たときの対策
      if (setCurrentTurn) {
        console.log(`setting turn as `, turn); //ここ再レンダリングがすごい
        setCurrentTurn(turn);
      }
    });

    //const xIsNextCurrentMove = {xIsNext,currentMove};

    socket.emit('send_xIsNextCurrentMove', { xIsNext, currentMove });
  }, [socket, xIsNext, currentMove]);

  const handlePlay = useCallback(
    (nextSquares: ('X' | 'O' | null)[], i: number) => {
      const nextHistory = [
        ...history.slice(0, currentMove + 1),
        { squares: nextSquares, index: i },
      ];
      setHistory(nextHistory);

      setCurrentMove(nextHistory.length - 1);

      setSquares(nextSquares);

      //appContaintsから送ってるからここは用無し
      // if (socket) {
      //   socket.emit('squares', nextSquares);
      // }
    },
    [
      history,
      currentMove,
      setHistory,
      setCurrentMove,
      setSquares,
      // setIsXNext,
      socket,
      //isXNext,
    ]
  );

  const jumpTo = useCallback((nextMove: number) => {
    setWinner(null);
    setCurrentMove(nextMove);
    //これで同じプレーヤーの履歴に帰っても秒数が回復する
    if (setCountTime) {
      setCountTime(15);
    }
  }, []);

  const resetPlayers = () => {
    socket.emit('resetplayers', {});
  };

  const moves = useMemo(() => {
    return history.map((step, move) => {
      let description;
      if (boardSize) {
        const coordinate = indexToCoordinate(step.index, boardSize);

        if (move > 0) {
          description = `Go to move #${move}  ${coordinate}`;
        } else if (move === 0) {
          description = 'Go to game start';
        } else {
          description = '';
        }
        return (
          <li key={move}>
            <button css={styles.description} onClick={() => jumpTo(move)}>
              {description}
            </button>
          </li>
        );
      }
    });
  }, [history, boardSize, jumpTo]);

  const Move = useMemo(() => {
    return (
      <div css={styles.gameInfo}>
        <ol>{moves}</ol>
      </div>
    );
  }, [moves]);

  return (
    <div css={styles.pageContainer}>
      <div>
        <div>
          {boardSize === null ? (
            <div>
              <button
                css={styles.button}
                onClick={() => handleBoardSelection(3)}
              >
                board ３✖︎３
              </button>
              <button
                css={styles.button}
                onClick={() => handleBoardSelection(4)}
              >
                board ４✖︎４
              </button>
            </div>
          ) : (
            <Board
              xIsNext={xIsNext}
              squares={currentSquares}
              onPlay={handlePlay}
              winner={winner}
              setWinner={setWinner}
              size={boardSize}
              // countTime={countTime}
              // setCountTime={setCountTime}
            />
          )}
        </div>
      </div>
      {Move}
      {/* <div css={styles.gameInfo}>
        <ol>{moves}</ol>
      </div> */}
      <button onClick={resetPlayers}>Reset Players</button>
    </div>
  );
};

export default memo(Game);

//index refers to step.index in Board function
//size refers to boardSize in Board function

function indexToCoordinate(
  index: number | undefined,
  size: number | null
): String {
  let horizontalLine = '';
  let verticalLine = '';
  if (index === undefined) {
    return '';
  }
  if (size === 3) {
    //Determine horizontal line
    let row = ['1', '2', '3'];

    horizontalLine = row[Math.floor(index / 3)];

    //Determin vertacal line
    if (index % 3 === 0) {
      verticalLine = 'A';
    } else if (index % 3 === 1) {
      verticalLine = 'B';
    } else if (index % 3 === 2) {
      verticalLine = 'C';
    } else {
      return '';
    }
  } else if (size === 4) {
    let row = ['1', '2', '3', '4'];
    let column = ['A', 'B', 'C', 'D'];
    verticalLine = column[index % 4];
    horizontalLine = row[Math.floor(index / 4)];
  } else if (size === null) {
    return '';
  }

  return verticalLine + horizontalLine;
}
// export default memo(function Game() {
//   const [winner, setWinner] = useState<'O' | 'X' | null>(null);
//   const [countTime, setCountTime] = useState<number>(5);

//   //ボード選択
//   const [boardSize, setBoardSize] = useState<number | null>(null);
//   const handleBoardSelection = (size: number): void => {
//     setBoardSize(size);
//   };

//   const [history, setHistory] = useState<HistoryObject[]>([
//     {
//       //boardSize がnull だった場合　0を返す
//       squares: Array(Math.pow(boardSize || 0, 2)).fill(null),
//       index: undefined,
//     },
//   ]);
//   const [currentMove, setCurrentMove] = useState<number>(0);

//   const xIsNext = currentMove % 2 === 0;
//   const currentSquares = history[currentMove].squares;
//   function handlePlay(nextSquares: ('X' | 'O' | null)[], i: number) {
//     const nextHistory = [
//       ...history.slice(0, currentMove + 1),
//       { squares: nextSquares, index: i },
//     ];

//     setHistory(nextHistory);
//     setCurrentMove(nextHistory.length - 1);
//   }

//   function jumpTo(nextMove: number): void {
//     setWinner(null);
//     setCurrentMove(nextMove);
//     //これで同じプレーヤーの履歴に帰っても秒数が回復する
//     setCountTime(7);
//   }

//   const moves = history.map((step, move) => {
//     let description;

//     const coordinate = indexToCoordinate(step.index, boardSize);

//     if (move > 0) {
//       description = `Go to move #${move}  ${coordinate}`;
//     } else if (move === 0) {
//       description = 'Go to game start';
//     } else {
//       description = '';
//     }
//     //ここでsetTimeしたい
//     return (
//       <li key={move}>
//         <button css={styles.description} onClick={() => jumpTo(move)}>
//           {description}
//         </button>
//       </li>
//     );
//   });

//   return (
//     <div css={styles.pageContainer}>
//       <div>
//         <div>
//           {boardSize === null ? (
//             <div>
//               <button
//                 css={styles.button}
//                 onClick={() => handleBoardSelection(3)}
//               >
//                 board ３✖︎３
//               </button>
//               <button
//                 css={styles.button}
//                 onClick={() => handleBoardSelection(4)}
//               >
//                 board ４✖︎４
//               </button>
//             </div>
//           ) : boardSize === 3 ? (
//             <Board
//               xIsNext={xIsNext}
//               squares={currentSquares}
//               onPlay={handlePlay}
//               winner={winner}
//               setWinner={setWinner}
//               size={boardSize}
//               countTime={countTime}
//               setCountTime={setCountTime}
//             />
//           ) : (
//             <YonmokuBoard
//               xIsNext={xIsNext}
//               squares={currentSquares}
//               onPlay={handlePlay}
//               winner={winner}
//               setWinner={setWinner}
//               size={boardSize}
//               countTime={countTime}
//               setCountTime={setCountTime}
//             />
//           )}
//         </div>
//       </div>
//       <div css={styles.gameInfo}>
//         <ol>{moves}</ol>
//       </div>
//     </div>
//   );
// });

// //index refers to step.index in Board function
// //size refers to boardSize in Board function

// function indexToCoordinate(
//   index: number | undefined,
//   size: number | null
// ): String {
//   let horizontalLine = '';
//   let verticalLine = '';
//   if (index === undefined) {
//     return '';
//   }
//   if (size === 3) {
//     //Determine horizontal line
//     let row = ['1', '2', '3'];

//     horizontalLine = row[Math.floor(index / 3)];

//     //Determin vertacal line
//     if (index % 3 === 0) {
//       verticalLine = 'A';
//     } else if (index % 3 === 1) {
//       verticalLine = 'B';
//     } else if (index % 3 === 2) {
//       verticalLine = 'C';
//     } else {
//       return '';
//     }
//   } else if (size === 4) {
//     let row = ['1', '2', '3', '4'];
//     let column = ['A', 'B', 'C', 'D'];
//     verticalLine = column[index % 4];
//     horizontalLine = row[Math.floor(index / 4)];
//   } else if (size === null) {
//     return '';
//   }

//   return verticalLine + horizontalLine;
// }
