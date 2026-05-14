import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import Playground from '../../../../../../play/Playground.jsx'

describe('Playground Dynamic Components - Release 0.2.2', () => {
	it('1. should hide base registry when disableBaseRegistry is true', () => {
		const { queryByText } = render(<Playground disableBaseRegistry={true} />)

		// Nav block from base registry should not be visible
		expect(queryByText('📦 Blocks.Nav')).toBeNull()
	})

	it('2. should dynamically render extraComponents and label them correctly', () => {
		const ShellComponent = () => <div data-testid="shell-div">Shell Data</div>
		const { getByText } = render(
			<Playground
				disableBaseRegistry={true}
				extraComponents={{
					ShellProductCard: {
						component: ShellComponent,
						label: 'Bank Product Card',
					},
				}}
			/>,
		)

		expect(getByText('📦 ShellProductCard')).toBeInTheDocument()
		expect(getByText('Bank Product Card')).toBeInTheDocument()
		expect(getByText('Shell Data')).toBeInTheDocument()
	})

	it('3. should display rawmeta data as YAML format string', () => {
		const ShellComponent = () => <div data-testid="shell-div">Shell Data</div>
		const sampleYaml = 'title: Bank\\ndescription: Good'
		const { getByText } = render(
			<Playground
				disableBaseRegistry={true}
				components={{
					ShellComponent: {
						component: ShellComponent,
						label: 'YAML Test Component',
						meta: sampleYaml,
					},
				}}
			/>,
		)

		// Header for the raw metadata should explicitly mention YAML
		expect(getByText('Meta Data (YAML)')).toBeInTheDocument()
		// And the raw text should be present
		expect(getByText(sampleYaml)).toBeInTheDocument()
	})
})
