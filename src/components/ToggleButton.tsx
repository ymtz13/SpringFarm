import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Props {
  icon: 'play' | 'pause' | 'stop' | 'dot-circle' | 'draw-polygon' | 'trash-alt'
  checked: boolean
  onClick: () => void
}

const StyledToggleButton = styled.button`
  width: 80px;
  height: 40px;
  font-size: 24px;
  background-color: #f3f3f3;
  border-width: 1px;
  border-radius: 4px;

  &:active {
    outline: none;
  }

  &.checked {
    background-color: #c8c8c8;
  }

  &:hover {
    background-color: #dadada;
  }
`

export const ToggleButton = ({ icon, checked, onClick }: Props) =>
  <StyledToggleButton onClick={onClick} className={checked ? 'checked' : ''}>
    <FontAwesomeIcon icon={icon} />
  </StyledToggleButton>
