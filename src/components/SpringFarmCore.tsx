import React, { useState, useReducer, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { SidePane } from './SidePane'
import { Canvas } from './Canvas'
import { AtomClickHandler } from './Atom'
import { SpringClickHandler } from './Spring'

interface Props {
}

export type Particle = {
  mass: number
  x: number
  y: number
  vx: number
  vy: number
  fx: number
  fy: number
  color?: string
}

export type Spring = {
  p1: number
  p2: number
  req: number
  k: number
}

export type State = {
  frame: number
  particles: Particle[]
  springs: Spring[]
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
    { mass: 1, x: -30, y: -20, vx: +20, vy: 0, fx: 0, fy: 0, color: 'red' },
    { mass: 1, x: +30, y: -20, vx: -20, vy: 0, fx: 0, fy: 0, color: 'blue' },
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

export type Mode =
  | { mode: 'PLAY', pause: boolean }
  | { mode: 'DEFAULT' }
  | { mode: 'ADD_ATOM' }
  | { mode: 'ADD_SPRING', endpointAtomId?: number }
  | { mode: 'DELETE' }

export const SpringFarmCore = ({ ...props }: Props) => {
  const [initialState, setInitialState] = useState(copyState(defaultInitialState))
  const [state, update] = useReducer(reducer, copyState(initialState))
  //const [play, setPlay] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

  const [cursorPosition, setCursorPosition] = useState<DOMPoint>(new DOMPoint(0, 0))

  const modeController = (prevMode: Mode, nextMode: Mode): Mode => {
    if (prevMode.mode !== nextMode.mode) {
      update({ type: 'reset', state: initialState })
    }
    //if (nextMode.mode !== 'PLAY') setPlay(false)
    return nextMode
  }
  const [appMode, setAppMode] = useReducer(modeController, { mode: 'DEFAULT' })

  const [selectedAtomIds, setSelectedAtomIds] = useState<number[]>([])
  const [selectedSpringIds, setSelectedSpringIds] = useState<number[]>([])

  useEffect(() => {
    if (appMode.mode !== 'PLAY' || appMode.pause) return
    const timer = setInterval(update, 50)
    console.log('setInterval', timer)
    return () => clearInterval(timer)
  }, [appMode])

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = svgRef.current
    if (!svg) return
    const { clientX, clientY } = event

    const point = svg.createSVGPoint()
    point.x = clientX
    point.y = clientY
    const p = point.matrixTransform(svg.getScreenCTM()?.inverse())

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

    if (appMode.mode === 'ADD_ATOM') {
      const newInitialState = copyState(initialState)
      newInitialState.particles.push({ mass: 1, x: p.x, y: p.y, vx: 0, vy: 0, fx: 0, fy: 0 })
      setInitialState(newInitialState)
      update({ type: 'reset', state: newInitialState })
    }

    svgRef.current?.focus()
    if (event.target === event.currentTarget) setSelectedAtomIds([])
  }

  const handleKeyPress = (event: React.KeyboardEvent<SVGSVGElement>) => {
    const { key } = event
    console.log('handleKeyPress', key)

    if (key === ' ') {
      if (appMode.mode !== 'PLAY' || appMode.pause) {
        setAppMode({ mode: 'PLAY', pause: false })
      }
      
      if(appMode.mode ==='PLAY' && !appMode.pause){
        setAppMode({ mode: 'PLAY', pause: true })
      }
    }

    if (key === 'q') {
      setAppMode({ mode: 'DEFAULT' })
    }

    if (key === 'a') {
      setAppMode({ mode: 'ADD_ATOM' })
    }
    if (key === 's') {
      setAppMode({ mode: 'ADD_SPRING' })
    }
  }

  const handleAtomClick: AtomClickHandler = (atomId, event) => {
    console.log('clicked:', atomId)
    if (appMode.mode === 'DEFAULT') {
      if (selectedAtomIds.find(id => atomId === id) === undefined) setSelectedAtomIds([atomId])
    }

    if (appMode.mode === 'ADD_SPRING') {
      const endpointAtomId = appMode.endpointAtomId
      if (endpointAtomId === undefined) {
        setAppMode({ mode: 'ADD_SPRING', endpointAtomId: atomId })
      } else if (atomId !== endpointAtomId) {
        console.log('create spring between:', endpointAtomId, atomId)
        setAppMode({ mode: 'ADD_SPRING', endpointAtomId: atomId })

        const newInitialState = copyState(initialState)
        newInitialState.springs.push({ k: 1, req: 60, p1: endpointAtomId, p2: atomId })
        setInitialState(newInitialState)
        update({ type: 'reset', state: newInitialState })
      }
    }
  }

  const handleSpringClick: SpringClickHandler = (springId, event) => {
    console.log('clicked:', springId)
    if (appMode.mode === 'DEFAULT') {
      if (selectedSpringIds.find(id => springId === id) === undefined) setSelectedSpringIds([springId])
    }
  }

  const handleEditAtom = (atomId: number, atom: Particle) => {
    const newInitialState = copyState(initialState)
    newInitialState.particles[atomId] = atom
    setInitialState(newInitialState)
    update({ type: 'reset', state: newInitialState })
  }

  const handleEditSpring = (springId: number, spring: Spring) => {
    const newInitialState = copyState(initialState)
    newInitialState.springs[springId] = spring
    setInitialState(newInitialState)
    update({ type: 'reset', state: newInitialState })
  }

  return (
    <Layout className="layout">
      <SidePane
        state={state}
        appMode={appMode}
        setAppMode={setAppMode}
        selectedAtomIds={selectedAtomIds}
        handleEditAtom={handleEditAtom}
        selectedSpringIds={selectedSpringIds}
        handleEditSpring={handleEditSpring}
      />
      <Canvas
        state={state}
        appMode={appMode}
        setAppMode={setAppMode}
        selectedAtomIds={selectedAtomIds}
        svgRef={svgRef}
        handleMouseMove={handleMouseMove}
        handleMouseClick={handleMouseClick}
        handleKeyPress={handleKeyPress}
        handleAtomClick={handleAtomClick}
        handleSpringClick={handleSpringClick}
        cursorPosition={cursorPosition}
      />
    </Layout>
  )
}

const Layout = styled.div`
  position: relative;
  display: flex;
  height: 100%;

  .canvas {
    flex: 1 1 auto;
  }
`
