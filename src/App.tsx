import { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import Loader from './loader'

type Prompt = {
	role: string
	content: string
	code?: string
	output?: string
	runId?: string
}

type Thread = {
	threadId: string
	content: Prompt[]
}

function App() {
	const [prompt, setPrompt] = useState<string>('')
	const [threadId, setThreadId] = useState<string>('')
	const [thread, setThread] = useState<Thread>({} as Thread)

	const [generatedCode, setGeneratedCode] = useState<string>('')
	const [output, setOutput] = useState<string>('')

	const [loading, setLoading] = useState<boolean>(false)

	const handleSubmit = async () => {
		if (prompt === '' || prompt === undefined) {
			return
		}

		setLoading(true)

		const res = await fetch('http://localhost:3001/api/generate_code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ prompt: prompt, threadId: threadId }),
		})

		const data = await res.json()

		console.log(data)

		if (window.location.pathname === '/') {
			window.location.pathname = `/${data.threadId}`
		}

		setGeneratedCode(data.code)
		setOutput(data.output)
		setThread(data.thread)

		setLoading(false)
	}

	useEffect(() => {
		const path = window.location.pathname
		if (path !== '/') {
			setThreadId(path.slice(1))

			const fetchData = async () => {
				const res = await fetch(
					`${import.meta.env.SERVER_URL}/api/threads/${path.slice(1)}`
				)
				const data = await res.json()

				setThread(data)
				setGeneratedCode(data.content[data.content.length - 1].code!)
				setOutput(data.content[data.content.length - 1].output!)
				setPrompt(data.content[data.content.length - 2].content)
			}

			fetchData()
		}
	}, [])

	return (
		<div className='flex flex-col justify-center items-center bg-slate-700 min-h-screen w-screen'>
			<div className='flex flex-col justify-center items-center w-1/2 my-4'>
				<h1 className='text-white text-2xl m-2'>Thread</h1>
				<ul className='border rounded-md w-full text-white p-2 m-2'>
					{thread &&
						thread.content &&
						thread.content.map((item, index) => {
							if (item.role === 'user') {
								return (
									<li
										key={index}
										onClick={() => {
											setPrompt(item.content)

											if (
												thread.content.length >
													index + 1 &&
												thread.content[index + 1]
													.code !== undefined
											) {
												setGeneratedCode(
													thread.content[index + 1]
														.code!
												)
											}

											if (
												thread.content.length >
													index + 1 &&
												thread.content[index + 1]
													.output !== undefined
											) {
												setOutput(
													thread.content[index + 1]
														.output!
												)
											}
										}}>
										{item.content}
									</li>
								)
							}
						})}
				</ul>
			</div>
			<div className='flex flex-col w-1/2 justify-center items-center'>
				<h1 className='text-white text-2xl my-4'>
					Enter Prompt to genrate code
				</h1>
				<input
					type='text'
					value={prompt}
					placeholder='Enter a prompt'
					className='border-2 border-black p-2 rounded-md mb-4 w-full'
					onChange={(e) => setPrompt(e.target.value)}
				/>

				<button
					className='border rounded-md bg-slate-800 text-white p-2 w-1/4'
					onClick={handleSubmit}>
					Submit
				</button>
			</div>
			<div className='m-2'>{loading && <Loader />}</div>
			<div className='flex flex-col justify-center items-center w-1/2'>
				<h1 className='text-white text-2xl m-2'>Output</h1>
				<Editor
					width={'100%'}
					height={'50vh'}
					theme='vs-dark'
					className='border rounded-md w-full m-2'
					defaultLanguage='python'
					value={generatedCode}
					options={{
						readOnly: true,
						minimap: {
							enabled: false,
						},
					}}
				/>
				<code className='border rounded-md w-full text-white p-2 m-2'>
					{output}
				</code>
			</div>
		</div>
	)
}

export default App
