import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { VideoSlicerPort } from '../../../../src/ports/VideoSlicerPort.js'
import { DirectorCutAnalyzer } from '../../../../src/domain/analysis/DirectorCutAnalyzer.js'

describe('Release v3.5.0 Contract: Concat / Stitch with xfade & Crop Offset / Padding', () => {

	// ─── Task 2: Crop Offset & Padding ───
	describe('Task 2: Crop Offset & Padding (scenes: code=left+100, chat=right-50, etc.)', () => {
		it('should parse align with positive and negative offsets in DirectorCutAnalyzer and VideoSlicerPort', () => {
			const slicer = new VideoSlicerPort()

			// Test left with +100 offset
			const vfLeftOffset = slicer.buildCropFilter({ align: 'left', offsetX: 100 })
			assert.ok(vfLeftOffset.includes('1080:1920'), 'Should scale/crop to vertical 9:16 (1080:1920)')
			assert.ok(
				vfLeftOffset.includes('100') || vfLeftOffset.includes('min(max(0,100),in_w-out_w)') || vfLeftOffset.includes('min(max(0,0+100),in_w-out_w)'),
				`Expected crop expression with offset, got: ${vfLeftOffset}`
			)

			// Test right with -50 offset
			const vfRightOffset = slicer.buildCropFilter({ align: 'right', offsetX: -50 })
			assert.ok(
				vfRightOffset.includes('-50') || vfRightOffset.includes('in_w-out_w-50'),
				`Expected right offset expression, got: ${vfRightOffset}`
			)

			// Test center with +20 offset
			const vfCenterOffset = slicer.buildCropFilter({ align: 'center', offsetX: 20 })
			assert.ok(
				vfCenterOffset.includes('+20') || vfCenterOffset.includes('(in_w-out_w)/2+20') || vfCenterOffset.includes('(in_w-out_w)/2 + 20'),
				`Expected center offset expression, got: ${vfCenterOffset}`
			)
		})

		it('should parse scenes string with offsets (e.g. "code=left+100,chat=right-50")', () => {
			const parsed = VideoSlicerPort.parseSceneSpecs('code=left+100,chat=right-50,present=center+30')
			assert.deepEqual(parsed.code, { align: 'left', offsetX: 100 })
			assert.deepEqual(parsed.chat, { align: 'right', offsetX: -50 })
			assert.deepEqual(parsed.present, { align: 'center', offsetX: 30 })
		})

		it('should apply parsed scene specs with offsets to sliced commands in buildCommands', () => {
			const slicer = new VideoSlicerPort()
			const cutMap = {
				version: 1,
				source: 'raw_recording.mp4',
				aspectRatio: '16:9',
				segments: [
					{ label: 'scene_code_1', start: 10.0, end: 30.0, type: 'scene', align: 'left', offsetX: 100, aspectRatio: '9:16' },
					{ label: 'scene_chat_2', start: 30.0, end: 50.0, type: 'scene', align: 'right', offsetX: -50, aspectRatio: '9:16' },
				]
			}
			const cmds = slicer.buildCommands(cutMap, { outputDir: 'tmp' })
			assert.equal(cmds.length, 2)
			assert.ok(cmds[0].includes('100'), 'Command 1 must include left offset')
			assert.ok(cmds[1].includes('-50'), 'Command 2 must include right offset')
		})
	})

	// ─── Task 1: Concat / Stitch with xfade & acrossfade ───
	describe('Task 1: Concat / Stitch with xfade and acrossfade', () => {
		it('should generate valid FFmpeg filter_complex with xfade and acrossfade for 2 clips', () => {
			const slicer = new VideoSlicerPort()
			const clips = [
				{ path: 'tmp/scene_code_1.mp4', duration: 10.0 },
				{ path: 'tmp/scene_chat_2.mp4', duration: 8.0 }
			]

			const cmd = slicer.buildStitchCommand(clips, {
				outputPath: 'tmp/stitched.mp4',
				transition: 'wipeleft',
				transitionDuration: 0.5
			})

			assert.ok(cmd.includes('-i "tmp/scene_code_1.mp4"'))
			assert.ok(cmd.includes('-i "tmp/scene_chat_2.mp4"'))
			assert.ok(cmd.includes('filter_complex'), 'Must use filter_complex for transition')
			assert.ok(cmd.includes('xfade=transition=wipeleft:duration=0.5:offset=9.5'), `Expected offset 9.5 (10.0 - 0.5), got:\n${cmd}`)
			assert.ok(cmd.includes('acrossfade=d=0.5'), 'Must use acrossfade for audio crossfade')
			assert.ok(cmd.includes('tmp/stitched.mp4'))
		})

		it('should chain xfade and acrossfade sequentially for 3 or more clips', () => {
			const slicer = new VideoSlicerPort()
			const clips = [
				{ path: 'clip1.mp4', duration: 10.0 },
				{ path: 'clip2.mp4', duration: 12.0 },
				{ path: 'clip3.mp4', duration: 8.0 }
			]

			const cmd = slicer.buildStitchCommand(clips, {
				outputPath: 'out.mp4',
				transition: 'fade',
				transitionDuration: 0.5
			})

			// First transition: offset = 10 - 0.5 = 9.5
			// Second transition: offset = 9.5 + 12 - 0.5 = 21.0
			assert.ok(cmd.includes('offset=9.5'), 'First xfade offset should be 9.5')
			assert.ok(cmd.includes('offset=21'), 'Second xfade offset should be 21.0')
			assert.ok(cmd.includes('xfade=transition=fade'), 'Must use fade transition')
		})

		it('should execute stitch via runner and return result', async () => {
			let executedCmd = null
			let executedArgs = null
			const slicer = new VideoSlicerPort({
				runner: async (cmd, args) => {
					executedCmd = cmd
					executedArgs = args
					return { code: 0, stdout: '', stderr: '' }
				}
			})

			const result = await slicer.stitch([
				{ path: 'scene1.mp4', duration: 5.0 },
				{ path: 'scene2.mp4', duration: 6.0 }
			], {
				outputPath: 'tmp/stitched.mp4',
				transition: 'fade',
				transitionDuration: 0.5
			})

			assert.equal(result.outputPath, 'tmp/stitched.mp4')
			assert.equal(result.duration, 10.5, 'Total stitched duration: 5 + 6 - 0.5 = 10.5')
			assert.equal(executedCmd, 'ffmpeg')
			assert.ok(executedArgs.includes('-filter_complex'))
		})
	})

	// ─── Integration: VideoPipelineCommand ───
	describe('VideoPipelineCommand Integration', () => {
		it('should declare stitch, transition, and transitionDuration CLI options', async () => {
			const { VideoPipelineCommand } = await import('../../../../src/domain/commands/VideoPipelineCommand.js')
			assert.equal(typeof VideoPipelineCommand.stitch, 'object')
			assert.equal(VideoPipelineCommand.stitch.type, 'boolean')
			assert.equal(VideoPipelineCommand.stitch.default, false)

			assert.equal(typeof VideoPipelineCommand.transition, 'object')
			assert.equal(VideoPipelineCommand.transition.default, 'fade')

			assert.equal(typeof VideoPipelineCommand.transitionDuration, 'object')
			assert.equal(VideoPipelineCommand.transitionDuration.default, 0.5)
		})
	})
})

