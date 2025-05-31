// R = 0, B = 1, Y = 2
// Cycle: R -> B -> Y -> R

function solve(initialState, threshold) {

    const generateNeighbours = function (node) {
        const neighbours = []
        for (let i = 0; i < 6; i++) {
            if (i == node.playerPos) continue;
            let neighbourState = node.state.map(
                (a, j) => (
                    // Only changes neighbour of selected node
                    [1, -1, 5, -5].includes(i - j) ? (a + 1) % 3 : a
                )
            );
            neighbours.push([neighbourState, i]);
        }
        return neighbours;
    }

    const isSolved = function(node) {
        const dict = [0, 0, 0];
        for (let item of node.state) {
            dict[item]++;
            if (dict[item] >= threshold) return true;
        }
        return false;
    }

    const initialNode = {
        state: initialState,
        playerPos: -1,
    }

    // Solve the puzzle using BFS
    const visited = new Set()
    const queue = []
    queue.push([
        initialNode, 
        [] // Stores previous states
    ]);

    while (queue.length > 0) {
        let [node, history] = queue.shift();
        let nodeStr = `${node.state.join(" ")} ${node.playerPos}`; 

        if (!visited.has(nodeStr)) {
            visited.add(nodeStr);
            if (isSolved(node)) {
                return history.concat(node);
            }

            const newHistory = history.concat(node);
            const neighbours = generateNeighbours(node);
            for (let neighbour of neighbours) {
                const nextNode = [neighbour, newHistory];
                Q.push(nextNode);
            }
        }
    }
    return null;
}

