import React, { useState, useReducer, useEffect, useRef } from 'react'

interface Props {
}

type Particle = {
  mass: number
  x: number
  y: number
  vx: number
  vy: number
  fx: number
  fy: number
  color?: string
}

type State = {
  frame: number
  particles: Particle[]
  springs: Spring[]
}

type Spring = {
  p1: number
  p2: number
  req: number
  k: number
}

const dt = 0.1
const dt_2 = dt / 2

function calcForce(particles: Particle[], springs: Spring[]): void {
  particles.forEach(particles => { particles.fx = particles.fy = 0 })
  springs.forEach(({ p1, p2, req, k }) => {
    const particle1 = particles[p1]
    const particle2 = particles[p2]
    const { x: x1, y: y1 } = particle1
    const { x: x2, y: y2 } = particle2
    const dx = x2 - x1
    const dy = y2 - y1
    const dist = Math.sqrt(dx * dx + dy * dy)
    const diff = dist - req
    const force = k * diff

    particle1.fx += force * dx / dist
    particle1.fy += force * dy / dist
    particle2.fx -= force * dx / dist
    particle2.fy -= force * dy / dist
  })
}

function reducer(state: State, action: any): State {
  if (action?.type === 'reset') {
    console.log('reset', action.state)
    return copyState(action.state)
  }

  // update velocity I
  state.particles.forEach(particle => {
    particle.vx += particle.fx / particle.mass * dt_2
    particle.vy += particle.fy / particle.mass * dt_2
  })

  // update position
  state.particles.forEach(particle => {
    particle.x += particle.vx * dt
    particle.y += particle.vy * dt
  })

  // update force
  calcForce(state.particles, state.springs)

  // update velocity II
  state.particles.forEach(particle => {
    particle.vx += particle.fx / particle.mass * dt_2
    particle.vy += particle.fy / particle.mass * dt_2
  })

  state.frame++
  return { ...state }
}

const defaultInitialState: State = {
  frame: 0,
  particles: [
    //{ mass: 1, x: -80, y: 0, vx: +20, vy: 0, fx: 0, fy: 0, color: 'red' },
    //{ mass: 1, x: -30, y: 0, vx: -20, vy: 0, fx: 0, fy: 0, color: 'blue' },
    //{ mass: 1, x: +30, y: 0, vx: 0, vy: 0, fx: 0, fy: 0, color: 'green' },
    //{ mass: 1, x: +80, y: 0, vx: 0, vy: 0, fx: 0, fy: 0, color: 'violet' },
    { mass: 1, x: -30, y: -20, vx: +20, vy: 1, fx: 0, fy: 0, color: 'red' },
    { mass: 1, x: +30, y: -20, vx: -20, vy: -1, fx: 0, fy: 0, color: 'blue' },
    { mass: 1, x: 0, y: +20, vx: 0, vy: 0, fx: 0, fy: 0, color: 'green' },
  ],
  springs: [
    { p1: 0, p2: 1, req: 60, k: 1 },
    { p1: 1, p2: 2, req: 50, k: 1 },
    { p1: 2, p2: 0, req: 50, k: 1 },
  ]
}

const copyState = (state: State): State => {
  return {
    frame: state.frame,
    particles: state.particles.map(particle => ({ ...particle })),
    springs: state.springs.map(spring => ({ ...spring })),
  }
}

export const SpringFarmCore = ({ ...props }: Props) => {
  const [initialState, setInitialState] = useState(copyState(defaultInitialState))
  const [state, update] = useReducer(reducer, copyState(initialState))
  const [play, setPlay] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

  const [cursorPosition, setCursorPosition] = useState<DOMPoint>(new DOMPoint(0, 0))
  const [addAtomMode, setAddAtomMode] = useState(false)

  useEffect(() => {
    if (!play) return
    const timer = setInterval(update, 50)
    console.log('setInterval', timer)
    return () => clearInterval(timer)
  }, [play])

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = svgRef.current
    if (!svg) return
    const { clientX, clientY } = event

    const point = svg.createSVGPoint()
    point.x = clientX
    point.y = clientY
    const p = point.matrixTransform(svg.getScreenCTM()?.inverse())

    //console.log('handleMouseMove', clientX, clientY, p)
    setCursorPosition(p)
  }

  const handleMouseClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = svgRef.current
    if (!svg) return
    const { clientX, clientY } = event

    const point = svg.createSVGPoint()
    point.x = clientX
    point.y = clientY
    const p = point.matrixTransform(svg.getScreenCTM()?.inverse())

    setCursorPosition(p)

    const newInitialState = copyState(initialState)
    newInitialState.particles.push({ mass: 1, x: p.x, y: p.y, vx: 0, vy: 0, fx: 0, fy: 0 })
    setInitialState(newInitialState)
    update({ type: 'reset', state: newInitialState })
  }

  const handleKeyPress = (event: React.KeyboardEvent<SVGSVGElement>) => {
    const { key } = event
    console.log('handleKeyPress', key)

    if (key == ' ') {
      if (play) {
        setPlay(false)
      } else {
        setPlay(true)
        setAddAtomMode(false)
      }
    }

    if (key == 'q') {
      setAddAtomMode(false)
    }

    if (event.key == 'a') {
      setPlay(false)
      setAddAtomMode(true)
      update({ type: 'reset', state: initialState })
    }
  }

  //console.log(state)
  svgRef.current?.focus()

  return (
    <>
      <svg
        viewBox="-100 -100 201 201"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        width="100vw" height="100%"
        ref={svgRef}
        onMouseMove={handleMouseMove}
        onClick={handleMouseClick}
        onKeyPress={handleKeyPress}
        tabIndex={0}
      >
        <Grid />

        {state.particles.map(({ x, y, color }, i) =>
          <circle key={i} cx={x} cy={y} r={3} fill={color ?? 'red'} />
        )}

        {addAtomMode && <circle cx={cursorPosition.x} cy={cursorPosition.y} r={3} fill={'rgba(70, 70, 70, 0.5)'} />}

      </svg>
      <button style={{ position: 'absolute', top: 0, left: 0 }}
        onClick={() => {
          setPlay(play => !play)
          setAddAtomMode(false)
        }}
      >
        {play ? 'STOP' : 'PLAY'}
      </button>
    </>
  )
}

const Grid = () => {
  const interval = 10
  const number = 20
  const ticks = Array(number * 2 + 1).fill(0).map((_, i) => (i - number) * interval)
  return (
    <>
      <line key={`ho`} x1={-10000} x2={10000} y1={0} y2={0} stroke="black" strokeWidth=".2" />
      <line key={`vo`} y1={-10000} y2={10000} x1={0} x2={0} stroke="black" strokeWidth=".2" />
      {ticks.map((v, i) =>
        <line key={`h${i}`} x1={-10000} x2={10000} y1={v} y2={v} stroke="gray" strokeWidth=".1" />
      )}
      {ticks.map((v, i) =>
        <line key={`v${i}`} y1={-10000} y2={10000} x1={v} x2={v} stroke="gray" strokeWidth=".1" />
      )}
    </>
  )
}