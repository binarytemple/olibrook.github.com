---
title: Getting to grips with the HTML5 Canvas
description: Time to start getting my HTML5 skills up to scratch, starting with the canvas

layout: post
categories: [Fun]
---

I switched to the HTML5 doctype quite a while ago and have used some
of the new HTML5 elements (hgroup, article, nav, etc.), but haven't yet had the opportunity to use any of the more exciting HTML5 features professionally.

This post is a collection of small experiments I've been working on using the HTML5 canvas – bear in mind that it's been a while since I've done any kind of graphics programming whatsoever, so this is really new to me!

Here is a (really) early little experiment I knocked up one Thursday afternoon:

[HTML Canvas Demo](/experiments/canvas-demo-2.html)

The next two experiments are a little more advanced - I've been working on a simple particle system which allows you to create pretty designs using particle emitters and gravity sources. The efficient rendering ideas are entirely pinched from [Jarrod Overson](http://jarrodoverson.com/), everything else (including the inaccurate physics simulation!) is my own.

[Jittery Particle Demo](/experiments/canvas-demo-3.html) - uses jittery particle emitters which emit particles at randomised angles within a certain range.

[Regular Particle Demo](/experiments/canvas-demo-4.html) - uses a particle emitter which emits particles at evenly-spaced angles, useful for creating orderly, spirograph-like designs.

I'd be interested in updating the simulation I have so far to include more accurate physics (my brainy friend Rory has suggested using verlet integration or RK4) or perhaps adding some basic collision detection using quadtrees for efficiency.

