import React from 'react';
import { SpringFarmCore } from './components/SpringFarmCore'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPlay,
  faPause,
  faStop,
  faDotCircle,
  faDrawPolygon,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons'
library.add(faPlay)
library.add(faPause)
library.add(faStop)
library.add(faDotCircle)
library.add(faDrawPolygon)
library.add(faTrashAlt)

function App() {
  return <SpringFarmCore />
}

export default App;
