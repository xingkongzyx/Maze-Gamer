/* 
    用于展示matter-js 的基本用法    ww
*/
const {
	Engine,
	Render,
	World,
	Bodies,
	Runner,
	MouseConstraint,
	Mouse
} = Matter;

const width = 800;
const height = 600;

const engine = Engine.create();
const { world } = engine;
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

// Click and drag
World.add(
	world,
	MouseConstraint.create(engine, {
		mouse: Mouse.create(render.canvas)
	})
);
// Add a shape
// 前两个参数代表center of shape所在的位置(x,y)
// 后两个参数代表这个shape的 width and height
// isStatic代表这个shape是否是静止的
// const shape = Bodies.rectangle(200, 200, 50, 50, {
// 	isStatic: true
// });
// World.add(world, shape);

// Add walls(rectange) to canvas
const Walls = [
	Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),
	Bodies.rectangle(0, 300, 40, 600, { isStatic: true }),
	Bodies.rectangle(400, 600, 800, 40, { isStatic: true }),
	Bodies.rectangle(800, 300, 40, 600, { isStatic: true })
];
World.add(world, Walls);

// Add shapes
for (let i = 0; i < 30; i++) {
	if (Math.random() > 0.5) {
		World.add(
			world,
			Bodies.rectangle(
				Math.random() * width,
				Math.random() * height,
				50,
				50
			)
		);
	} else {
		World.add(
			world,
			Bodies.circle(Math.random() * width, Math.random() * height, 10, 10)
		);
	}
}
