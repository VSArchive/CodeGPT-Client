'use client'

import { HiOutlineClipboard, HiClipboardCheck } from 'react-icons/hi'
import { useState } from 'react'

export default function CopyButton({ content }: { content: string }) {
	const [copied, setCopied] = useState(false)
	return (
		<button
			aria-label='copy'
			onClick={() => {
				setCopied(true)
				navigator.clipboard.writeText(
					String(content).replace(/\n$/, '')
				)
				setTimeout(() => {
					setCopied(false)
				}, 2000)
			}}>
			{copied ? (
				<HiClipboardCheck className='m-2 h-6 w-6 dark:text-white' />
			) : (
				<HiOutlineClipboard className='m-2 h-6 w-6 dark:text-white' />
			)}
		</button>
	)
}
