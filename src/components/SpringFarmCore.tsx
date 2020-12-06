import React, { useState, useReducer, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useSimulator, InitialState, Particle, Spring } from '../hooks/useSimulator'
import { SidePane } from './SidePane'
import { Canvas } from './Canvas'
import { AtomClickHandler } from './Atom'
import { SpringClickHandler } from './Spring'

const defaultInitialState: InitialState = {
  particles: [
    { id: 1, mass: 1, x: -30, y: -20, vx: +20, vy: 0, fx: 0, fy: 0 },
    { id: 2, mass: 1, x: +30, y: -20, vx: -20, vy: 0, fx: 0, fy: 0 },
    { id: 3, mass: 1, x: 0, y: +20, vx: 0, vy: 0, fx: 0, fy: 0 },
  ],
  springs: [
    { id: 1, atomId1: 1, atomId2: 2, req: 60, k: 1 },
    { id: 2, atomId1: 2, atomId2: 3, req: 50, k: 1 },
    { id: 3, atomId1: 3, atomId2: 1, req: 50, k: 1 },
  ]
}

export type Mode =
  | { mode: 'PLAY', pause: boolean }
  | { mode: 'DEFAULT' }
  | { mode: 'ADD_ATOM' }
  | { mode: 'ADD_SPRING', endpointAtomId?: number }
  | { mode: 'DELETE' }

export const SpringFarmCore = ({ ...props }) => {
  const { getInitialState, reset, propagate, state } = useSimulator(defaultInitialState)

  const svgRef = useRef<SVGSVGElement>(null)
  const [cursorPosition, setCursorPosition] = useState<DOMPoint>(new DOMPoint(0, 0))

  const modeController = (prevMode: Mode, nextMode: Mode): Mode => {
    if (prevMode.mode !== nextMode.mode) {
      reset()
    }
    return nextMode
  }
  const [appMode, setAppMode] = useReducer(modeController, { mode: 'DEFAULT' })

  const [selectedAtomIds, setSelectedAtomIds] = useState<number[]>([])
  const [selectedSpringIds, setSelectedSpringIds] = useState<number[]>([])

  useEffect(() => {
    if (appMode.mode !== 'PLAY' || appMode.pause) return
    const timer = setInterval(propagate, 50)
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
      const newAtomId = Math.max(0, ...state.particles.map(({ id }) => id)) + 1
      const newAtom = { id: newAtomId, mass: 1, x: p.x, y: p.y, vx: 0, vy: 0, fx: 0, fy: 0 }

      const newInitialState = getInitialState()
      newInitialState.particles.push(newAtom)
      reset(newInitialState)
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

      if (appMode.mode === 'PLAY' && !appMode.pause) {
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
    if (key === 'd') {
      setAppMode({ mode: 'DELETE' })
    }
  }

  const handleAtomClick: AtomClickHandler = (atomId, event) => {
    console.log('clicked:', atomId)
    if (appMode.mode === 'PLAY' || appMode.mode === 'DEFAULT') {
      if (selectedAtomIds.find(id => atomId === id) === undefined) setSelectedAtomIds([atomId])
    }

    if (appMode.mode === 'ADD_SPRING') {
      const endpointAtomId = appMode.endpointAtomId
      if (endpointAtomId === undefined) {
        setAppMode({ mode: 'ADD_SPRING', endpointAtomId: atomId })
      } else if (atomId !== endpointAtomId) {
        console.log('create spring between:', endpointAtomId, atomId)
        setAppMode({ mode: 'ADD_SPRING', endpointAtomId: atomId })

        const newInitialState = getInitialState()
        const atom1 = newInitialState.particles.find(({ id }) => id === endpointAtomId)
        const atom2 = newInitialState.particles.find(({ id }) => id === atomId)
        if (!atom1 || !atom2) return
        const dx = atom2.x - atom1.x
        const dy = atom2.y - atom1.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        const newSpringId = Math.max(0, ...state.springs.map(({ id }) => id)) + 1
        const newSpring = { id: newSpringId, k: 1, req: distance, atomId1: endpointAtomId, atomId2: atomId }

        newInitialState.springs.push(newSpring)
        reset(newInitialState)
      }
    }

    if (appMode.mode === 'DELETE') {
      const newInitialState = getInitialState()
      newInitialState.particles = newInitialState.particles.filter(({ id }) => id !== atomId)
      newInitialState.springs = newInitialState.springs.filter(({ atomId1, atomId2 }) => atomId1 !== atomId && atomId2 !== atomId)
      reset(newInitialState)
    }
  }

  const handleSpringClick: SpringClickHandler = (springId, event) => {
    console.log('clicked:', springId)
    if (appMode.mode === 'PLAY' || appMode.mode === 'DEFAULT') {
      if (selectedSpringIds.find(id => springId === id) === undefined) setSelectedSpringIds([springId])
    }

    if (appMode.mode == 'DELETE') {
      const newInitialState = getInitialState()
      newInitialState.springs = newInitialState.springs.filter(({ id }) => id !== springId)
      reset(newInitialState)
    }
  }

  const handleEditAtom = (atomId: number, atom: Particle) => {
    const newInitialState = getInitialState()
    const atomIndex = newInitialState.particles.reduce((atomIndex, { id }, index) => id === atomId ? index : atomIndex, -1)
    newInitialState.particles[atomIndex] = atom
    reset(newInitialState)
  }

  const handleEditSpring = (springId: number, spring: Spring) => {
    const newInitialState = getInitialState()
    const springIndex = newInitialState.springs.reduce((springIndex, { id }, index) => id === springId ? index : springIndex, -1)
    newInitialState.springs[springIndex] = spring
    reset(newInitialState)
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
