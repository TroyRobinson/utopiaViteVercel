import * as React from 'react'
import { Scene, Storyboard } from 'utopia-api'
import { App } from '../src/app'
import { App2 } from '../src/app2'
import { Playground } from '../src/playground'

export var storyboard = (
  <Storyboard>
    <Scene
      id='playground-scene'
      commentId='playground-scene'
      style={{
        width: 700,
        height: 759,
        position: 'absolute',
        left: 212,
        top: 128,
      }}
      data-label='Playground'
    >
      <Playground style={{}} />
    </Scene>
    <Scene
      id='app-scene'
      commentId='app-scene'
      style={{
        width: 744,
        height: 1133,
        position: 'absolute',
        left: 992,
        top: 128,
      }}
      data-label='My App'
    >
      <App />
    </Scene>
    <Scene
      id='app2-scene'
      commentId='app2-scene'
      style={{
        width: 700,
        height: 700,
        position: 'absolute',
        left: 1808,
        top: 128,
      }}
      data-label='App2'
    >
      <App2 style={{}} />
    </Scene>
  </Storyboard>
)
