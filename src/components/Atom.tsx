import React from 'react'
import styled from 'styled-components'

export type AtomClickHandler = (atomId: number, event: React.MouseEvent<SVGCircleElement, MouseEvent>) => void

interface Props {
  atomId: number
  x: number
  y: number
  color?: string
  handleClick?: AtomClickHandler
  selected?: boolean
}

const AtomCircle = styled.circle`
  r: 3;

  &:hover {
    stroke: cyan;
    stroke-width: 1;
  }

  &.selected {
    stroke: orange;
    stroke-width: 1;

    &:hover {
      stroke: cyan;
    }
  }
`

export const Atom = ({ atomId, x, y, color = 'black', handleClick, selected }: Props) => {
  const className = selected ? 'selected' : ''
  const props = { className, cx: x, cy: y, fill: color }
  return <AtomCircle {...props} onClick={e => { handleClick && handleClick(atomId, e) }} />
}