TankSimulator
=============
This [site](http://tank.bwhs.me) was made to simulate a tank robot responsive to a game controller. The site was then built into the workflow of a Robotics Institute for kids.  Along with the simulation was provided a programming pane in which the logic of the joystick response could be provided.

Custom Language
---------------
The language in which the joystick logic could be written was constructed to be as simple as possible for beginners. Essentially, it just consists of conditional branching and arithmetic.

```javascript
[leftJoyX>0->leftJoyY+leftJoyX,else->leftJoyY]
[leftJoyX>0->leftJoyY,else->leftJoyY-leftJoyX]
```

This chosen syntax was inspired by [John McCarthy](http://en.wikipedia.org/wiki/John_McCarthy_(computer_scientist)'s paper [Recursive Functions on Symbolic Expressions](http://www-formal.stanford.edu/jmc/recursive/node3.html). From this syntax for conditions as well as a couple primitive functions he axiomatized the Lisp language to the point of a bootstrapped interpreter.