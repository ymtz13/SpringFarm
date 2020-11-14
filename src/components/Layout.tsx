import React from 'react'
import styled from 'styled-components'
//import { Header } from './Header'
//import { Footer } from './Footer'

interface Props {
  children?: React.ReactNode
}

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const Main = styled.main`
  position: relative;
  flex: 1 1 auto;
  overflow: hidden;
`

export const Layout = ({ ...props }: Props): JSX.Element =>
  <StyledLayout>
    <Main>
      {props.children}
    </Main>
  </StyledLayout>
