/* 
    用于展示matter-js 的基本用法    ww
*/
const { Engine, Render, World, Bodies, Runner, Body, Events } = Matter;

// window.innerHeight and window.innerWidth 用于捕捉目前你所用的电脑的屏幕大小
const width = window.innerWidth;
const height = window.innerHeight;

// 横向与纵向所拥有的行数与列数
// cellsVertical 是 number of rows
const cellsVertical = 15;
// cellsHorizontal 是 number of cols
const cellsHorizontal = 15;

// 每一个小cell的宽和高
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
// 取消y方向的重力
engine.world.gravity.y = 0;
const { world } = engine;

// 加入整个画布
const render = Render.create({
	// 在哪里添加canvas和canvas的高度宽度
	element: document.body,

	engine: engine,
	options: {
		width,
		height,
		wireframes: false
	}
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Add walls(rectange) to canvas 在画布上添加边界,指四周的边界
const Walls = [
	Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
	Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
	Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
	Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];
World.add(world, Walls);

/* Maze Generation */

// Take an array and randomly reorder all elements inside it
const randomizeArr = arr => {
	let counter = arr.length;
	while (counter > 0) {
		let index = Math.floor(Math.random() * counter);
		counter--;
		//swap arr[index] and arr[counter]
		let temp = arr[index];
		arr[index] = arr[counter];
		arr[counter] = temp;
	}
	return arr;
};

// Create 3x3 maze array
const grid = Array(cellsVertical)
	.fill(null)
	.map(() => {
		return Array(cellsHorizontal).fill(false);
	});

const horizontals = Array(cellsVertical - 1)
	.fill(null)
	.map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
	.fill(null)
	.map(() => Array(cellsHorizontal - 1).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startCol = Math.floor(Math.random() * cellsHorizontal);

const mazeGeneration = (row, col) => {
	// If I have visited this cell at [row, column], return early
	if (grid[row][col]) {
		return;
	}

	// Mark this cell as visited( change false in grid array to true)
	grid[row][col] = true;

	// Assemble random-ordered list of neighbor
	let neighbors = randomizeArr([
		[row - 1, col, "up"],
		[row, col + 1, "right"],
		[row + 1, col, "down"],
		[row, col - 1, "left"]
	]);

	// For each neighbor...
	for (let neighbor of neighbors) {
		const [neighborRow, neighborCol, direction] = neighbor;

		// 1)If that neighbor is out of bound
		if (
			neighborRow < 0 ||
			neighborRow >= cellsVertical ||
			neighborCol < 0 ||
			neighborCol >= cellsHorizontal
		) {
			continue;
		}
		// 2)If we have visited to that neighbor, continue to next neighbor
		else if (grid[neighborRow][neighborCol]) {
			continue;
		}
		// 3)Remove a wall from either horizontal array or vertical array
		// 根据在neighbors arr中存储的方向来确定到底改变 verticals/horizontals arr以及怎么改变
		else {
			if (direction === "right") {
				verticals[row][col] = true;
			} else if (direction === "left") {
				verticals[row][col - 1] = true;
			} else if (direction === "up") {
				horizontals[row - 1][col] = true;
			} else if (direction === "down") {
				horizontals[row][col] = true;
			}
		}

		// 4)Visit that next cell
		// 走入这个neighbor并对其运行同样的code(递归)
		mazeGeneration(neighborRow, neighborCol);
	}
};
// mazeGeneration(startRow,startCol);

// Create the inside structures of canvas according to the verticals array and horizontals array
// If the value is true, it means no walls, else there will be a wall
const wallGeneration = () => {
	// Add horizontal wall
	horizontals.forEach((rows, rowIndex) => {
		rows.forEach((isWall, colIndex) => {
			if (!isWall) {
				const wall = Bodies.rectangle(
					unitLengthX * colIndex + unitLengthX / 2, // The X position of rectangle center point
					unitLengthY * 1 + rowIndex * unitLengthY, // The Y position of rectangle center point
					unitLengthX, // width of rectangle we are creating
					5, // height of rectangle we are creating
					{ isStatic: true, label: "wall", render: {fillStyle: "#996633"} }
				);
				World.add(world, wall);
			}
		});
	});
	// Add vertical wall
	verticals.forEach((rows, rowIndex) => {
		rows.forEach((isWall, colIndex) => {
			if (!isWall) {
				const wall = Bodies.rectangle(
					unitLengthX + colIndex * unitLengthX,
					unitLengthY * rowIndex + unitLengthY / 2,
					5,
					unitLengthY,
					{ isStatic: true, label: "wall", render: {fillStyle: "#996633"} }
				);
				World.add(world, wall);
			}
		});
	});
};

// 创建终止位置的goal
const goalGeneration = () => {
	World.add(
		world,
		Bodies.rectangle(
			width - unitLengthX / 2,
			height - unitLengthY / 2,
			unitLengthX / 2,
			unitLengthY / 2,
			{
				isStatic: true,
                label: "goal",
                render: {
                    fillStyle: "#c2c2d6"
                }
			}
		)
	);
};

// 创建起始位置的小球

let ball;
const ballGeneration = () => {
	const radius = Math.min(unitLengthX, unitLengthY) / 4;
	ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, radius, {
        label: "ball",
        render: {
            fillStyle: "#66ffff"
        }
	});
	World.add(world, ball);
};

mazeGeneration(startRow, startCol);
wallGeneration();
ballGeneration();
goalGeneration();

document.addEventListener("keydown", event => {
	// x与y坐标方向的速度
	const { x, y } = ball.velocity;
	if (event.keyCode === 87 || event.keyCode === 38) {
		// 在x,y帮助下设置各个方向的速度
		Body.setVelocity(ball, { x, y: y - 5 });
	}
	// d
	if (event.keyCode === 68 || event.keyCode === 39) {
		Body.setVelocity(ball, { x: x + 5, y });
	}
	// s
	if (event.keyCode === 83 || event.keyCode === 40) {
		Body.setVelocity(ball, { x, y: y + 5 });
	}
	// a
	if (event.keyCode === 65 || event.keyCode === 37) {
		Body.setVelocity(ball, { x: x - 5, y });
	}
});

// 创造当ball 到达终点时的event
// 当发生任何碰撞时callback就会被调用
Events.on(engine, "collisionStart", event => {
	// label ball 与 goal 代表移动物体与终点,只有当这两个物体发生碰撞时才能判断为成功
	const labels = ["ball", "goal"];
	event.pairs.forEach(collision => {
		if (
			labels.includes(collision.bodyA.label) &&
			labels.includes(collision.bodyB.label)
		) {
            console.log(document.querySelector(".winner"));
            document.querySelector(".winner").classList.remove("hidden");
			// 当与goal碰撞时重力回归
			engine.world.gravity.y = 1;
			// 使所有label为 wall的segment都随重力掉落
			world.bodies.forEach(ele => {
				if (ele.label === "wall") {
					Body.setStatic(ele, false);
				}
            });
            
		}
	});
});
