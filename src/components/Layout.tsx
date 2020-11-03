import React from 'react'
import styled from 'styled-components'
import { Header } from './Header'
import { Footer } from './Footer'

interface Props {
  children?: React.ReactNode
}

const StyledLayout = styled.div`
  margin: 10px;
`

const Main = styled.main`
  margin: 20px;
`

export const Layout = ({ ...props }: Props): JSX.Element =>
  <StyledLayout>
    <Header />
    <Main>
      {props.children}
    </Main>
    <Footer />
  </StyledLayout>
