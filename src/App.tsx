import { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import Loader from './loader'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vs } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import CopyButton from './CopyButton'
import { BsFillPlayFill } from 'react-icons/bs'

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

export default function App() {
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

		const res = await fetch(
			`${import.meta.env.VITE_SERVER_URL}/api/generate_code`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt: prompt, threadId: threadId }),
			}
		)

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
					`${
						import.meta.env.VITE_SERVER_URL
					}/api/threads/${path.slice(1)}`
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
			<div className='flex flex-col justify-center items-center my-4 md:w-4/5 lg:3/5'>
				<h1 className='text-white text-2xl m-2'>Thread</h1>
				<ul className='border rounded-md w-full text-white p-2 m-2'>
					{thread &&
						thread.content &&
						thread.content.map((item, index) => {
							if (item.role !== 'system') {
								return (
									<li
										key={index}
										className={`border-2 m-4 w-1/2 rounded-md border-white p-2 ${
											item.content === prompt
												? 'bg-slate-800'
												: ''
										} ${
											item.role === 'user'
												? 'ml-auto'
												: 'mr-auto'
										}`}
										onClick={() => {
											setPrompt(item.content)

											if (item.role === 'user') {
												if (
													thread.content.length >
														index + 1 &&
													thread.content[index + 1]
														.code !== undefined
												) {
													setGeneratedCode(
														thread.content[
															index + 1
														].code!
													)
												}

												if (
													thread.content.length >
														index + 1 &&
													thread.content[index + 1]
														.output !== undefined
												) {
													setOutput(
														thread.content[
															index + 1
														].output!
													)
												}
											}
										}}>
										<ReactMarkdown
											className='prose dark:prose-invert'
											components={{
												code({ className, children }) {
													const match =
														/language-(\w+)/.exec(
															className || ''
														)
													return match ? (
														<div className='flex flex-row overflow-scroll'>
															<SyntaxHighlighter
																style={
																	vs as any
																}
																language={
																	match[1]
																}
																PreTag='div'
																className='w-full m-0 rounded-md'>
																{String(
																	children
																).replace(
																	/\n$/,
																	''
																)}
															</SyntaxHighlighter>
															<div className='flex flex-col justify-evenly'>
																<button aria-label='run'>
																	<BsFillPlayFill className='m-2 h-6 w-6 dark:text-white' />
																</button>
																<CopyButton
																	content={String(
																		children
																	).replace(
																		/\n$/,
																		''
																	)}
																/>
															</div>
														</div>
													) : (
														<code
															className={
																className
															}>
															{children}
														</code>
													)
												},
											}}>
											{item.content.includes('```')
												? item.content
												: item.role === 'assistant'
												? '```python\n' +
												  item.content +
												  '\n```'
												: item.content}
										</ReactMarkdown>
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
						// readOnly: true,
						minimap: {
							enabled: false,
						},
					}}
					onChange={(value) => {
						setGeneratedCode(value!)
					}}
				/>
				<button
					className='border rounded-md bg-slate-800 text-white p-2 w-1/4'
					onClick={async () => {
						const res = await fetch(
							'http://localhost:3000/api/execute',
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									code: generatedCode,
								}),
							}
						)

						const decoder = new TextDecoder()
						const reader = res.body!.getReader()

						while (true) {
							const { done, value } = await reader.read()
							if (done) {
								break
							}
							console.log(decoder.decode(value))
						}
					}}>
					Run
				</button>
				<code className='border rounded-md w-full text-white p-2 m-2'>
					{output}
				</code>
			</div>
		</div>
	)
}
