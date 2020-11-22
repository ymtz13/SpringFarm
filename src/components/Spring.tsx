import React from 'react'
import styled from 'styled-components'
import { Particle } from './SpringFarmCore'

export type SpringClickHandler = (springId: number, event: React.MouseEvent<SVGLineElement, MouseEvent>) => void

interface Props {
  springId: number
  p1: Particle
  p2: Particle
  req: number
  k: number
  handleClick?: SpringClickHandler
  selected?: boolean
}

const SpringLine = styled.line`
  &.core {
    stroke: gray;
    stroke-width: .5;
    pointer-events: none;
  }

  &.linecap {
    stroke: transparent;
    stroke-width: 5;

    :hover {
      stroke: cyan;
    }
  }
` 

export const Spring = ({ springId, p1, p2, req, k, handleClick }: Props) => {
  return (
    <>
      <SpringLine className="linecap" x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} onClick={e => { handleClick && handleClick(springId, e) }} />
      <SpringLine className="core" x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />
    </>
  )
}
