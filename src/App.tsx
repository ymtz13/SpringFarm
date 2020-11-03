import React from 'react';
import logo from './logo.svg';
import { Layout } from './components/Layout'
import { H1 } from './components/Heading'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCannabis } from '@fortawesome/free-solid-svg-icons'
library.add(faCannabis)

function App() {
  return (
    <Layout>
      <H1>Heading</H1>
      children
    </Layout>
  );
}

export default App;
