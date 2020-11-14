import React from 'react'

interface Props {
  atomId: number
  x: number
  y: number
  color?: string
  handleClick?: (atomId: number, event: React.MouseEvent<SVGCircleElement, MouseEvent>) => void
}

export const Atom = ({ atomId, x, y, color = 'black', handleClick }: Props) => {
  return <circle cx={x} cy={y} r={3} fill={color} onClick={e => { handleClick && handleClick(atomId, e) }} />
}