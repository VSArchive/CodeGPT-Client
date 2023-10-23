import { useEffect, useState } from 'react'

type Prompt = {
	role: string
	content: string
	code?: string
	output?: string
	runId?: string
}

type Thread = {
	thread_id: string
	content: Prompt[]
}

type Threads = {
	[thread_id: string]: Thread
}

export default function Home() {
	const [prompt, setPrompt] = useState<string>('')
	const [threads, setThreads] = useState<Threads>({} as Threads)

	const handleSubmit = async () => {
		if (prompt === '' || prompt === undefined) {
			return
		}

		const res = await fetch(
			`${import.meta.env.VITE_SERVER_URL}/api/generate_code`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt: prompt, threadId: '' }),
			}
		)

		const data = await res.json()

		window.location.pathname = `/${data.threadId}`
	}

	useEffect(() => {
		const fetchData = async () => {
			const res = await fetch(
				`${import.meta.env.VITE_SERVER_URL}/api/threads`
			)
			const data = await res.json()

			setThreads(data)
		}

		fetchData()
	}, [])

	return (
		<div className='flex flex-col justify-center items-center bg-slate-700 min-h-screen w-screen'>
			<div className='flex flex-col justify-center items-center w-1/2 my-4'>
				<h1 className='text-white text-2xl m-2'>Previous Thread</h1>
				<ul className='border rounded-md w-full text-white p-2 m-2'>
					{threads &&
						Object.keys(threads).map((item, index) => {
							return (
								<li
									key={index}
									onClick={() => {
										window.location.href = `/${item}`
									}}>
									{threads[item].content[1].content}
								</li>
							)
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
		</div>
	)
}
