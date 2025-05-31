import { useState } from 'react'
import './App.css'

// Red (Kita) = 0, Blue (Ryo) = 1, Yellow (Nijika) = 2
// Cycle: R -> B -> Y -> R

type Node = {
  state: Array<PuzzleNodeState>,
  playerPos: number
}

type QueueNode = [Node, Array<Node>]
type PuzzleNodeState = 0 | 1 | 2;

function PuzzleState({
  state,
  mutable,
  mini = false,
  handler = (_) => {},
  highlighted = -1
}: { 
  state: PuzzleNodeState[], 
  mutable: boolean, 
  mini?: boolean,
  handler?: (n: number) => void
  highlighted?: number
}) {

  return (
    <div className={`puzzle-state ${mini && "mini"}`}>
      {
        state.map((x: PuzzleNodeState, i: number) => {
          const colour = ["red", "blue", "yellow"][x]
          if (mutable) {
            return (
              <button 
                key={i} 
                className={`puzzle-node btn-${i} ${colour} ${highlighted === i && "highlighted"}`}
                onClick={() => handler(i)}></button>
            )
          }
          return (
            <div key={i} className={`puzzle-node btn-${i} ${colour} ${highlighted === i && "highlighted"}`}></div>
          )
        })
      }
    </div>
  )
}

function App() {

  function solveFromState(initialState: PuzzleNodeState[], threshold: number) {

    const generateNeighbours = function (node: Node) {
        const neighbours = []
        for (let i = 0; i < 6; i++) {
            if (i == node.playerPos) continue;
            const neighbourState = node.state.map(
                (a, j) => (
                    // Only changes neighbour of selected node
                    [1, -1, 5, -5].includes(i - j) ? (a + 1) % 3 : a
                ) as PuzzleNodeState
            );
            neighbours.push({
              state: neighbourState, 
              playerPos: i
            });
        }
        return neighbours;
    }

    const isSolved = function(node: Node) {
        const dict = [0, 0, 0];
        for (const item of node.state) {
            dict[item]++;
            if (dict[item] >= threshold) return true;
        }
        return false;
    }

    const initialNode: Node = {
      state: initialState,
      playerPos: -1,
    }

    // Solve the puzzle using BFS
    const visited = new Set()
    const queue: QueueNode[] = []
    queue.push([
        initialNode, 
        [] // Stores previous states
    ]);

    while (queue.length > 0) {
      const shifted = queue.shift();
      if (!shifted) continue;

      const [node, history] = shifted;
      const nodeStr = `${node.state.join(" ")} ${node.playerPos}`; 

      if (!visited.has(nodeStr)) {
        visited.add(nodeStr);
        if (isSolved(node)) {
          return history.concat(node);
        }

        const newHistory = history.concat(node);
        const neighbours = generateNeighbours(node);
        for (const neighbour of neighbours) {
          const nextNode: QueueNode = [neighbour, newHistory];
          queue.push(nextNode);
        }
      }
    }
    return null;
  }

  const [initialState, setInitialState] = useState(new Array(6).fill(0) as PuzzleNodeState[]);
  const [threshold, setThreshold] = useState("4");
  const [solution, setSolution] = useState([] as Node[]);

  const updateState = function(index: number) {
    const newState = [...initialState];
    newState[index] = (newState[index] + 1) % 3 as PuzzleNodeState;
    setInitialState(newState);
  }

  const updateThreshold = function(val: string) {
    setThreshold(val);
  }

  const submitJob = function() {
    const val = Number(threshold);
    
    if (Number.isNaN(val)) {
      alert("Invalid threshold");
    } else {
      const solution = solveFromState(initialState, val);

      if (solution === null) {
        setSolution([]);     
        alert("No solution");
      } else {
        setSolution(solution);
      }
    }
  }

  return (
    <>  
      <div className="puzzle-selector-wrapper">
        <PuzzleState state={initialState} mutable={true} handler={updateState}/>
      </div>
      <p>
        Target: <input
            type="number"
            value={threshold}
            onChange={(e) => updateThreshold(e.target.value)}/> <button onClick={submitJob}>Solve!</button>
      </p>
      <div className="solution-wrapper">
        {solution.map((node, i) => {
          return (
            <div className="solution-card">
              <span>{i === solution.length - 1 ? "Done" : `Step ${i + 1}`}</span>
              <PuzzleState 
                key={i}
                state={node.state}
                mutable={false}
                highlighted={i < solution.length - 1 ? solution[i + 1].playerPos : -1}
                mini={true}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

export default App
