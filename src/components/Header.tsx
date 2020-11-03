import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  width: 100%;
  border: 1px solid black;
`

const PageTitle = styled.div`
  padding: 0 0 0 20px;
  font-size: 30px;
  font-weight: bold;
  line-height: 60px;
`

const NavigationBar = styled.div`
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: gray;
  
  color: white;
  font-weight: bold;
  text-align: center;
`



export const Header = () =>
  <StyledHeader>
    <PageTitle><FontAwesomeIcon icon="cannabis" fixedWidth />Page Title</PageTitle>
    <NavigationBar>
      Link
    </NavigationBar>
  </StyledHeader>
