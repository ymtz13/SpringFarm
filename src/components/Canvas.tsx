import React from 'react'
import styled from 'styled-components'
import { State } from '../hooks/useSimulator'
import { Mode } from './SpringFarmCore'
import { Atom, AtomClickHandler } from './Atom'
import { Spring, SpringClickHandler } from './Spring'

interface Props {
  state: State
  appMode: Mode
  setAppMode: React.Dispatch<Mode>
  selectedAtomIds: number[]
  svgRef: React.RefObject<SVGSVGElement>
  handleMouseMove: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
  handleMouseClick: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
  handleKeyPress: (event: React.KeyboardEvent<SVGSVGElement>) => void
  handleAtomClick: AtomClickHandler
  handleSpringClick: SpringClickHandler
  cursorPosition: DOMPoint
}

const StyledCanvas = styled.svg`

`

export const Canvas = ({
  state,
  appMode,
  selectedAtomIds,
  svgRef,
  handleMouseMove,
  handleMouseClick,
  handleKeyPress,
  handleAtomClick,
  handleSpringClick,
  cursorPosition,
}: Props) => {

  return (
    <StyledCanvas
      className="canvas"
      viewBox="-100 -100 201 201"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      ref={svgRef}
      onMouseMove={handleMouseMove}
      onClick={handleMouseClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
    >
      <Grid />

      {state.springs.map(({ atomIndex1, atomIndex2, req, k }, i) =>
        <Spring key={'s' + i} springId={i} p1={state.particles[atomIndex1]} p2={state.particles[atomIndex2]} req={req} k={k} handleClick={handleSpringClick} />
      )}
      {appMode.mode === 'ADD_SPRING' && appMode.endpointAtomId !== undefined &&
        <line
          x1={state.particles[appMode.endpointAtomId].x}
          y1={state.particles[appMode.endpointAtomId].y}
          x2={cursorPosition.x}
          y2={cursorPosition.y}
          strokeWidth={.5}
          stroke='gray' />
      }

      {state.particles.map(({ id, x, y, color }) =>
        <Atom key={id} atomId={id} x={x} y={y} color={color} handleClick={handleAtomClick}
          selected={selectedAtomIds.find(selectedAtomId => selectedAtomId === id) !== undefined}
        />
      )}

      {appMode.mode === 'ADD_ATOM' && <circle cx={cursorPosition.x} cy={cursorPosition.y} r={3} fill={'rgba(70, 70, 70, 0.5)'} />}

    </StyledCanvas>

  )
}

const Grid = React.memo(() => {
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
})
