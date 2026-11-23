import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_0_1_0_3 } from './v0.1.0_3'
import { v_0_1_0_7 } from './v0.1.0_7'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_0_1_0_3, v_0_1_0_7],
})
