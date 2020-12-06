import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { State, Particle, Spring } from '../hooks/useSimulator'
import { Mode } from './SpringFarmCore'
import { ToggleButton } from './ToggleButton'

interface Props {
  state: State
  appMode: Mode
  setAppMode: React.Dispatch<Mode>
  selectedAtomIds: number[]
  selectedSpringIds: number[]

  handleEditAtom: (atomId: number, atom: Particle) => void
  handleEditSpring: (springId: number, spring: Spring) => void
}

const StyledSidePane = styled.div`
  background-color: #f3f3f3;
  width: 300px;
`

const StyledSection = styled.div`
  padding: 8px;
`

const StyledButtonContainer = styled.div`
  display: flex;

  button {
    flex: 1 1 auto;
  }
`

export const SidePane = ({
  state,
  //play, setPlay,
  appMode, setAppMode,
  selectedAtomIds, handleEditAtom,
  selectedSpringIds, handleEditSpring,
}: Props) => {
  return (
    <StyledSidePane>
      <StyledSection>
        <StyledButtonContainer>
          <ToggleButton icon='play' checked={appMode.mode === 'PLAY' && !appMode.pause} onClick={() => { setAppMode({ mode: 'PLAY', pause: false }) }} />
          <ToggleButton icon='pause' checked={appMode.mode === 'PLAY' && appMode.pause} onClick={() => { setAppMode({ mode: 'PLAY', pause: true }) }} />
          <ToggleButton icon='stop' checked={appMode.mode !== 'PLAY'} onClick={() => { setAppMode({ mode: 'DEFAULT' }) }} />
        </StyledButtonContainer>
        <StyledButtonContainer>
          <ToggleButton icon='dot-circle' checked={appMode.mode === 'ADD_ATOM'} onClick={() => { setAppMode({ mode: 'ADD_ATOM' }) }} />
          <ToggleButton icon='draw-polygon' checked={appMode.mode === 'ADD_SPRING'} onClick={() => { setAppMode({ mode: 'ADD_SPRING' }) }} />
          <ToggleButton icon='trash-alt' checked={appMode.mode === 'DELETE'} onClick={() => { setAppMode({ mode: 'DELETE' }) }} />
        </StyledButtonContainer>
      </StyledSection>
      <AtomEditPane state={state} selectedAtomIds={selectedAtomIds} editable={appMode.mode !== 'PLAY'} handleChange={handleEditAtom} />
      <SpringEditPane state={state} selectedSpringIds={selectedSpringIds} editable={appMode.mode !== 'PLAY'} handleChange={handleEditSpring} />
    </StyledSidePane>
  )
}

const StyledEditField = styled.div`
  display: flex;

  label {
    width: 40%;
  }

  input {
    width: 60%;
  }
`

interface AtomEditPaneProps {
  state: State
  selectedAtomIds: number[]
  editable: boolean
  handleChange: (atomId: number, atom: Particle) => void
}

const AtomEditPane = ({ state, selectedAtomIds, editable, handleChange }: AtomEditPaneProps) => {
  const { particles } = state
  const selected1stAtomId = selectedAtomIds[0]
  const selected1stAtom = particles.find(({ id }) => id === selected1stAtomId)

  const [inputState, setInputState] = useState({ mass: 1, x: 0, y: 0, vx: 0, vy: 0 })
  useEffect(() => {
    if (selected1stAtom) setInputState(selected1stAtom)
  }, [editable, selected1stAtomId])

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected1stAtom) return

    const { name, value } = event.target
    setInputState(inputState => ({ ...inputState, [name]: value }))

    const atom: Particle = { ...selected1stAtom, [event.target.name]: parseFloat(event.target.value || '0') }
    console.log(selectedAtomIds, selected1stAtom, atom)
    handleChange(selected1stAtomId, atom)
  }

  const displayValue = editable ? inputState : selected1stAtom

  return (
    <StyledSection>
      <div>Atom ID: {selectedAtomIds.join(',')}</div>
      {selectedAtomIds.length > 0 && displayValue &&
        <>
          <StyledEditField>
            <label>mass</label>
            <input readOnly={!editable} onChange={onChange} name="mass" value={displayValue.mass} />
          </StyledEditField>
          <StyledEditField>
            <label>x</label>
            <input readOnly={!editable} onChange={onChange} name="x" value={displayValue.x} />
          </StyledEditField>
          <StyledEditField>
            <label>y</label>
            <input readOnly={!editable} onChange={onChange} name="y" value={displayValue.y} />
          </StyledEditField>
          <StyledEditField>
            <label>vx</label>
            <input readOnly={!editable} onChange={onChange} name="vx" value={displayValue.vx} />
          </StyledEditField>
          <StyledEditField>
            <label>vy</label>
            <input readOnly={!editable} onChange={onChange} name="vy" value={displayValue.vy} />
          </StyledEditField>
        </>
      }
    </StyledSection>
  )
}

interface SpringEditPaneProps {
  state: State
  selectedSpringIds: number[]
  editable: boolean
  handleChange: (springId: number, spring: Spring) => void
}

const SpringEditPane = ({ state, selectedSpringIds, editable, handleChange }: SpringEditPaneProps) => {
  const { springs } = state
  const selected1stSpringId = selectedSpringIds[0]
  const selected1stSpring = springs[selected1stSpringId]

  const atomId1 = state.particles[selected1stSpring?.atomIndex1]?.id
  const atomId2 = state.particles[selected1stSpring?.atomIndex2]?.id

  const [inputState, setInputState] = useState({ req: 0, k: 0 })
  useEffect(() => {
    if (selected1stSpring) setInputState(selected1stSpring)
  }, [editable, selected1stSpringId])

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setInputState(inputState => ({ ...inputState, [name]: value }))

    const spring: Spring = {
      ...selected1stSpring, atomId1, atomId2,
      [event.target.name]: Number(event.target.value || '0')
    }
    handleChange(selected1stSpringId, spring)
  }

  const displayValue = editable ? inputState : selected1stSpring

  return (
    <StyledSection>
      <div>Atom ID: {selectedSpringIds.join(',')}</div>
      <div>p1: {atomId1}  p2: {atomId2}</div>
      {selectedSpringIds.length > 0 &&
        <>
          <StyledEditField>
            <label>req</label>
            <input readOnly={!editable} onChange={onChange} name="req" value={displayValue.req} />
          </StyledEditField>
          <StyledEditField>
            <label>k</label>
            <input readOnly={!editable} onChange={onChange} name="k" value={displayValue.k} />
          </StyledEditField>
        </>
      }
    </StyledSection>
  )
}

