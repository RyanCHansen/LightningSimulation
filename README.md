# LightningSimulation

Solo project using a simple game engine based in JavaScript which outputs its drawing to a HTML5 canvas. 

The objective of this simulation is for a continuous lightning chain to reach from the blue 'starting node' to the red 'ending node' in a single strike. The starting node will emit a single jump to a random nearby orb on a set time cycle. Each lightning strike on node will generate 25% 'power' to that node which will slowly drain over time. When a node is struck by lightning and its power is over a certain threshold, it will add another 'jump' for that lightning strike (25%+ adds 1 jump, 50%+ adds 2, 75%+ adds 3). More rules of this simulation are explained on the starting screen of the simulation (see link below!).

Used a simple algorithm to recursively draw the 'lightning bolts' between each node which makes each bolt unique every strike!


Visit https://ryanchansen.github.io/LightningSimulation/ to see the code in action!

Game engine sourced from Google engineer Seth Ladd: 
https://www.youtube.com/watch?v=yEocRtn_j9s
