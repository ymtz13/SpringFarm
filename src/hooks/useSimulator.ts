import { useCallback, useReducer, useState } from 'react'

export type Particle = {
  id: number
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
  id: number
  atomId1: number
  atomId2: number
  req: number
  k: number
}

export type InitialState = {
  particles: Particle[]
  springs: Spring[]
}

export type IndexResolvedSpring =
  & Omit<Spring, 'atomId1' | 'atomId2'>
  & { atomIndex1: number, atomIndex2: number }

export type State = {
  frame: number
  particles: Particle[]
  springs: IndexResolvedSpring[]
}

const dt = 0.1
const dt_2 = dt / 2

function calcForce(particles: Particle[], springs: IndexResolvedSpring[]): void {
  particles.forEach(particles => { particles.fx = particles.fy = 0 })
  springs.forEach(({ atomIndex1, atomIndex2, req, k }) => {
    const particle1 = particles[atomIndex1]
    const particle2 = particles[atomIndex2]
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

type Propagate = { type: 'Propagate' }
type Reset = { type: 'Reset', initialState: InitialState }

export type Action = Propagate | Reset

function reducer(state: State, action: Action): State {
  if (action.type === 'Reset') {
    console.log('reset', action.initialState)
    return initState(action.initialState)
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

function copyInitialState(initialState: InitialState): InitialState {
  return {
    particles: initialState.particles.map(particle => ({ ...particle })),
    springs: initialState.springs.map(spring => ({ ...spring })),
  }
}

function initState(initialState: InitialState): State {
  const atomId2IndexMap = initialState.particles.reduce<{ [atomId: number]: number }>(
    (atomId2IndexMap, particle, index) => ({ ...atomId2IndexMap, [particle.id]: index }), {}
  )
  const indexResolvedSpring: IndexResolvedSpring[] = initialState.springs.map(spring => {
    const { atomId1, atomId2, ...otherProps } = spring
    return { ...otherProps, atomIndex1: atomId2IndexMap[atomId1], atomIndex2: atomId2IndexMap[atomId2] }
  })

  return {
    frame: 0,
    particles: initialState.particles.map(particle => ({ ...particle })),
    springs: indexResolvedSpring,
  }
}

export function useSimulator(defaultInitialState: InitialState) {
  const [initialState, setInitialState] = useState<InitialState>(defaultInitialState)
  const [state, updateState] = useReducer(reducer, initState(initialState))

  const getInitialState = useCallback(() => copyInitialState(initialState), [initialState])

  const reset = useCallback((newInitialState?: InitialState) => {
    if (newInitialState) setInitialState(newInitialState)
    updateState({ type: 'Reset', initialState: newInitialState || initialState })
  }, [initialState])

  const propagate = useCallback(() => updateState({ type: 'Propagate' }), [])

  return { getInitialState, reset, propagate, state }
  //return { initialState, setInitialState, state, updateState }
}
